using DevTrack.API.DTOs.Search;

namespace DevTrack.API.Interfaces.Services;

public interface ISearchService
{
    Task<SearchResponse> SearchAsync(
        Guid ownerId,
        string query);
}