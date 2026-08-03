using DevTrack.API.DTOs.Notifications;

namespace DevTrack.API.Interfaces.Repositories;

public interface INotificationRepository
{
    Task<NotificationResponse> GetAsync(Guid ownerId);
}