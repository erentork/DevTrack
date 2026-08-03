using DevTrack.API.DTOs.Dashboard;

namespace DevTrack.API.Interfaces.Services;

public interface IDashboardService
{
    Task<DashboardResponse> GetAsync(Guid ownerId);
}