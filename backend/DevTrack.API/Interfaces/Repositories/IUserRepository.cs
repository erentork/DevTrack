using DevTrack.API.Entities;

namespace DevTrack.API.Interfaces.Repositories;

public interface IUserRepository
{
    Task<User?> GetByIdAsync(Guid id);

    Task<User?> GetByEmailAsync(string email);

    Task<User?> GetByUsernameAsync(string username);

    Task AddAsync(User user);

    Task UpdateAsync(User user);
}