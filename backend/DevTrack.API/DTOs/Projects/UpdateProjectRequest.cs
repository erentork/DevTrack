using System.ComponentModel.DataAnnotations;

namespace DevTrack.API.DTOs.Projects;

public class UpdateProjectRequest
{
    [Required]
    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;
}