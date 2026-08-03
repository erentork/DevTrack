namespace DevTrack.API.DTOs.Search;

public class SearchProjectResponse
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }
}