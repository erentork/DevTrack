using System.Text;
using System.Threading.RateLimiting;
using DevTrack.API.Data;
using DevTrack.API.Extensions;
using DevTrack.API.Interfaces.Repositories;
using DevTrack.API.Interfaces.Services;
using DevTrack.API.Repositories;
using DevTrack.API.Services;
using DevTrack.API.Validators;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

var connectionString =
    builder.Configuration.GetConnectionString(
        "DefaultConnection"
    );

if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException(
        "ConnectionStrings:DefaultConnection is not configured."
    );
}

var jwtSettings =
    builder.Configuration.GetSection("Jwt");

var jwtKey = jwtSettings["Key"];

if (string.IsNullOrWhiteSpace(jwtKey))
{
    throw new InvalidOperationException(
        "Jwt:Key is not configured."
    );
}

var allowedOrigins = new List<string>
{
    "http://localhost:5173",
    "http://127.0.0.1:5173"
};

var frontendUrl =
    builder.Configuration["FrontendUrl"];

if (!string.IsNullOrWhiteSpace(frontendUrl))
{
    allowedOrigins.Add(
        frontendUrl.TrimEnd('/')
    );
}

var distinctAllowedOrigins =
    allowedOrigins
        .Distinct(
            StringComparer.OrdinalIgnoreCase
        )
        .ToArray();

builder.Services.Configure<
    ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders =
        ForwardedHeaders.XForwardedFor |
        ForwardedHeaders.XForwardedProto;

    options.ForwardLimit = 1;

    // Render terminates the public connection at its reverse proxy.
    // The app receives the forwarded client address from that proxy.
    options.KnownNetworks.Clear();
    options.KnownProxies.Clear();
});

builder.Services.AddControllers();

builder.Services.AddDbContext<
    AppDbContext>(options =>
{
    options.UseNpgsql(
        connectionString
    );
});

builder.Services
    .AddAuthentication(
        JwtBearerDefaults.AuthenticationScheme
    )
    .AddJwtBearer(options =>
    {
        options.MapInboundClaims = false;

        options.TokenValidationParameters =
            new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,

                ValidIssuer =
                    jwtSettings["Issuer"],

                ValidAudience =
                    jwtSettings["Audience"],

                IssuerSigningKey =
                    new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(
                            jwtKey
                        )
                    )
            };
    });

builder.Services.AddAuthorization();

builder.Services.AddCors(options =>
{
    options.AddPolicy(
        "Frontend",
        policy =>
        {
            policy
                .WithOrigins(
                    distinctAllowedOrigins
                )
                .AllowAnyHeader()
                .AllowAnyMethod();
        }
    );
});

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode =
        StatusCodes.Status429TooManyRequests;

    options.OnRejected =
        async (
            rejectionContext,
            cancellationToken) =>
        {
            rejectionContext
                .HttpContext
                .Response
                .ContentType =
                    "application/json; charset=utf-8";

            await rejectionContext
                .HttpContext
                .Response
                .WriteAsJsonAsync(
                    new
                    {
                        success = false,
                        message =
                            "Too many requests. Please wait and try again."
                    },
                    cancellationToken
                );
        };

    options.AddPolicy(
        "login",
        httpContext =>
            RateLimitPartition
                .GetFixedWindowLimiter(
                    partitionKey:
                        GetClientIdentifier(
                            httpContext
                        ),

                    factory:
                        _ =>
                            new FixedWindowRateLimiterOptions
                            {
                                PermitLimit = 10,
                                Window =
                                    TimeSpan.FromMinutes(1),
                                QueueLimit = 0,
                                AutoReplenishment = true
                            }
                )
    );

    options.AddPolicy(
        "register",
        httpContext =>
            RateLimitPartition
                .GetFixedWindowLimiter(
                    partitionKey:
                        GetClientIdentifier(
                            httpContext
                        ),

                    factory:
                        _ =>
                            new FixedWindowRateLimiterOptions
                            {
                                PermitLimit = 3,
                                Window =
                                    TimeSpan.FromMinutes(1),
                                QueueLimit = 0,
                                AutoReplenishment = true
                            }
                )
    );
});

builder.Services.AddHealthChecks();

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc(
        "v1",
        new OpenApiInfo
        {
            Title = "DevTrack API",
            Version = "v1"
        }
    );

    options.AddSecurityDefinition(
        "Bearer",
        new OpenApiSecurityScheme
        {
            Name = "Authorization",
            Type = SecuritySchemeType.Http,
            Scheme = "Bearer",
            BearerFormat = "JWT",
            In = ParameterLocation.Header,
            Description = "JWT tokenınızı girin."
        }
    );

    options.AddSecurityRequirement(
        new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference =
                        new OpenApiReference
                        {
                            Type =
                                ReferenceType
                                    .SecurityScheme,

                            Id = "Bearer"
                        }
                },

                Array.Empty<string>()
            }
        }
    );
});

builder.Services.AddScoped<
    IUserRepository,
    UserRepository>();

builder.Services.AddScoped<
    IProjectRepository,
    ProjectRepository>();

builder.Services.AddScoped<
    ITaskRepository,
    TaskRepository>();

builder.Services.AddScoped<
    IDashboardRepository,
    DashboardRepository>();

builder.Services.AddScoped<
    ISearchRepository,
    SearchRepository>();

builder.Services.AddScoped<
    INotificationRepository,
    NotificationRepository>();

builder.Services.AddScoped<
    IJwtService,
    JwtService>();

builder.Services.AddScoped<
    IUserService,
    UserService>();

builder.Services.AddScoped<
    IProjectService,
    ProjectService>();

builder.Services.AddScoped<
    ITaskService,
    TaskService>();

builder.Services.AddScoped<
    IDashboardService,
    DashboardService>();

builder.Services.AddScoped<
    ISearchService,
    SearchService>();

builder.Services.AddScoped<
    INotificationService,
    NotificationService>();

builder.Services
    .AddFluentValidationAutoValidation();

builder.Services
    .AddValidatorsFromAssemblyContaining<
        RegisterRequestValidator>();

var app = builder.Build();

using (var scope =
       app.Services.CreateScope())
{
    var dbContext =
        scope.ServiceProvider
            .GetRequiredService<
                AppDbContext>();

    await dbContext.Database
        .MigrateAsync();
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseHttpsRedirection();
}

app.UseForwardedHeaders();

app.UseGlobalExceptionHandling();

app.UseRouting();

app.UseCors("Frontend");

app.UseRateLimiter();

app.UseAuthentication();

app.UseAuthorization();

app.MapGet(
    "/",
    () => Results.Ok(
        new
        {
            service =
                "DevTrack API",

            status =
                "running"
        }
    )
);

app.MapHealthChecks("/health");

app.MapControllers();

app.Run();

static string GetClientIdentifier(
    HttpContext httpContext)
{
    return httpContext
               .Connection
               .RemoteIpAddress
               ?.ToString()
           ?? "unknown-client";
}
