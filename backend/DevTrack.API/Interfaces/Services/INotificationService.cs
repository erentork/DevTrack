using DevTrack.API.DTOs.Notifications;

namespace DevTrack.API.Interfaces.Services;

public interface INotificationService
{
    Task<NotificationResponse> GetAsync(Guid ownerId);
}