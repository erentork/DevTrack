using DevTrack.API.Common;

namespace DevTrack.API.Entities;

public class User : BaseEntity
{
    public string Username { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    public string AvatarKey { get; set; } =
        AvatarOptions.DefaultKey;

    public ICollection<Project> Projects { get; set; }
        = new List<Project>();
}