using DevTrack.API.DTOs.Dashboard;

namespace DevTrack.API.Interfaces.Repositories;

public interface IDashboardRepository
{
    Task<DashboardResponse> GetAsync(Guid ownerId);
}