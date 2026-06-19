using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NetSimPro.Api.Data;
using NetSimPro.Api.Models;

namespace NetSimPro.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class NetworksController : ControllerBase
{
    private readonly NetworkDbContext db;

    public NetworksController(NetworkDbContext db)
    {
        this.db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<NetworkSummaryDto>>> GetNetworks()
    {
        var networks = await db.Networks
            .Select(network => new NetworkSummaryDto(
                network.Id,
                network.Name,
                network.Description,
                network.Devices.Count,
                network.Links.Count,
                network.UpdatedAt))
            .ToListAsync();

        return Ok(networks);
    }

    [HttpGet("{id:guid}/topology")]
    public async Task<ActionResult<TopologyDto>> GetTopology(Guid id)
    {
        var network = await db.Networks
            .Include(item => item.Devices)
            .Include(item => item.Links)
            .FirstOrDefaultAsync(item => item.Id == id);

        if (network is null)
        {
            return NotFound();
        }

        return Ok(new TopologyDto(network.Id, network.Name, network.Devices, network.Links));
    }

    [HttpPost]
    public async Task<ActionResult<NetworkProject>> CreateNetwork(CreateNetworkRequest request)
    {
        var network = new NetworkProject
        {
            Name = request.Name.Trim(),
            Description = request.Description?.Trim()
        };

        db.Networks.Add(network);
        await db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetTopology), new { id = network.Id }, network);
    }
}

public sealed record CreateNetworkRequest(string Name, string? Description);
public sealed record NetworkSummaryDto(Guid Id, string Name, string? Description, int DeviceCount, int LinkCount, DateTime UpdatedAt);
public sealed record TopologyDto(Guid Id, string Name, IEnumerable<NetworkDevice> Devices, IEnumerable<NetworkLink> Links);

