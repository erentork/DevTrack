using DevTrack.API.Data;
using DevTrack.API.DTOs.Common;
using DevTrack.API.DTOs.Tasks;
using DevTrack.API.Entities;
using DevTrack.API.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;

namespace DevTrack.API.Repositories;

public class TaskRepository : ITaskRepository
{
    private readonly AppDbContext _context;

    public TaskRepository(
        AppDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(
        TaskItem task)
    {
        await _context.Tasks.AddAsync(task);

        await _context.SaveChangesAsync();
    }

    public async Task<PagedResponse<TaskItem>>
        GetByProjectAsync(
            Guid projectId,
            TaskFilterRequest filter)
    {
        var page = filter.Page < 1
            ? 1
            : filter.Page;

        var pageSize = filter.PageSize < 1
            ? 20
            : Math.Min(filter.PageSize, 100);

        var query = _context.Tasks
            .AsNoTracking()
            .Where(task =>
                task.ProjectId == projectId);

        if (filter.Status.HasValue)
        {
            query = query.Where(task =>
                task.Status ==
                filter.Status.Value);
        }

        if (filter.Priority.HasValue)
        {
            query = query.Where(task =>
                task.Priority ==
                filter.Priority.Value);
        }

        if (filter.DueAfter.HasValue)
        {
            query = query.Where(task =>
                task.DueDate >=
                filter.DueAfter.Value);
        }

        if (filter.DueBefore.HasValue)
        {
            query = query.Where(task =>
                task.DueDate <=
                filter.DueBefore.Value);
        }

        var totalCount =
            await query.CountAsync();

        query = ApplySorting(
            query,
            filter.SortBy,
            filter.Descending);

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResponse<TaskItem>
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount
        };
    }

    public async Task<List<TaskItem>>
        GetAllByOwnerAsync(
            Guid ownerId)
    {
        return await _context.Tasks
            .AsNoTracking()
            .Include(task => task.Project)
            .Where(task =>
                task.Project.OwnerId == ownerId)
            .OrderByDescending(task =>
                task.CreatedAt)
            .ToListAsync();
    }

    public async Task<TaskItem?> GetByIdAsync(
        Guid id)
    {
        return await _context.Tasks
            .FirstOrDefaultAsync(task =>
                task.Id == id);
    }

    public async Task UpdateAsync(
        TaskItem task)
    {
        _context.Tasks.Update(task);

        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(
        TaskItem task)
    {
        _context.Tasks.Remove(task);

        await _context.SaveChangesAsync();
    }

    private static IQueryable<TaskItem>
        ApplySorting(
            IQueryable<TaskItem> query,
            string? sortBy,
            bool descending)
    {
        switch (sortBy?.Trim().ToLower())
        {
            case "createdat":
                return descending
                    ? query.OrderByDescending(
                        task => task.CreatedAt)
                    : query.OrderBy(
                        task => task.CreatedAt);

            case "duedate":
                return descending
                    ? query
                        .OrderByDescending(
                            task =>
                                task.DueDate.HasValue)
                        .ThenByDescending(
                            task => task.DueDate)
                    : query
                        .OrderByDescending(
                            task =>
                                task.DueDate.HasValue)
                        .ThenBy(
                            task => task.DueDate);

            case "priority":
                return descending
                    ? query.OrderByDescending(
                        task => task.Priority)
                    : query.OrderBy(
                        task => task.Priority);

            case "status":
                return descending
                    ? query.OrderByDescending(
                        task => task.Status)
                    : query.OrderBy(
                        task => task.Status);

            default:
                return query.OrderByDescending(
                    task => task.CreatedAt);
        }
    }
}