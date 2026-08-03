namespace DevTrack.API.DTOs.Search;

public class SearchResponse
{
    public List<SearchProjectResponse> Projects { get; set; } = [];

    public List<SearchTaskResponse> Tasks { get; set; } = [];
}