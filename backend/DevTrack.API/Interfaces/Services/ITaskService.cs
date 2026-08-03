using DevTrack.API.DTOs.Common;
using DevTrack.API.DTOs.Tasks;

namespace DevTrack.API.Interfaces.Services;

public interface ITaskService
{
    Task CreateAsync(
        Guid ownerId,
        CreateTaskRequest request);

    Task<PagedResponse<TaskResponse>>
        GetByProjectAsync(
            Guid ownerId,
            Guid projectId,
            TaskFilterRequest filter);

    Task<List<MyTaskResponse>>
        GetMyTasksAsync(Guid ownerId);

    Task<TaskResponse> GetByIdAsync(
        Guid ownerId,
        Guid taskId);

    Task UpdateAsync(
        Guid ownerId,
        Guid taskId,
        UpdateTaskRequest request);

    Task DeleteAsync(
        Guid ownerId,
        Guid taskId);
}