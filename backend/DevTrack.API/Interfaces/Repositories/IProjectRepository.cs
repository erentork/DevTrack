using DevTrack.API.Entities;

namespace DevTrack.API.Interfaces.Repositories;

public interface IProjectRepository
{
    Task AddAsync(Project project);

    Task<List<Project>> GetAllByOwnerAsync(Guid ownerId);

    Task<Project?> GetByIdAsync(Guid id);

    Task UpdateAsync(Project project);

    Task DeleteAsync(Project project);
}