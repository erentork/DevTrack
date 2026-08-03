namespace DevTrack.API.DTOs.Notifications;

public class NotificationResponse
{
    public int TotalCount { get; set; }

    public List<NotificationItemResponse> Items { get; set; } = [];
}