namespace DevTrack.API.Common;

public static class AvatarOptions
{
    public const string DefaultKey = "orbit";

    public static readonly IReadOnlySet<string> AllowedKeys =
        new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "orbit",
            "hex",
            "grid",
            "wave",
            "pulse"
        };

    public static bool IsValid(string? avatarKey)
    {
        return !string.IsNullOrWhiteSpace(avatarKey) &&
               AllowedKeys.Contains(avatarKey.Trim());
    }

    public static string Normalize(string? avatarKey)
    {
        if (!IsValid(avatarKey))
        {
            return DefaultKey;
        }

        return avatarKey!.Trim().ToLowerInvariant();
    }
}