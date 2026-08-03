using DevTrack.API.DTOs.Common;
using DevTrack.API.DTOs.Tasks;
using DevTrack.API.Entities;
using DevTrack.API.Entities.Enums;
using DevTrack.API.Exceptions;
using DevTrack.API.Interfaces.Repositories;
using DevTrack.API.Interfaces.Services;

namespace DevTrack.API.Services;

public class TaskService : ITaskService
{
    private readonly ITaskRepository
        _taskRepository;

    private readonly IProjectRepository
        _projectRepository;

    public TaskService(
        ITaskRepository taskRepository,
        IProjectRepository projectRepository)
    {
        _taskRepository = taskRepository;
        _projectRepository = projectRepository;
    }

    public async Task CreateAsync(
        Guid ownerId,
        CreateTaskRequest request)
    {
        var project =
            await _projectRepository.GetByIdAsync(
                request.ProjectId);

        if (project == null)
        {
            throw new Exception(
                "Proje bulunamadı.");
        }

        if (project.OwnerId != ownerId)
        {
            throw new UnauthorizedException(
                "Bu projeye görev ekleyemezsiniz.");
        }

        var task = new TaskItem
        {
            Title = request.Title.Trim(),
            Description =
                request.Description?.Trim()
                ?? string.Empty,
            Priority = request.Priority,
            DueDate = request.DueDate,
            ProjectId = request.ProjectId,
            Status = TaskItemStatus.Todo,
            CreatedAt = DateTime.UtcNow,
            CompletedAt = null
        };

        await _taskRepository.AddAsync(task);
    }

    public async Task<PagedResponse<TaskResponse>>
        GetByProjectAsync(
            Guid ownerId,
            Guid projectId,
            TaskFilterRequest filter)
    {
        var project =
            await _projectRepository.GetByIdAsync(
                projectId);

        if (project == null)
        {
            throw new Exception(
                "Proje bulunamadı.");
        }

        if (project.OwnerId != ownerId)
        {
            throw new UnauthorizedException(
                "Bu projeye erişemezsiniz.");
        }

        var result =
            await _taskRepository
                .GetByProjectAsync(
                    projectId,
                    filter);

        return new PagedResponse<TaskResponse>
        {
            Items = result.Items
                .Select(MapToResponse)
                .ToList(),

            Page = result.Page,
            PageSize = result.PageSize,
            TotalCount = result.TotalCount
        };
    }

    public async Task<List<MyTaskResponse>>
        GetMyTasksAsync(
            Guid ownerId)
    {
        var tasks =
            await _taskRepository
                .GetAllByOwnerAsync(ownerId);

        return tasks
            .Select(MapToMyTaskResponse)
            .ToList();
    }

    public async Task<TaskResponse>
        GetByIdAsync(
            Guid ownerId,
            Guid taskId)
    {
        var task =
            await _taskRepository.GetByIdAsync(
                taskId);

        if (task == null)
        {
            throw new Exception(
                "Görev bulunamadı.");
        }

        var project =
            await _projectRepository.GetByIdAsync(
                task.ProjectId);

        if (
            project == null ||
            project.OwnerId != ownerId
        )
        {
            throw new UnauthorizedException(
                "Bu göreve erişemezsiniz.");
        }

        return MapToResponse(task);
    }

    public async Task UpdateAsync(
        Guid ownerId,
        Guid taskId,
        UpdateTaskRequest request)
    {
        var task =
            await _taskRepository.GetByIdAsync(
                taskId);

        if (task == null)
        {
            throw new Exception(
                "Görev bulunamadı.");
        }

        var project =
            await _projectRepository.GetByIdAsync(
                task.ProjectId);

        if (
            project == null ||
            project.OwnerId != ownerId
        )
        {
            throw new UnauthorizedException(
                "Bu görevi güncelleyemezsiniz.");
        }

        UpdateCompletionState(
    task,
    request.Status);

task.Title = request.Title.Trim();

task.Description =
    request.Description?.Trim()
    ?? string.Empty;

task.Priority = request.Priority;
task.DueDate = request.DueDate;

await _taskRepository.UpdateAsync(task);
    }

    public async Task DeleteAsync(
        Guid ownerId,
        Guid taskId)
    {
        var task =
            await _taskRepository.GetByIdAsync(
                taskId);

        if (task == null)
        {
            throw new Exception(
                "Görev bulunamadı.");
        }

        var project =
            await _projectRepository.GetByIdAsync(
                task.ProjectId);

        if (
            project == null ||
            project.OwnerId != ownerId
        )
        {
            throw new UnauthorizedException(
                "Bu görevi silemezsiniz.");
        }

        await _taskRepository.DeleteAsync(task);
    }

    private static void UpdateCompletionState(
        TaskItem task,
        TaskItemStatus newStatus)
    {
        var oldStatus = task.Status;

        task.Status = newStatus;

        if (
            newStatus == TaskItemStatus.Done &&
            oldStatus != TaskItemStatus.Done
        )
        {
            task.CompletedAt = DateTime.UtcNow;
        }
        else if (
            newStatus != TaskItemStatus.Done
        )
        {
            task.CompletedAt = null;
        }
    }

    private static TaskResponse MapToResponse(
        TaskItem task)
    {
        return new TaskResponse
        {
            Id = task.Id,
            Title = task.Title,
            Description = task.Description,
            Status = task.Status,
            Priority = task.Priority,
            DueDate = task.DueDate,
            CreatedAt = task.CreatedAt,
            ProjectId = task.ProjectId
        };
    }

    private static MyTaskResponse
        MapToMyTaskResponse(
            TaskItem task)
    {
        return new MyTaskResponse
        {
            Id = task.Id,
            ProjectId = task.ProjectId,
            ProjectName =
                task.Project?.Name
                ?? "Unknown Project",
            Title = task.Title,
            Description = task.Description,
            Status = task.Status,
            Priority = task.Priority,
            DueDate = task.DueDate,
            CreatedAt = task.CreatedAt,
            CompletedAt = task.CompletedAt
        };
    }
}