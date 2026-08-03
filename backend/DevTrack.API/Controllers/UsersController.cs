using System.IdentityModel.Tokens.Jwt;
using DevTrack.API.Common;
using DevTrack.API.DTOs.Users;
using DevTrack.API.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace DevTrack.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(
        IUserService userService)
    {
        _userService = userService;
    }

    [HttpPost("register")]
    [AllowAnonymous]
    [EnableRateLimiting("register")]
    public async Task<IActionResult> Register(
        RegisterRequest request)
    {
        await _userService.RegisterAsync(
            request
        );

        return Ok(
            new ApiResponse<object>
            {
                Success = true,
                Message =
                    "Kullanıcı başarıyla oluşturuldu.",
                Data = null
            }
        );
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetProfile()
    {
        if (!TryGetUserId(
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

    [HttpPut("me")]
    public async Task<IActionResult> UpdateProfile(
        UpdateProfileRequest request)
    {
        if (!TryGetUserId(
                out var userId))
        {
            return Unauthorized();
        }

        var response =
            await _userService
                .UpdateProfileAsync(
                    userId,
                    request
                );

        return Ok(response);
    }

    [HttpPut("me/avatar")]
    public async Task<IActionResult> UpdateAvatar(
        UpdateAvatarRequest request)
    {
        if (!TryGetUserId(
                out var userId))
        {
            return Unauthorized();
        }

        var response =
            await _userService
                .UpdateAvatarAsync(
                    userId,
                    request
                );

        return Ok(response);
    }

    [HttpPut("me/password")]
    public async Task<IActionResult> ChangePassword(
        ChangePasswordRequest request)
    {
        if (!TryGetUserId(
                out var userId))
        {
            return Unauthorized();
        }

        await _userService
            .ChangePasswordAsync(
                userId,
                request
            );

        return Ok(
            new ApiResponse<object>
            {
                Success = true,
                Message =
                    "Şifre başarıyla güncellendi.",
                Data = null
            }
        );
    }

    private bool TryGetUserId(
        out Guid userId)
    {
        var userIdValue = User
            .FindFirst(
                JwtRegisteredClaimNames.Sub
            )
            ?.Value;

        return Guid.TryParse(
            userIdValue,
            out userId
        );
    }
}
