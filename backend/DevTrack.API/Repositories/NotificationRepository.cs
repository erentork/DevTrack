using DevTrack.API.Data;
using DevTrack.API.DTOs.Notifications;
using DevTrack.API.Entities.Enums;
using DevTrack.API.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;

namespace DevTrack.API.Repositories;

public class NotificationRepository : INotificationRepository
{
    private readonly AppDbContext _context;

    public NotificationRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<NotificationResponse> GetAsync(Guid ownerId)
    {
        var today = DateTime.UtcNow.Date;

        // Bugün hariç, önümüzdeki 7 günü de kapsar.
        var dueSoonEndExclusive = today.AddDays(8);

        var notificationRows = await (
            from task in _context.Tasks.AsNoTracking()

            join project in _context.Projects.AsNoTracking()
                on task.ProjectId equals project.Id

            where
                project.OwnerId == ownerId &&
                task.Status != TaskItemStatus.Done &&
                task.DueDate.HasValue &&
                task.DueDate.Value < dueSoonEndExclusive

            orderby task.DueDate ascending

            select new
            {
                TaskId = task.Id,
                task.ProjectId,
                ProjectName = project.Name,
                TaskTitle = task.Title,
                DueDate = task.DueDate!.Value
            }
        ).ToListAsync();

        var items = notificationRows
            .Select(row =>
            {
                var dueDate = row.DueDate.Date;

                var daysRemaining =
                    (dueDate - today).Days;

                return new NotificationItemResponse
                {
                    TaskId = row.TaskId,
                    ProjectId = row.ProjectId,
                    ProjectName = row.ProjectName,
                    TaskTitle = row.TaskTitle,
                    DueDate = row.DueDate,
                    DaysRemaining = daysRemaining,
                    Type = GetNotificationType(daysRemaining),
                    Message = GetNotificationMessage(daysRemaining)
                };
            })
            .OrderBy(item => item.DueDate)
            .ToList();

        return new NotificationResponse
        {
            TotalCount = items.Count,
            Items = items
        };
    }

    private static string GetNotificationType(
        int daysRemaining)
    {
        if (daysRemaining < 0)
        {
            return "overdue";
        }

        if (daysRemaining == 0)
        {
            return "dueToday";
        }

        return "dueSoon";
    }

    private static string GetNotificationMessage(
        int daysRemaining)
    {
        if (daysRemaining < 0)
        {
            var overdueDays = Math.Abs(daysRemaining);

            return overdueDays == 1
                ? "Task is overdue by 1 day"
                : $"Task is overdue by {overdueDays} days";
        }

        if (daysRemaining == 0)
        {
            return "Task is due today";
        }

        if (daysRemaining == 1)
        {
            return "Task is due tomorrow";
        }

        return $"Task is due in {daysRemaining} days";
    }
}