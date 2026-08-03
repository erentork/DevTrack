using DevTrack.API.DTOs.Search;

namespace DevTrack.API.Interfaces.Repositories;

public interface ISearchRepository
{
    Task<SearchResponse> SearchAsync(
        Guid ownerId,
        string query);
}