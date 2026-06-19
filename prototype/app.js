const canvas = document.getElementById("topologyCanvas");
const linksLayer = document.getElementById("linksLayer");
const inventory = document.getElementById("inventory");
const selectedLabel = document.getElementById("selectedLabel");
const editorStatus = document.getElementById("editorStatus");
const emptyState = document.getElementById("emptyState");
const deviceMetric = document.getElementById("deviceMetric");
const linkMetric = document.getElementById("linkMetric");
const availabilityMetric = document.getElementById("availabilityMetric");
const pageTitle = document.getElementById("pageTitle");
const pageSubtitle = document.getElementById("pageSubtitle");
const saveButton = document.getElementById("saveTopology");

const storageKey = "netsimpro-prototype-topologies";
const labels = { router: "R", switch: "SW", server: "SV", pc: "PC", printer: "PR" };
const typeNames = { router: "Router", switch: "Switch", server: "Server", pc: "PC", printer: "Printer" };
const baseNames = { router: "Core Router", switch: "Main Switch", server: "Web Server", pc: "Workstation", printer: "Office Printer" };
const statuses = ["Online", "Online", "Warning", "Online", "Offline"];

let topologies = loadTopologies();
let activeTopologyId = topologies[0].id;
let topology = topologies[0];
let selectedId = null;
let pendingLinkId = null;
let connectMode = false;
let dragState = null;

function createDevice(type, name, status, ip, x, y) {
  return { id: crypto.randomUUID(), type, name, status, ip, x, y };
}

function createTopology(name, description, devices) {
  const topology = { id: crypto.randomUUID(), name, description, devices, links: [], updatedAt: new Date().toISOString() };
  return topology;
}

function demoTopologies() {
  const corporate = createTopology("Corporate Lab", "Office network simulation", [
    createDevice("router", "Core Router", "Online", "192.168.1.1", 90, 92),
    createDevice("switch", "Main Switch", "Online", "192.168.1.2", 285, 208),
    createDevice("server", "Web Server", "Warning", "192.168.1.10", 740, 92),
    createDevice("pc", "Design PC", "Online", "192.168.1.21", 150, 340),
    createDevice("printer", "Office Printer", "Offline", "192.168.1.40", 750, 340)
  ]);
  connectDemo(corporate, [[0, 1], [1, 2], [3, 1], [1, 4]]);

  const factory = createTopology("Factory Network", "Industrial floor with segmented equipment", [
    createDevice("router", "Factory Gateway", "Online", "10.20.0.1", 95, 90),
    createDevice("switch", "Production Switch", "Online", "10.20.0.2", 310, 205),
    createDevice("server", "SCADA Server", "Warning", "10.20.1.10", 710, 95),
    createDevice("pc", "Operator Station", "Online", "10.20.2.22", 180, 350)
  ]);
  connectDemo(factory, [[0, 1], [1, 2], [1, 3]]);

  const branch = createTopology("Branch Office", "Small office branch topology", [
    createDevice("router", "Branch Router", "Online", "172.16.0.1", 140, 110),
    createDevice("switch", "Access Switch", "Online", "172.16.0.2", 355, 230),
    createDevice("pc", "Reception PC", "Online", "172.16.1.20", 180, 360),
    createDevice("printer", "Shared Printer", "Online", "172.16.1.50", 640, 340)
  ]);
  connectDemo(branch, [[0, 1], [1, 2], [1, 3]]);

  const datacenter = createTopology("Datacenter", "Server and routing lab", [
    createDevice("router", "Edge Router", "Online", "10.0.0.1", 105, 95),
    createDevice("switch", "Core Switch", "Online", "10.0.0.2", 330, 220),
    createDevice("server", "API Server", "Online", "10.0.10.20", 650, 95),
    createDevice("server", "SQL Server", "Warning", "10.0.10.30", 740, 330),
    createDevice("server", "Backup Server", "Online", "10.0.10.40", 450, 370)
  ]);
  connectDemo(datacenter, [[0, 1], [1, 2], [1, 3], [1, 4]]);

  return [corporate, factory, branch, datacenter];
}

function connectDemo(topology, pairs) {
  topology.links = pairs.map(([sourceIndex, targetIndex]) => ({
    id: crypto.randomUUID(),
    sourceId: topology.devices[sourceIndex].id,
    targetId: topology.devices[targetIndex].id
  }));
}

function loadTopologies() {
  const saved = localStorage.getItem(storageKey);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length) return parsed;
    } catch {
      localStorage.removeItem(storageKey);
    }
  }
  return demoTopologies();
}

