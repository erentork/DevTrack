using System.IdentityModel.Tokens.Jwt;
using DevTrack.API.DTOs.Auth;
using DevTrack.API.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace DevTrack.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IUserService _userService;

    public AuthController(
        IUserService userService)
    {
        _userService = userService;
    }

    [HttpPost("login")]
    [AllowAnonymous]
    [EnableRateLimiting("login")]
    public async Task<IActionResult> Login(
        LoginRequest request)
    {
        var result =
            await _userService.LoginAsync(
                request
            );

        return Ok(result);
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> Me()
    {
        var userIdValue = User
            .FindFirst(
                JwtRegisteredClaimNames.Sub
            )
            ?.Value;

        if (!Guid.TryParse(
                userIdValue,
                out var userId))
        {
            return Unauthorized();
        }

        var response =
            await _userService
                .GetProfileAsync(
                    userId
                );

        return Ok(response);
    }
}
