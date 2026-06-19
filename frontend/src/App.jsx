import React from "react";
import { createRoot } from "react-dom/client";
import { Activity, Database, Monitor, Network, Router, Server } from "lucide-react";
import "./styles.css";

const devices = [
  { name: "Core Router", type: "Router", status: "Online", ip: "10.0.0.1" },
  { name: "Main Switch", type: "Switch", status: "Online", ip: "10.0.0.2" },
  { name: "Web Server", type: "Server", status: "Warning", ip: "10.0.1.10" },
  { name: "Design PC", type: "PC", status: "Online", ip: "10.0.2.21" },
  { name: "Office Printer", type: "Printer", status: "Offline", ip: "10.0.3.15" }
];

function App() {
  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand"><Network size={22} /> Network Management and Simulation Platform</div>
        <button className="nav active"><Monitor size={18} /> Dashboard</button>
        <button className="nav"><Router size={18} /> Topologies</button>
        <button className="nav"><Database size={18} /> Inventory</button>
        <button className="nav"><Activity size={18} /> Metrics</button>
      </aside>

      <section className="content">
        <header className="header">
          <div>
            <h1>Corporate Lab</h1>
            <p>12 devices, 14 links, 3 active alerts</p>
          </div>
          <button className="primary">Open in Unity</button>
        </header>

        <section className="stats">
          <article><span>Availability</span><strong>96.8%</strong></article>
          <article><span>Avg latency</span><strong>4.2 ms</strong></article>
          <article><span>Traffic</span><strong>842 Mbps</strong></article>
          <article><span>Packet loss</span><strong>0.4%</strong></article>
        </section>

        <section className="workspace">
          <div className="topology">
            <div className="node router">R</div>
            <div className="node switch">S</div>
            <div className="node server"><Server size={24} /></div>
            <div className="node pc">PC</div>
            <div className="node printer">P</div>
            <span className="link l1" />
            <span className="link l2" />
            <span className="link l3" />
            <span className="link l4" />
          </div>

          <div className="table">
            <h2>Devices</h2>
            {devices.map((device) => (
              <div className="row" key={device.name}>
                <span>{device.name}</span>
                <span>{device.type}</span>
                <span>{device.ip}</span>
                <b className={device.status.toLowerCase()}>{device.status}</b>
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);