function persist(showMessage = true) {
  topology.updatedAt = new Date().toISOString();
  localStorage.setItem(storageKey, JSON.stringify(topologies));
  if (showMessage) setStatus("Topology saved locally.");
}

function setView(viewId) {
  document.querySelectorAll(".view").forEach((view) => view.classList.toggle("active", view.id === viewId));
  document.querySelectorAll(".nav").forEach((button) => button.classList.toggle("active", button.dataset.view === viewId));
  saveButton.style.visibility = viewId === "dashboardView" ? "visible" : "hidden";

  const titles = {
    dashboardView: [topology.name, "Professional network simulator with editable topology and Unity-ready data"],
    topologiesView: ["Topologies", "Create, load, and delete saved network designs"],
    devicesView: ["Devices", "Review and edit the inventory for the active topology"],
    metricsView: ["Metrics", "Operational overview for the simulated network"]
  };

  pageTitle.textContent = titles[viewId][0];
  pageSubtitle.textContent = titles[viewId][1];
  render();
}

function render() {
  renderTopologyCanvas();
  renderInventory();
  renderTopologyList();
  renderDeviceTable();
  renderMetrics();
  updateMetricCards();
}

function renderTopologyCanvas() {
  canvas.querySelectorAll(".node").forEach((node) => node.remove());
  linksLayer.innerHTML = "";
  topology.links = topology.links.filter((link) => hasDevice(link.sourceId) && hasDevice(link.targetId));

  for (const link of topology.links) {
    drawLink(getDevice(link.sourceId), getDevice(link.targetId));
  }

  for (const device of topology.devices) {
    const node = document.createElement("button");
    node.className = `node ${device.type}`;
    node.textContent = labels[device.type];
    node.style.left = `${device.x}px`;
    node.style.top = `${device.y}px`;
    node.dataset.id = device.id;
    node.title = `${device.name} (${device.status})`;
    if (device.id === selectedId) node.classList.add("selected");
    if (device.id === pendingLinkId) node.classList.add("pending-link");
    node.addEventListener("pointerdown", startDrag);
    node.addEventListener("click", selectOrConnect);
    canvas.appendChild(node);
  }

  emptyState.classList.toggle("visible", topology.devices.length === 0);
}

function drawLink(source, target) {
  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("class", "link-line");
  line.setAttribute("x1", source.x + 37);
  line.setAttribute("y1", source.y + 37);
  line.setAttribute("x2", target.x + 37);
  line.setAttribute("y2", target.y + 37);
  linksLayer.appendChild(line);
}

function renderInventory() {
  inventory.innerHTML = "";
  for (const device of topology.devices) {
    const row = document.createElement("div");
    row.className = "row";
    row.innerHTML = `<span>${device.name}<small>${typeNames[device.type]} - ${device.ip}</small></span><b class="${device.status.toLowerCase()}">${device.status}</b>`;
    row.addEventListener("click", () => selectDevice(device.id));
    inventory.appendChild(row);
  }
  const selected = getDevice(selectedId);
  selectedLabel.textContent = selected ? selected.name : "No selection";
}

function renderTopologyList() {
  const list = document.getElementById("topologyList");
  const details = document.getElementById("topologyDetails");
  if (!list || !details) return;
  list.innerHTML = "";

  for (const item of topologies) {
    const row = document.createElement("div");
    row.className = "topology-row";
    row.innerHTML = `
      <div class="table-title"><strong>${item.name}</strong><small>${item.description} - ${item.devices.length} devices - ${item.links.length} links</small></div>
      <div class="table-actions"><button data-action="load">Load</button><button class="delete" data-action="delete">Delete</button></div>
    `;
    row.querySelector('[data-action="load"]').addEventListener("click", () => loadTopologyById(item.id));
    row.querySelector('[data-action="delete"]').addEventListener("click", () => deleteTopology(item.id));
    list.appendChild(row);
  }

  document.getElementById("topologyName").value = topology.name;
  document.getElementById("topologyDescription").value = topology.description;
  details.innerHTML = `
    <dt>Active</dt><dd>${topology.name}</dd>
    <dt>Devices</dt><dd>${topology.devices.length}</dd>
    <dt>Links</dt><dd>${topology.links.length}</dd>
    <dt>Updated</dt><dd>${new Date(topology.updatedAt).toLocaleString()}</dd>
  `;
}

