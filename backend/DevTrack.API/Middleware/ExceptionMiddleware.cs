using System.Text.Json;
using DevTrack.API.Exceptions;

namespace DevTrack.API.Middleware;

public sealed class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;

    public ExceptionMiddleware(
        RequestDelegate next,
        ILogger<ExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(
        HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception exception)
        {
            if (context.Response.HasStarted)
            {
                _logger.LogWarning(
                    exception,
                    "An exception occurred after the response had already started."
                );

                throw;
            }

            await HandleExceptionAsync(
                context,
                exception
            );
        }
    }

    private async Task HandleExceptionAsync(
        HttpContext context,
        Exception exception)
    {
        var (statusCode, clientMessage) =
            exception switch
            {
                ConflictException =>
                    (
                        StatusCodes.Status409Conflict,
                        exception.Message
                    ),

                NotFoundException =>
                    (
                        StatusCodes.Status404NotFound,
                        exception.Message
                    ),

                UnauthorizedException =>
                    (
                        StatusCodes.Status401Unauthorized,
                        exception.Message
                    ),

                _ =>
                    (
                        StatusCodes.Status500InternalServerError,
                        "An unexpected error occurred."
                    )
            };

        if (statusCode >= 500)
        {
            _logger.LogError(
                exception,
                "Unhandled exception while processing {Method} {Path}.",
                context.Request.Method,
                context.Request.Path
            );
        }
        else
        {
            _logger.LogWarning(
                "Request failed with status code {StatusCode}: {Message}",
                statusCode,
                exception.Message
            );
        }

        context.Response.Clear();
        context.Response.StatusCode = statusCode;
        context.Response.ContentType =
            "application/json; charset=utf-8";

        var response = new
        {
            success = false,
            message = clientMessage
        };

        var json = JsonSerializer.Serialize(
            response
        );

        await context.Response.WriteAsync(
            json
        );
    }
}