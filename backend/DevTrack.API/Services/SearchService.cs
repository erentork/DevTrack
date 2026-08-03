using DevTrack.API.DTOs.Search;
using DevTrack.API.Interfaces.Repositories;
using DevTrack.API.Interfaces.Services;

namespace DevTrack.API.Services;

public class SearchService : ISearchService
{
    private readonly ISearchRepository _searchRepository;

    public SearchService(
        ISearchRepository searchRepository)
    {
        _searchRepository = searchRepository;
    }

    public async Task<SearchResponse> SearchAsync(
        Guid ownerId,
        string query)
    {
        var normalizedQuery = query.Trim();

        if (normalizedQuery.Length < 2)
        {
            return new SearchResponse();
        }

        return await _searchRepository.SearchAsync(
            ownerId,
            normalizedQuery
        );
    }
}