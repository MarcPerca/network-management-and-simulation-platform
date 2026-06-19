using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NetSimPro.Api.Data;
using NetSimPro.Api.Models;

namespace NetSimPro.Api.Controllers;

[ApiController]
[Route("api/networks/{networkId:guid}/devices")]
public sealed class DevicesController : ControllerBase
{
    private readonly NetworkDbContext db;

    public DevicesController(NetworkDbContext db)
    {
        this.db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<NetworkDevice>>> GetDevices(Guid networkId)
    {
        var devices = await db.Devices
            .Where(device => device.NetworkProjectId == networkId)
            .OrderBy(device => device.Name)
            .ToListAsync();

        return Ok(devices);
    }

    [HttpPost]
    public async Task<ActionResult<NetworkDevice>> CreateDevice(Guid networkId, UpsertDeviceRequest request)
    {
        var networkExists = await db.Networks.AnyAsync(network => network.Id == networkId);

        if (!networkExists)
        {
            return NotFound();
        }

        var device = new NetworkDevice
        {
            NetworkProjectId = networkId,
            Name = request.Name.Trim(),
            DeviceType = request.DeviceType,
            IpAddress = request.IpAddress?.Trim(),
            MacAddress = request.MacAddress?.Trim(),
            PositionX = request.PositionX,
            PositionY = request.PositionY,
            PositionZ = request.PositionZ,
            Status = request.Status
        };

        db.Devices.Add(device);
        await db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetDevices), new { networkId }, device);
    }

    [HttpPut("{deviceId:guid}")]
    public async Task<IActionResult> UpdateDevice(Guid networkId, Guid deviceId, UpsertDeviceRequest request)
    {
        var device = await db.Devices
            .FirstOrDefaultAsync(item => item.NetworkProjectId == networkId && item.Id == deviceId);

        if (device is null)
        {
            return NotFound();
        }

        device.Name = request.Name.Trim();
        device.DeviceType = request.DeviceType;
        device.IpAddress = request.IpAddress?.Trim();
        device.MacAddress = request.MacAddress?.Trim();
        device.PositionX = request.PositionX;
        device.PositionY = request.PositionY;
        device.PositionZ = request.PositionZ;
        device.Status = request.Status;

        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{deviceId:guid}")]
    public async Task<IActionResult> DeleteDevice(Guid networkId, Guid deviceId)
    {
        var device = await db.Devices
            .FirstOrDefaultAsync(item => item.NetworkProjectId == networkId && item.Id == deviceId);

        if (device is null)
        {
            return NotFound();
        }

        db.Devices.Remove(device);
        await db.SaveChangesAsync();

        return NoContent();
    }
}

public sealed record UpsertDeviceRequest(
    string Name,
    DeviceKind DeviceType,
    string? IpAddress,
    string? MacAddress,
    float PositionX,
    float PositionY,
    float PositionZ,
    DeviceStatus Status);

