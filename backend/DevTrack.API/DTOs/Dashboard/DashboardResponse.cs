namespace DevTrack.API.DTOs.Dashboard;

public class DashboardResponse
{
    public int ProjectCount { get; set; }

    public int TaskCount { get; set; }

    public int TodoTasks { get; set; }

    public int InProgressTasks { get; set; }

    public int CompletedTasks { get; set; }

    public int OverdueTasks { get; set; }

    public double CompletionRate { get; set; }

    public List<RecentTaskResponse> RecentTasks { get; set; } = [];

    public List<RecentProjectResponse> RecentProjects { get; set; } = [];

    public List<DailyTaskStatResponse> DailyTaskStats { get; set; } = [];
}