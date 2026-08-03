using DevTrack.API.Data;
using DevTrack.API.Entities;
using DevTrack.API.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;

namespace DevTrack.API.Repositories;

public class ProjectRepository : IProjectRepository
{
    private readonly AppDbContext _context;

    public ProjectRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(Project project)
    {
        _context.Projects.Add(project);
        await _context.SaveChangesAsync();
    }

    public async Task<List<Project>> GetAllByOwnerAsync(Guid ownerId)
    {
        return await _context.Projects
            .Where(x => x.OwnerId == ownerId)
            .ToListAsync();
    }
    public async Task<Project?> GetByIdAsync(Guid id)
{
    return await _context.Projects
        .FirstOrDefaultAsync(x => x.Id == id);
}

public async Task UpdateAsync(Project project)
{
    _context.Projects.Update(project);
    await _context.SaveChangesAsync();
}

public async Task DeleteAsync(Project project)
{
    _context.Projects.Remove(project);
    await _context.SaveChangesAsync();
}
}