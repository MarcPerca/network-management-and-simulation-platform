namespace NetSimPro.Api.Models;

public sealed class NetworkLink
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid NetworkProjectId { get; set; }
    public NetworkProject? NetworkProject { get; set; }
    public Guid SourceDeviceId { get; set; }
    public NetworkDevice? SourceDevice { get; set; }
    public Guid TargetDeviceId { get; set; }
    public NetworkDevice? TargetDevice { get; set; }
    public int BandwidthMbps { get; set; } = 1000;
    public double LatencyMs { get; set; } = 1;
    public double PacketLossPercent { get; set; }
}

