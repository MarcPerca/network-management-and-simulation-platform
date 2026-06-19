# API Contract

Base URL: `https://localhost:5001/api`

## Networks

`GET /networks`

Returns the networks owned by the current user.

```json
[
  {
    "id": "9f1ccff8-8a0f-4dd5-8a3f-06a3cb82dafa",
    "name": "Corporate Lab",
    "description": "Office network simulation",
    "deviceCount": 12,
    "linkCount": 14,
    "updatedAt": "2026-06-19T08:30:00Z"
  }
]
```

`GET /networks/{id}/topology`

Returns devices and links for React and Unity.

`POST /networks`

Creates a network.

`PUT /networks/{id}/topology`

Saves a topology snapshot.

## Devices

`GET /networks/{networkId}/devices`

`POST /networks/{networkId}/devices`

`PUT /devices/{deviceId}`

`DELETE /devices/{deviceId}`

## Metrics

`GET /networks/{networkId}/metrics/summary`

Returns aggregate simulation metrics.

`POST /metrics/device`

Stores a simulated metric event from Unity or a backend worker.

