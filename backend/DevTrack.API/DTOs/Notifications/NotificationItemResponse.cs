namespace DevTrack.API.DTOs.Notifications;

public class NotificationItemResponse
{
    public Guid TaskId { get; set; }

    public Guid ProjectId { get; set; }

    public string ProjectName { get; set; } = string.Empty;

    public string TaskTitle { get; set; } = string.Empty;

    public string Type { get; set; } = string.Empty;

    public string Message { get; set; } = string.Empty;

    public DateTime DueDate { get; set; }

    public int DaysRemaining { get; set; }
}