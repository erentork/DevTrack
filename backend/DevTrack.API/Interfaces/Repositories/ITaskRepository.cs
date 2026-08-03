using DevTrack.API.DTOs.Common;
using DevTrack.API.DTOs.Tasks;
using DevTrack.API.Entities;

namespace DevTrack.API.Interfaces.Repositories;

public interface ITaskRepository
{
    Task AddAsync(TaskItem task);

    Task<PagedResponse<TaskItem>> GetByProjectAsync(
        Guid projectId,
        TaskFilterRequest filter);

    Task<List<TaskItem>> GetAllByOwnerAsync(
        Guid ownerId);

    Task<TaskItem?> GetByIdAsync(Guid id);

    Task UpdateAsync(TaskItem task);

    Task DeleteAsync(TaskItem task);
}