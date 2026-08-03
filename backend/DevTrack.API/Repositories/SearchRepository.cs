using DevTrack.API.Data;
using DevTrack.API.DTOs.Search;
using DevTrack.API.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;

namespace DevTrack.API.Repositories;

public class SearchRepository : ISearchRepository
{
    private readonly AppDbContext _context;

    public SearchRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<SearchResponse> SearchAsync(
        Guid ownerId,
        string query)
    {
        var pattern = $"%{query}%";

        var projects = await _context.Projects
            .AsNoTracking()
            .Where(project =>
                project.OwnerId == ownerId &&
                (
                    EF.Functions.ILike(
                        project.Name,
                        pattern
                    ) ||
                    (
                        project.Description != null &&
                        EF.Functions.ILike(
                            project.Description,
                            pattern
                        )
                    )
                ))
            .OrderByDescending(project =>
                project.CreatedAt)
            .Take(5)
            .Select(project =>
                new SearchProjectResponse
                {
                    Id = project.Id,
                    Name = project.Name,
                    Description =
                        project.Description
                })
            .ToListAsync();

        var tasks = await (
            from task in _context.Tasks
                .AsNoTracking()

            join project in _context.Projects
                .AsNoTracking()
                on task.ProjectId equals project.Id

            where
                project.OwnerId == ownerId &&
                (
                    EF.Functions.ILike(
                        task.Title,
                        pattern
                    ) ||
                    EF.Functions.ILike(
                        task.Description,
                        pattern
                    )
                )

            orderby task.CreatedAt descending

            select new SearchTaskResponse
            {
                Id = task.Id,
                ProjectId = task.ProjectId,
                ProjectName = project.Name,
                Title = task.Title,
                Description = task.Description,
                Status = (int)task.Status,
                Priority = (int)task.Priority
            }
        )
        .Take(5)
        .ToListAsync();

        return new SearchResponse
        {
            Projects = projects,
            Tasks = tasks
        };
    }
}