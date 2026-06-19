using System.Collections.Generic;
using NetSimPro.Unity.Models;
using UnityEngine;

namespace NetSimPro.Unity.Rendering
{
    public sealed class TopologyRenderer : MonoBehaviour
    {
        [SerializeField] private GameObject pcPrefab;
        [SerializeField] private GameObject serverPrefab;
        [SerializeField] private GameObject switchPrefab;
        [SerializeField] private GameObject routerPrefab;
        [SerializeField] private GameObject printerPrefab;
        [SerializeField] private Material linkMaterial;

        private readonly Dictionary<string, Transform> spawnedDevices = new();

        public void Render(NetworkTopology topology)
        {
            Clear();

            foreach (var device in topology.devices)
            {
                var prefab = ResolvePrefab(device.deviceType);
                var position = new Vector3(device.positionX, device.positionY, device.positionZ);
                var instance = Instantiate(prefab, position, Quaternion.identity, transform);
                instance.name = device.name;
                spawnedDevices[device.id] = instance.transform;
            }

            foreach (var link in topology.links)
            {
                if (!spawnedDevices.TryGetValue(link.sourceDeviceId, out var source) ||
                    !spawnedDevices.TryGetValue(link.targetDeviceId, out var target))
                {
                    continue;
                }

                RenderLink(source.position, target.position);
            }
        }

        private GameObject ResolvePrefab(string deviceType)
        {
            return deviceType switch
            {
                "Pc" => pcPrefab,
                "Server" => serverPrefab,
                "Switch" => switchPrefab,
                "Router" => routerPrefab,
                "Printer" => printerPrefab,
                _ => pcPrefab
            };
        }

        private void RenderLink(Vector3 source, Vector3 target)
        {
            var linkObject = new GameObject("Network Link");
            linkObject.transform.SetParent(transform);

            var line = linkObject.AddComponent<LineRenderer>();
            line.material = linkMaterial;
            line.positionCount = 2;
            line.startWidth = 0.04f;
            line.endWidth = 0.04f;
            line.SetPosition(0, source);
            line.SetPosition(1, target);
        }

        private void Clear()
        {
            spawnedDevices.Clear();

            for (var index = transform.childCount - 1; index >= 0; index--)
            {
                Destroy(transform.GetChild(index).gameObject);
            }
        }
    }
}

