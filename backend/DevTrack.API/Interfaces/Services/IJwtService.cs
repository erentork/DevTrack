using DevTrack.API.Entities;

namespace DevTrack.API.Interfaces.Services;

public interface IJwtService
{
    string GenerateToken(User user);
}