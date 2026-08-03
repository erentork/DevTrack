namespace DevTrack.API.DTOs.Dashboard;

public class RecentProjectResponse
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    public int TaskCount { get; set; }

    public int CompletedTaskCount { get; set; }

    public DateTime CreatedAt { get; set; }
}