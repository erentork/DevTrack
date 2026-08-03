namespace DevTrack.API.Entities;

public class Project
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Guid OwnerId { get; set; }

    public User Owner { get; set; } = null!;

    public ICollection<TaskItem> Tasks { get; set; }
    = new List<TaskItem>();
}