using System;
using System.Collections.Generic;

namespace NetSimPro.Unity.Models
{
    [Serializable]
    public sealed class NetworkTopology
    {
        public string id;
        public string name;
        public List<NetworkDeviceDto> devices = new();
        public List<NetworkLinkDto> links = new();
    }

    [Serializable]
    public sealed class NetworkDeviceDto
    {
        public string id;
        public string name;
        public string deviceType;
        public string ipAddress;
        public string status;
        public float positionX;
        public float positionY;
        public float positionZ;
    }

    [Serializable]
    public sealed class NetworkLinkDto
    {
        public string id;
        public string sourceDeviceId;
        public string targetDeviceId;
        public int bandwidthMbps;
        public double latencyMs;
        public double packetLossPercent;
    }
}

