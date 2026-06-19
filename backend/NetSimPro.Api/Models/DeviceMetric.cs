namespace NetSimPro.Api.Models;

public sealed class DeviceMetric
{
    public long Id { get; set; }
    public Guid NetworkDeviceId { get; set; }
    public NetworkDevice? NetworkDevice { get; set; }
    public double CpuPercent { get; set; }
    public double MemoryPercent { get; set; }
    public double TrafficInMbps { get; set; }
    public double TrafficOutMbps { get; set; }
    public DateTime RecordedAt { get; set; } = DateTime.UtcNow;
}

