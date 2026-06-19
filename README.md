# Network Management and Simulation Platform

Network Management and Simulation Platform is a professional network management and simulation project built to demonstrate C#, ASP.NET Core, SQL Server, React, JavaScript, and Unity in one coherent portfolio project.

The application focuses on managing virtual network topologies: users can create saved networks, add devices, edit inventory data, connect nodes, inspect operational status, and prepare topology data for future 3D visualization in Unity.

## Current Version

The browser prototype is already functional and can be opened without installing dependencies:

```text
prototype/index.html
```

Current prototype features:

- Dashboard with network health metrics.
- Saved topologies: Corporate Lab, Factory Network, Branch Office, and Datacenter.
- Create, load, delete, and edit topologies.
- Device inventory with name, type, status, and IP address.
- Editable device name, IP address, and status.
- Drag-and-drop topology editor.
- Add routers, switches, servers, PCs, and printers.
- Create visual connections between devices.
- Local persistence using browser localStorage.

## Target Architecture

```text
NetSimPro/
  backend/NetSimPro.Api/       ASP.NET Core REST API in C#
  frontend/                    React management dashboard
  unity/Assets/Scripts/        Optional Unity 3D visualization module
  sql/                         SQL Server schema and seed data
  docs/                        Architecture, API contract, and roadmap
  prototype/                   Functional browser prototype
```

## Core Product Scope

- Network topology management.
- Device inventory management.
- IP address and device status tracking.
- Saved network projects.
- Link/connection visualization.
- Operational dashboard and metrics.
- SQL Server persistence through an ASP.NET Core API.
- React frontend connected to API endpoints.
- Optional Unity module for 3D lab visualization.

## Recommended Development Order

1. Finalize the functional browser prototype.
2. Build the ASP.NET Core REST API.
3. Move persistence from localStorage to SQL Server.
4. Connect the React dashboard to the API.
5. Add authentication and user-owned networks.
6. Export topology snapshots for Unity.
7. Build the Unity 3D visualization module.

## Local Development Notes

To run the full target stack on a development machine, install:

- .NET SDK 8 or later
- Node.js 20 or later
- SQL Server Developer Edition or SQL Server Express
- Unity 2022 LTS or later

Backend:

```powershell
cd backend/NetSimPro.Api
dotnet restore
dotnet ef database update
dotnet run
```

Frontend:

```powershell
cd frontend
npm install
npm run dev
```

For the current functional prototype, open `prototype/index.html` directly in a browser.