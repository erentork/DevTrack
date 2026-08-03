using DevTrack.API.Common;
using DevTrack.API.DTOs.Auth;
using DevTrack.API.DTOs.Users;
using DevTrack.API.Entities;
using DevTrack.API.Exceptions;
using DevTrack.API.Interfaces.Repositories;
using DevTrack.API.Interfaces.Services;

namespace DevTrack.API.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;
    private readonly IJwtService _jwtService;

    public UserService(
        IUserRepository userRepository,
        IJwtService jwtService)
    {
        _userRepository = userRepository;
        _jwtService = jwtService;
    }

    public async Task RegisterAsync(
        RegisterRequest request)
    {
        var normalizedEmail =
            request.Email.Trim().ToLowerInvariant();

        var normalizedUsername =
            request.Username.Trim();

        var existingEmailUser =
            await _userRepository.GetByEmailAsync(
                normalizedEmail);

        if (existingEmailUser != null)
        {
            throw new ConflictException(
                "Bu e-posta zaten kayıtlı.");
        }

        var existingUsernameUser =
            await _userRepository.GetByUsernameAsync(
                normalizedUsername);

        if (existingUsernameUser != null)
        {
            throw new ConflictException(
                "Bu kullanıcı adı zaten kullanılıyor.");
        }

        var user = new User
        {
            Username = normalizedUsername,
            Email = normalizedEmail,
            PasswordHash =
                BCrypt.Net.BCrypt.HashPassword(
                    request.Password),
            AvatarKey = AvatarOptions.DefaultKey
        };

        await _userRepository.AddAsync(user);
    }

    public async Task<LoginResponse> LoginAsync(
        LoginRequest request)
    {
        var normalizedEmail =
            request.Email.Trim().ToLowerInvariant();

        var user =
            await _userRepository.GetByEmailAsync(
                normalizedEmail);

        if (user == null)
        {
            throw new UnauthorizedException(
                "E-posta veya şifre hatalı.");
        }

        var passwordValid =
            BCrypt.Net.BCrypt.Verify(
                request.Password,
                user.PasswordHash);

        if (!passwordValid)
        {
            throw new UnauthorizedException(
                "E-posta veya şifre hatalı.");
        }

        var token =
            _jwtService.GenerateToken(user);

        return new LoginResponse
        {
            Token = token,
            ExpireAt =
                DateTime.UtcNow.AddMinutes(60)
        };
    }

    public async Task<UserProfileResponse> GetProfileAsync(
        Guid userId)
    {
        var user =
            await GetCurrentUserAsync(userId);

        return MapToProfileResponse(user);
    }

    public async Task<UserProfileResponse> UpdateProfileAsync(
        Guid userId,
        UpdateProfileRequest request)
    {
        var user =
            await GetCurrentUserAsync(userId);

        var normalizedEmail =
            request.Email.Trim().ToLowerInvariant();

        var normalizedUsername =
            request.Username.Trim();

        var emailOwner =
            await _userRepository.GetByEmailAsync(
                normalizedEmail);

        if (
            emailOwner != null &&
            emailOwner.Id != user.Id
        )
        {
            throw new ConflictException(
                "Bu e-posta başka bir kullanıcı tarafından kullanılıyor.");
        }

        var usernameOwner =
            await _userRepository.GetByUsernameAsync(
                normalizedUsername);

        if (
            usernameOwner != null &&
            usernameOwner.Id != user.Id
        )
        {
            throw new ConflictException(
                "Bu kullanıcı adı başka bir kullanıcı tarafından kullanılıyor.");
        }

        user.Username = normalizedUsername;
        user.Email = normalizedEmail;
        user.UpdatedAt = DateTime.UtcNow;

        await _userRepository.UpdateAsync(user);

        return MapToProfileResponse(user);
    }

    public async Task<UserProfileResponse> UpdateAvatarAsync(
        Guid userId,
        UpdateAvatarRequest request)
    {
        var user =
            await GetCurrentUserAsync(userId);

        if (!AvatarOptions.IsValid(request.AvatarKey))
        {
            throw new ConflictException(
                "Geçersiz avatar seçimi.");
        }

        user.AvatarKey =
            AvatarOptions.Normalize(
                request.AvatarKey);

        user.UpdatedAt = DateTime.UtcNow;

        await _userRepository.UpdateAsync(user);

        return MapToProfileResponse(user);
    }

    public async Task ChangePasswordAsync(
        Guid userId,
        ChangePasswordRequest request)
    {
        var user =
            await GetCurrentUserAsync(userId);

        var currentPasswordValid =
            BCrypt.Net.BCrypt.Verify(
                request.CurrentPassword,
                user.PasswordHash);

        if (!currentPasswordValid)
        {
            throw new UnauthorizedException(
                "Mevcut şifre hatalı.");
        }

        var newPasswordIsCurrentPassword =
            BCrypt.Net.BCrypt.Verify(
                request.NewPassword,
                user.PasswordHash);

        if (newPasswordIsCurrentPassword)
        {
            throw new ConflictException(
                "Yeni şifre mevcut şifreyle aynı olamaz.");
        }

        user.PasswordHash =
            BCrypt.Net.BCrypt.HashPassword(
                request.NewPassword);

        user.UpdatedAt = DateTime.UtcNow;

        await _userRepository.UpdateAsync(user);
    }

    private async Task<User> GetCurrentUserAsync(
        Guid userId)
    {
        var user =
            await _userRepository.GetByIdAsync(
                userId);

        if (user == null)
        {
            throw new UnauthorizedException(
                "Kullanıcı hesabı bulunamadı.");
        }

        return user;
    }

    private static UserProfileResponse MapToProfileResponse(
        User user)
    {
        return new UserProfileResponse
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            AvatarKey =
                AvatarOptions.Normalize(
                    user.AvatarKey),
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt
        };
    }
}