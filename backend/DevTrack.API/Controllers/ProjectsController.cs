using System.Security.Claims;
using DevTrack.API.DTOs.Projects;
using DevTrack.API.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DevTrack.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProjectsController : ControllerBase
{
    private readonly IProjectService _projectService;

    public ProjectsController(IProjectService projectService)
    {
        _projectService = projectService;
    }

    private Guid GetCurrentUserId()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (userId == null)
            throw new UnauthorizedAccessException("Kullanıcı doğrulanamadı.");

        return Guid.Parse(userId);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateProjectRequest request)
    {
        await _projectService.CreateAsync(GetCurrentUserId(), request);

        return Ok(new
        {
            Message = "Proje başarıyla oluşturuldu."
        });
    }

    [HttpGet]
    public async Task<IActionResult> GetMyProjects()
    {
        var projects = await _projectService.GetMyProjectsAsync(GetCurrentUserId());

        return Ok(projects);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var project = await _projectService.GetByIdAsync(GetCurrentUserId(), id);

        return Ok(project);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, UpdateProjectRequest request)
    {
        await _projectService.UpdateAsync(GetCurrentUserId(), id, request);

        return Ok(new
        {
            Message = "Proje başarıyla güncellendi."
        });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _projectService.DeleteAsync(GetCurrentUserId(), id);

        return Ok(new
        {
            Message = "Proje başarıyla silindi."
        });
    }
}