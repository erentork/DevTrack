using DevTrack.API.Entities.Enums;
using DevTrack.API.DTOs.Common;

namespace DevTrack.API.DTOs.Tasks;

public class TaskFilterRequest
{
    public TaskItemStatus? Status { get; set; }

    public TaskPriority? Priority { get; set; }

    public DateTime? DueAfter { get; set; }

    public DateTime? DueBefore { get; set; }

    public string? Search { get; set; }

    public string? SortBy { get; set; }

    public bool Descending { get; set; } = true;

    public int Page { get; set; } = 1;

    public int PageSize { get; set; } = 10;
}