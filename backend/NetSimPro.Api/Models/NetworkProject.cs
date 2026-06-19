namespace NetSimPro.Api.Models;

public sealed class NetworkProject
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = "";
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public List<NetworkDevice> Devices { get; set; } = [];
    public List<NetworkLink> Links { get; set; } = [];
}

