using DevTrack.API.Entities.Enums;
using System.ComponentModel.DataAnnotations;

namespace DevTrack.API.DTOs.Tasks;

public class UpdateTaskRequest
{
    [Required]
    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public TaskItemStatus Status { get; set; }

    public TaskPriority Priority { get; set; }

    public DateTime? DueDate { get; set; }
}