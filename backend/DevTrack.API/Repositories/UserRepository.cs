using DevTrack.API.Data;
using DevTrack.API.Entities;
using DevTrack.API.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;

namespace DevTrack.API.Repositories;

public class UserRepository : IUserRepository
{
    private readonly AppDbContext _context;

    public UserRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<User?> GetByIdAsync(Guid id)
    {
        return await _context.Users
            .FirstOrDefaultAsync(user =>
                user.Id == id);
    }

    public async Task<User?> GetByEmailAsync(
        string email)
    {
        var normalizedEmail =
            email.Trim().ToLower();

        return await _context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(user =>
                user.Email.ToLower() ==
                normalizedEmail);
    }

    public async Task<User?> GetByUsernameAsync(
        string username)
    {
        var normalizedUsername =
            username.Trim().ToLower();

        return await _context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(user =>
                user.Username.ToLower() ==
                normalizedUsername);
    }

    public async Task AddAsync(User user)
    {
        await _context.Users.AddAsync(user);

        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(User user)
    {
        _context.Users.Update(user);

        await _context.SaveChangesAsync();
    }
}