using DevTrack.API.Data;
using DevTrack.API.DTOs.Dashboard;
using DevTrack.API.Entities.Enums;
using DevTrack.API.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;

namespace DevTrack.API.Repositories;

public class DashboardRepository : IDashboardRepository
{
    private readonly AppDbContext _context;

    public DashboardRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<DashboardResponse> GetAsync(Guid ownerId)
    {
        var projectQuery = _context.Projects
            .AsNoTracking()
            .Where(project => project.OwnerId == ownerId);

        var taskQuery =
            from task in _context.Tasks.AsNoTracking()
            join project in projectQuery
                on task.ProjectId equals project.Id
            select new
            {
                Task = task,
                ProjectName = project.Name
            };

        var projectCount = await projectQuery.CountAsync();
        var taskCount = await taskQuery.CountAsync();

        var todoTasks = await taskQuery.CountAsync(item =>
            item.Task.Status == TaskItemStatus.Todo);

        var inProgressTasks = await taskQuery.CountAsync(item =>
            item.Task.Status == TaskItemStatus.InProgress);

        var completedTasks = await taskQuery.CountAsync(item =>
            item.Task.Status == TaskItemStatus.Done);

        var overdueTasks = await taskQuery.CountAsync(item =>
            item.Task.DueDate.HasValue &&
            item.Task.DueDate.Value < DateTime.UtcNow &&
            item.Task.Status != TaskItemStatus.Done);

        var recentTasks = await taskQuery
            .OrderByDescending(item => item.Task.CreatedAt)
            .Take(5)
            .Select(item => new RecentTaskResponse
            {
                Id = item.Task.Id,
                ProjectId = item.Task.ProjectId,
                ProjectName = item.ProjectName,
                Title = item.Task.Title,
                Status = (int)item.Task.Status,
                Priority = (int)item.Task.Priority,
                DueDate = item.Task.DueDate,
                CreatedAt = item.Task.CreatedAt
            })
            .ToListAsync();

        var recentProjects = await projectQuery
            .OrderByDescending(project => project.CreatedAt)
            .Take(5)
            .Select(project => new RecentProjectResponse
            {
                Id = project.Id,
                Name = project.Name,
                Description = project.Description,
                CreatedAt = project.CreatedAt,

                TaskCount = _context.Tasks.Count(task =>
                    task.ProjectId == project.Id),

                CompletedTaskCount = _context.Tasks.Count(task =>
                    task.ProjectId == project.Id &&
                    task.Status == TaskItemStatus.Done)
            })
            .ToListAsync();

        var completionRate = taskCount == 0
            ? 0
            : Math.Round(
                (double)completedTasks / taskCount * 100,
                2);

        var today = DateTime.UtcNow.Date;
        var startDate = today.AddDays(-6);
        var endDateExclusive = today.AddDays(1);

        var activityRows = await taskQuery
            .Where(item =>
                (
                    item.Task.CreatedAt >= startDate &&
                    item.Task.CreatedAt < endDateExclusive
                )
                ||
                (
                    item.Task.CompletedAt.HasValue &&
                    item.Task.CompletedAt.Value >= startDate &&
                    item.Task.CompletedAt.Value < endDateExclusive
                ))
            .Select(item => new
            {
                CreatedAt = item.Task.CreatedAt,
                CompletedAt = item.Task.CompletedAt
            })
            .ToListAsync();

        var dailyTaskStats = Enumerable
            .Range(0, 7)
            .Select(index =>
            {
                var date = startDate.AddDays(index);

                var createdCount = activityRows.Count(item =>
                    item.CreatedAt.Date == date);

                var completedCount = activityRows.Count(item =>
                    item.CompletedAt.HasValue &&
                    item.CompletedAt.Value.Date == date);

                return new DailyTaskStatResponse
                {
                    Date = date,
                    CreatedTasks = createdCount,
                    CompletedTasks = completedCount
                };
            })
            .ToList();

        return new DashboardResponse
        {
            ProjectCount = projectCount,
            TaskCount = taskCount,
            TodoTasks = todoTasks,
            InProgressTasks = inProgressTasks,
            CompletedTasks = completedTasks,
            OverdueTasks = overdueTasks,
            CompletionRate = completionRate,
            RecentTasks = recentTasks,
            RecentProjects = recentProjects,
            DailyTaskStats = dailyTaskStats
        };
    }
}