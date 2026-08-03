using DevTrack.API.DTOs.Projects;
using DevTrack.API.Entities;
using DevTrack.API.Exceptions;
using DevTrack.API.Interfaces.Repositories;
using DevTrack.API.Interfaces.Services;

namespace DevTrack.API.Services;

public class ProjectService : IProjectService
{
    private readonly IProjectRepository _projectRepository;

    public ProjectService(IProjectRepository projectRepository)
    {
        _projectRepository = projectRepository;
    }

    public async Task CreateAsync(Guid ownerId, CreateProjectRequest request)
    {
        var project = new Project
        {
            Name = request.Name,
            Description = request.Description,
            OwnerId = ownerId
        };

        await _projectRepository.AddAsync(project);
    }

    public async Task<List<ProjectResponse>> GetMyProjectsAsync(Guid ownerId)
    {
        var projects = await _projectRepository.GetAllByOwnerAsync(ownerId);

        return projects.Select(x => new ProjectResponse
        {
            Id = x.Id,
            Name = x.Name,
            Description = x.Description,
            CreatedAt = x.CreatedAt
        }).ToList();
    }

    public async Task<ProjectResponse> GetByIdAsync(Guid ownerId, Guid projectId)
    {
        var project = await _projectRepository.GetByIdAsync(projectId);

        if (project == null)
            throw new Exception("Proje bulunamadı.");

        if (project.OwnerId != ownerId)
            throw new UnauthorizedException("Bu projeye erişim yetkiniz yok.");

        return new ProjectResponse
        {
            Id = project.Id,
            Name = project.Name,
            Description = project.Description,
            CreatedAt = project.CreatedAt
        };
    }

    public async Task UpdateAsync(Guid ownerId, Guid projectId, UpdateProjectRequest request)
    {
        var project = await _projectRepository.GetByIdAsync(projectId);

        if (project == null)
            throw new Exception("Proje bulunamadı.");

        if (project.OwnerId != ownerId)
            throw new UnauthorizedException("Bu projeyi güncelleme yetkiniz yok.");

        project.Name = request.Name;
        project.Description = request.Description;

        await _projectRepository.UpdateAsync(project);
    }

    public async Task DeleteAsync(Guid ownerId, Guid projectId)
    {
        var project = await _projectRepository.GetByIdAsync(projectId);

        if (project == null)
            throw new Exception("Proje bulunamadı.");

        if (project.OwnerId != ownerId)
            throw new UnauthorizedException("Bu projeyi silme yetkiniz yok.");

        await _projectRepository.DeleteAsync(project);
    }
}