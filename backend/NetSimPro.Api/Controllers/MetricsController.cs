using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NetSimPro.Api.Data;
using NetSimPro.Api.Models;

namespace NetSimPro.Api.Controllers;

[ApiController]
[Route("api")]
public sealed class MetricsController : ControllerBase
{
    private readonly NetworkDbContext db;

    public MetricsController(NetworkDbContext db)
    {
        this.db = db;
    }

    [HttpGet("networks/{networkId:guid}/metrics/summary")]
    public async Task<ActionResult<MetricsSummaryDto>> GetSummary(Guid networkId)
    {
        var devices = await db.Devices
            .Where(device => device.NetworkProjectId == networkId)
            .ToListAsync();

        if (devices.Count == 0)
        {
            return Ok(new MetricsSummaryDto(0, 0, 0, 0));
        }

        var onlineCount = devices.Count(device => device.Status == DeviceStatus.Online);
        var availability = Math.Round((double)onlineCount / devices.Count * 100, 2);

        var deviceIds = devices.Select(device => device.Id).ToList();
        var recentMetrics = await db.DeviceMetrics
            .Where(metric => deviceIds.Contains(metric.NetworkDeviceId))
            .OrderByDescending(metric => metric.RecordedAt)
            .Take(100)
            .ToListAsync();

        var traffic = recentMetrics.Sum(metric => metric.TrafficInMbps + metric.TrafficOutMbps);

        return Ok(new MetricsSummaryDto(availability, 4.2, traffic, 0.4));
    }

    [HttpPost("metrics/device")]
    public async Task<ActionResult> AddDeviceMetric(CreateMetricRequest request)
    {
        var deviceExists = await db.Devices.AnyAsync(device => device.Id == request.DeviceId);

        if (!deviceExists)
        {
            return NotFound();
        }

        db.DeviceMetrics.Add(new DeviceMetric
        {
            NetworkDeviceId = request.DeviceId,
            CpuPercent = request.CpuPercent,
            MemoryPercent = request.MemoryPercent,
            TrafficInMbps = request.TrafficInMbps,
            TrafficOutMbps = request.TrafficOutMbps
        });

        await db.SaveChangesAsync();
        return Accepted();
    }
}

public sealed record MetricsSummaryDto(double AvailabilityPercent, double AverageLatencyMs, double TrafficMbps, double PacketLossPercent);
public sealed record CreateMetricRequest(Guid DeviceId, double CpuPercent, double MemoryPercent, double TrafficInMbps, double TrafficOutMbps);

