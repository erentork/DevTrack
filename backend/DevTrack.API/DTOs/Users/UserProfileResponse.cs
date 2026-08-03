namespace DevTrack.API.DTOs.Users;

public class UserProfileResponse
{
    public Guid Id { get; set; }

    public string Username { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string AvatarKey { get; set; } = "orbit";

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}