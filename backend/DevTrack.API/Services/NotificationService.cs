using DevTrack.API.DTOs.Notifications;
using DevTrack.API.Interfaces.Repositories;
using DevTrack.API.Interfaces.Services;

namespace DevTrack.API.Services;

public class NotificationService : INotificationService
{
    private readonly INotificationRepository _notificationRepository;

    public NotificationService(
        INotificationRepository notificationRepository)
    {
        _notificationRepository = notificationRepository;
    }

    public async Task<NotificationResponse> GetAsync(
        Guid ownerId)
    {
        return await _notificationRepository.GetAsync(ownerId);
    }
}