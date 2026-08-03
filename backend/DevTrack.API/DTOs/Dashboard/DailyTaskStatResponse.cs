namespace DevTrack.API.DTOs.Dashboard;

public class DailyTaskStatResponse
{
    public DateTime Date { get; set; }

    public int CreatedTasks { get; set; }

    public int CompletedTasks { get; set; }
}