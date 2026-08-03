using DevTrack.API.Entities.Enums;
using System.ComponentModel.DataAnnotations;

namespace DevTrack.API.DTOs.Tasks;

public class CreateTaskRequest
{
    [Required]
    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public TaskPriority Priority { get; set; } = TaskPriority.Medium;

    public DateTime? DueDate { get; set; }

    [Required]
    public Guid ProjectId { get; set; }
}