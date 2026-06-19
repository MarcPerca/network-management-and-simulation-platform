namespace NetSimPro.Api.Models;

public sealed class NetworkDevice
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid NetworkProjectId { get; set; }
    public NetworkProject? NetworkProject { get; set; }
    public string Name { get; set; } = "";
    public DeviceKind DeviceType { get; set; }
    public string? IpAddress { get; set; }
    public string? MacAddress { get; set; }
    public float PositionX { get; set; }
    public float PositionY { get; set; }
    public float PositionZ { get; set; }
    public DeviceStatus Status { get; set; } = DeviceStatus.Online;
}

