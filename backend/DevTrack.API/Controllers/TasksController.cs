using System.IdentityModel.Tokens.Jwt;
using DevTrack.API.DTOs.Tasks;
using DevTrack.API.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DevTrack.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TasksController : ControllerBase
{
    private readonly ITaskService _taskService;

    public TasksController(
        ITaskService taskService)
    {
        _taskService = taskService;
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        CreateTaskRequest request)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        await _taskService.CreateAsync(
            userId,
            request);

        return Ok(new
        {
            Message = "Görev oluşturuldu."
        });
    }

    [HttpGet("my")]
    public async Task<IActionResult> GetMyTasks()
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        var tasks =
            await _taskService.GetMyTasksAsync(
                userId);

        return Ok(tasks);
    }

    [HttpGet("project/{projectId:guid}")]
    public async Task<IActionResult> GetByProject(
        Guid projectId,
        [FromQuery] TaskFilterRequest filter)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        var tasks =
            await _taskService.GetByProjectAsync(
                userId,
                projectId,
                filter);

        return Ok(tasks);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(
        Guid id)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        var task =
            await _taskService.GetByIdAsync(
                userId,
                id);

        return Ok(task);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(
        Guid id,
        UpdateTaskRequest request)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        await _taskService.UpdateAsync(
            userId,
            id,
            request);

        return Ok(new
        {
            Message = "Görev güncellendi."
        });
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(
        Guid id)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        await _taskService.DeleteAsync(
            userId,
            id);

        return Ok(new
        {
            Message = "Görev silindi."
        });
    }

    private bool TryGetUserId(
        out Guid userId)
    {
        var value = User
            .FindFirst(
                JwtRegisteredClaimNames.Sub)
            ?.Value;

        return Guid.TryParse(
            value,
            out userId);
    }
}