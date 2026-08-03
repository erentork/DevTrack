using DevTrack.API.DTOs.Auth;
using DevTrack.API.DTOs.Users;

namespace DevTrack.API.Interfaces.Services;

public interface IUserService
{
    Task RegisterAsync(RegisterRequest request);

    Task<LoginResponse> LoginAsync(LoginRequest request);

    Task<UserProfileResponse> GetProfileAsync(
        Guid userId);

    Task<UserProfileResponse> UpdateProfileAsync(
        Guid userId,
        UpdateProfileRequest request);

    Task<UserProfileResponse> UpdateAvatarAsync(
        Guid userId,
        UpdateAvatarRequest request);

    Task ChangePasswordAsync(
        Guid userId,
        ChangePasswordRequest request);
}