function renderDeviceTable() {
  const table = document.getElementById("deviceTable");
  const count = document.getElementById("deviceCountLabel");
  if (!table || !count) return;
  count.textContent = `${topology.devices.length} devices`;
  table.innerHTML = '<div class="device-table-row header"><span>Name</span><span>Type</span><span>Status</span><span>IP</span></div>';

  for (const device of topology.devices) {
    const row = document.createElement("div");
    row.className = `device-table-row ${device.id === selectedId ? "selected" : ""}`;
    row.innerHTML = `<span>${device.name}</span><span>${typeNames[device.type]}</span><span class="status-${device.status.toLowerCase()}">${device.status}</span><span>${device.ip}</span>`;
    row.addEventListener("click", () => selectDevice(device.id));
    table.appendChild(row);
  }

  syncDeviceForm();
}

function renderMetrics() {
  const online = topology.devices.filter((device) => device.status === "Online").length;
  const warning = topology.devices.filter((device) => device.status === "Warning").length;
  const offline = topology.devices.filter((device) => device.status === "Offline").length;
  document.getElementById("onlineDevicesMetric").textContent = online;
  document.getElementById("warningDevicesMetric").textContent = warning;
  document.getElementById("offlineDevicesMetric").textContent = offline;

  const bars = document.getElementById("healthBars");
  bars.innerHTML = "";
  const total = Math.max(topology.devices.length, 1);
  [
    ["Online", online, "#067647"],
    ["Warning", warning, "#b54708"],
    ["Offline", offline, "#b42318"]
  ].forEach(([label, value, color]) => {
    const percent = Math.round((value / total) * 100);
    const row = document.createElement("div");
    row.className = "health-row";
    row.innerHTML = `<span>${label}</span><div class="bar"><span style="width:${percent}%;background:${color}"></span></div><strong>${percent}%</strong>`;
    bars.appendChild(row);
  });
}

function updateMetricCards() {
  const online = topology.devices.filter((device) => device.status === "Online").length;
  const availability = topology.devices.length ? Math.round((online / topology.devices.length) * 1000) / 10 : 0;
  deviceMetric.textContent = topology.devices.length;
  linkMetric.textContent = topology.links.length;
  availabilityMetric.textContent = `${availability}%`;
}

function syncDeviceForm() {
  const device = getDevice(selectedId) || topology.devices[0];
  if (!device) return;
  selectedId = device.id;
  document.getElementById("editName").value = device.name;
  document.getElementById("editIp").value = device.ip;
  document.getElementById("editStatus").value = device.status;
}

function selectDevice(id) {
  selectedId = id;
  const device = getDevice(id);
  if (device) setStatus(`${device.name} selected.`);
  syncDeviceForm();
  render();
}

function loadTopologyById(id) {
  const next = topologies.find((item) => item.id === id);
  if (!next) return;
  activeTopologyId = id;
  topology = next;
  selectedId = topology.devices[0]?.id ?? null;
  pendingLinkId = null;
  connectMode = false;
  document.getElementById("connectMode").classList.remove("active");
  setStatus(`${topology.name} loaded.`);
  setView("dashboardView");
}

function deleteTopology(id) {
  if (topologies.length === 1) {
    setStatus("At least one topology must remain.");
    return;
  }
  topologies = topologies.filter((item) => item.id !== id);
  if (activeTopologyId === id) {
    activeTopologyId = topologies[0].id;
    topology = topologies[0];
    selectedId = topology.devices[0]?.id ?? null;
  }
  persist(false);
  setStatus("Topology deleted.");
  render();
}

function createNewTopology() {
  const next = createTopology("New Network", "Empty editable topology", []);
  topologies.push(next);
  activeTopologyId = next.id;
  topology = next;
  selectedId = null;
  persist(false);
  setStatus("New topology created.");
  setView("dashboardView");
}

function startDrag(event) {
  if (connectMode) {
    return;
  }

  const id = event.currentTarget.dataset.id;
  const device = getDevice(id);
  const rect = canvas.getBoundingClientRect();
  dragState = { id, offsetX: event.clientX - rect.left - device.x, offsetY: event.clientY - rect.top - device.y, moved: false };
  event.currentTarget.setPointerCapture(event.pointerId);
  window.addEventListener("pointermove", dragDevice);
  window.addEventListener("pointerup", stopDrag, { once: true });
}

function dragDevice(event) {
  if (!dragState) return;
  const device = getDevice(dragState.id);
  const rect = canvas.getBoundingClientRect();
  device.x = clamp(event.clientX - rect.left - dragState.offsetX, 8, rect.width - 82);
  device.y = clamp(event.clientY - rect.top - dragState.offsetY, 8, rect.height - 82);
  dragState.moved = true;
  renderTopologyCanvas();
}

