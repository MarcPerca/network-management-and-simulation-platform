# Implementation Roadmap

## Phase 1: Functional Prototype

- Dashboard with metrics.
- Saved topology list.
- Device inventory.
- Editable device name, IP address, and status.
- Editable topology name and description.
- Drag-and-drop topology editor.
- Add and delete devices.
- Create visual links between devices.
- Persist data with localStorage.

## Phase 2: ASP.NET Core Backend

- Create REST endpoints for networks, devices, links, and metrics.
- Add validation and DTOs.
- Add OpenAPI/Swagger documentation.
- Add service/repository structure where useful.
- Replace prototype-only data with API-ready JSON models.

## Phase 3: SQL Server Persistence

- Implement EF Core entities and migrations.
- Store networks, devices, links, users, and metric history.
- Add seed data for demo topologies.
- Replace localStorage persistence with database persistence.

## Phase 4: React Dashboard

- Move the functional prototype into React components.
- Connect topology and device screens to the API.
- Add loading, error, and empty states.
- Add reusable forms, tables, and topology editor components.

## Phase 5: Authentication and Ownership

- Add login and registration.
- Associate networks with users.
- Protect API endpoints.
- Add role-ready structure for future administration features.

## Phase 6: Unity 3D Visualization

- Export topology snapshots from the API.
- Build Unity prefabs for PCs, servers, switches, routers, printers, and racks.
- Render a 3D lab environment.
- Sync device status and topology positions with the backend.

## Phase 7: Portfolio Polish

- Add tests for API services and controllers.
- Add deployment documentation.
- Add screenshots and demo GIF/video.
- Improve README with setup instructions and architecture diagrams.