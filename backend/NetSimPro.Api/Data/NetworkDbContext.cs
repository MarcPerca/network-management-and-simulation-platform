using Microsoft.EntityFrameworkCore;
using NetSimPro.Api.Models;

namespace NetSimPro.Api.Data;

public sealed class NetworkDbContext : DbContext
{
    public NetworkDbContext(DbContextOptions<NetworkDbContext> options) : base(options)
    {
    }

    public DbSet<NetworkProject> Networks => Set<NetworkProject>();
    public DbSet<NetworkDevice> Devices => Set<NetworkDevice>();
    public DbSet<NetworkLink> Links => Set<NetworkLink>();
    public DbSet<DeviceMetric> DeviceMetrics => Set<DeviceMetric>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<NetworkDevice>()
            .Property(device => device.DeviceType)
            .HasConversion<string>();

        modelBuilder.Entity<NetworkDevice>()
            .Property(device => device.Status)
            .HasConversion<string>();

        modelBuilder.Entity<NetworkLink>()
            .HasOne(link => link.SourceDevice)
            .WithMany()
            .HasForeignKey(link => link.SourceDeviceId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<NetworkLink>()
            .HasOne(link => link.TargetDevice)
            .WithMany()
            .HasForeignKey(link => link.TargetDeviceId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