function stopDrag() {
  window.removeEventListener("pointermove", dragDevice);
  if (dragState?.moved) {
    selectedId = dragState.id;
    persist(false);
    setStatus("Device position updated.");
  }
  dragState = null;
  render();
}

function selectOrConnect(event) {
  event.preventDefault();
  event.stopPropagation();

  const id = event.currentTarget.dataset.id;
  if (dragState?.moved) return;
  if (!connectMode) return selectDevice(id);
  if (!pendingLinkId) {
    pendingLinkId = id;
    selectedId = id;
    setStatus("Select another device to complete the connection.");
    render();
    return;
  }
  if (pendingLinkId === id) {
    pendingLinkId = null;
    setStatus("Connection cancelled.");
    render();
    return;
  }
  const exists = topology.links.some((link) => (link.sourceId === pendingLinkId && link.targetId === id) || (link.sourceId === id && link.targetId === pendingLinkId));
  if (!exists) {
    topology.links.push({ id: crypto.randomUUID(), sourceId: pendingLinkId, targetId: id });
    persist(false);
    setStatus("Connection created.");
  } else {
    setStatus("Those devices are already connected.");
  }
  pendingLinkId = null;
  render();
}

function addDevice() {
  const type = document.getElementById("deviceType").value;
  const count = topology.devices.filter((device) => device.type === type).length + 1;
  const device = createDevice(type, `${baseNames[type]} ${count}`, statuses[topology.devices.length % statuses.length], nextIp(), 80 + (topology.devices.length % 5) * 92, 70 + (topology.devices.length % 4) * 82);
  topology.devices.push(device);
  selectedId = device.id;
  persist(false);
  setStatus(`${baseNames[type]} added.`);
  render();
}

function nextIp() {
  return `192.168.1.${20 + topology.devices.length}`;
}

function deleteSelected() {
  if (!selectedId) return setStatus("Select a device before deleting.");
  const selected = getDevice(selectedId);
  topology.devices = topology.devices.filter((device) => device.id !== selectedId);
  topology.links = topology.links.filter((link) => link.sourceId !== selectedId && link.targetId !== selectedId);
  selectedId = topology.devices[0]?.id ?? null;
  pendingLinkId = null;
  persist(false);
  setStatus(`${selected.name} deleted.`);
  render();
}

function resetTopology() {
  localStorage.removeItem(storageKey);
  topologies = demoTopologies();
  activeTopologyId = topologies[0].id;
  topology = topologies[0];
  selectedId = topology.devices[0].id;
  pendingLinkId = null;
  connectMode = false;
  document.getElementById("connectMode").classList.remove("active");
  setStatus("Demo topologies restored.");
  render();
}

function toggleConnectMode() {
  connectMode = !connectMode;
  pendingLinkId = null;
  document.getElementById("connectMode").classList.toggle("active", connectMode);
  setStatus(connectMode ? "Connection mode enabled. Click the first device, then click the second device." : "Drag devices to reorganize the lab.");
  render();
}

function updateSelectedDevice(event) {
  event.preventDefault();
  const device = getDevice(selectedId);
  if (!device) return;
  device.name = document.getElementById("editName").value.trim() || device.name;
  device.ip = document.getElementById("editIp").value.trim() || device.ip;
  device.status = document.getElementById("editStatus").value;
  persist(false);
  setStatus(`${device.name} updated.`);
  render();
}

function updateTopologyDetails(event) {
  event.preventDefault();
  topology.name = document.getElementById("topologyName").value.trim() || topology.name;
  topology.description = document.getElementById("topologyDescription").value.trim() || topology.description;
  persist(false);
  pageTitle.textContent = topology.name;
  setStatus(`${topology.name} details updated.`);
  render();
}

function getDevice(id) { return topology.devices.find((device) => device.id === id); }
function hasDevice(id) { return topology.devices.some((device) => device.id === id); }
function setStatus(message) { editorStatus.textContent = message; }
function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }

document.querySelectorAll(".nav").forEach((button) => button.addEventListener("click", () => setView(button.dataset.view)));
document.getElementById("addDevice").addEventListener("click", addDevice);
document.getElementById("deleteSelected").addEventListener("click", deleteSelected);
document.getElementById("resetTopology").addEventListener("click", resetTopology);
document.getElementById("connectMode").addEventListener("click", toggleConnectMode);
document.getElementById("saveTopology").addEventListener("click", () => persist(true));
document.getElementById("createTopology").addEventListener("click", createNewTopology);
document.getElementById("deviceForm").addEventListener("submit", updateSelectedDevice);
document.getElementById("topologyForm").addEventListener("submit", updateTopologyDetails);

selectedId = topology.devices[0]?.id ?? null;
render();