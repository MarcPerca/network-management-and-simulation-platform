using System.Collections;
using NetSimPro.Unity.Models;
using UnityEngine;
using UnityEngine.Networking;

namespace NetSimPro.Unity.Services
{
    public sealed class TopologyApiClient : MonoBehaviour
    {
        [SerializeField] private string apiBaseUrl = "https://localhost:5001/api";

        public IEnumerator LoadTopology(string networkId, System.Action<NetworkTopology> onLoaded)
        {
            var url = $"{apiBaseUrl}/networks/{networkId}/topology";

            using var request = UnityWebRequest.Get(url);
            yield return request.SendWebRequest();

            if (request.result != UnityWebRequest.Result.Success)
            {
                Debug.LogError($"Topology request failed: {request.error}");
                yield break;
            }

            var topology = JsonUtility.FromJson<NetworkTopology>(request.downloadHandler.text);
            onLoaded?.Invoke(topology);
        }
    }
}

