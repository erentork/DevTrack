using DevTrack.API.DTOs.Projects;

namespace DevTrack.API.Interfaces.Services;

public interface IProjectService
{
    Task CreateAsync(Guid ownerId, CreateProjectRequest request);

    Task<List<ProjectResponse>> GetMyProjectsAsync(Guid ownerId);

    Task<ProjectResponse> GetByIdAsync(Guid ownerId, Guid projectId);

    Task UpdateAsync(Guid ownerId, Guid projectId, UpdateProjectRequest request);

    Task DeleteAsync(Guid ownerId, Guid projectId);
}