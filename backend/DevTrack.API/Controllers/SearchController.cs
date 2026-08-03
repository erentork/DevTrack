using System.IdentityModel.Tokens.Jwt;
using DevTrack.API.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DevTrack.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SearchController : ControllerBase
{
    private readonly ISearchService _searchService;

    public SearchController(
        ISearchService searchService)
    {
        _searchService = searchService;
    }

    [HttpGet]
    public async Task<IActionResult> Search(
        [FromQuery] string? query)
    {
        var userIdValue = User
            .FindFirst(JwtRegisteredClaimNames.Sub)
            ?.Value;

        if (!Guid.TryParse(
                userIdValue,
                out var userId))
        {
            return Unauthorized();
        }

        var response =
            await _searchService.SearchAsync(
                userId,
                query ?? string.Empty
            );

        return Ok(response);
    }
}