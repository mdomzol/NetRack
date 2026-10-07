import { useEffect, useState } from "react";
import "./App.css";

import Dashboard from "./components/Dashboard";
import Sidebar from "./components/Sidebar";
import DocumentationView, {
  DocumentationViewType,
} from "./components/DocumentationView";
import NewProject from "./pages/NewProject";

import { createEmptyProject, DEVICE_MODELS } from "./constants";
import DeviceEditorModal from "./components/DeviceEditorModal";
import PatchPanelEditorModal from "./components/PatchPanelEditorModal";
import RackAccessoryEditorModal from "./components/RackAccessoryEditorModal";
import { Connection, ConnectionEndpoint, ProjectDraft, Device, PatchPanel, PatchPanelPort, RackAccessory, RackAccessoryType } from "./types";

type View = "dashboard" | DocumentationViewType | "new-project";
const STORAGE_KEY = "netrack:project";

function migrateConnection(value: unknown): Connection | null {
  if (!value || typeof value !== "object") return null;

  const item = value as Partial<Connection> & {
    deviceId?: string;
    devicePort?: number;
    patchPanelId?: string;
    patchPanelPortId?: string;
  };

  if (item.from && item.to) return item as Connection;

  if (
    item.deviceId &&
    typeof item.devicePort === "number" &&
    item.patchPanelId &&
    item.patchPanelPortId
  ) {
    return {
      id: item.id ?? crypto.randomUUID(),
      from: { kind: "device", deviceId: item.deviceId, port: item.devicePort },
      to: {
        kind: "patch-panel",
        patchPanelId: item.patchPanelId,
        portId: item.patchPanelPortId,
      },
    };
  }

  return null;
}

function loadProject(): ProjectDraft {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as ProjectDraft;
      return {
        ...parsed,
        accessories: Array.isArray(parsed.accessories) ? parsed.accessories : [],
        connections: Array.isArray(parsed.connections)
          ? parsed.connections
              .map(migrateConnection)
              .filter((item): item is Connection => Boolean(item))
          : [],
      };
    }
  } catch {
    // Ignore invalid local data and start clean.
  }
  return createEmptyProject();
}

function endpointKey(endpoint: ConnectionEndpoint) {
  return endpoint.kind === "device"
    ? `device:${endpoint.deviceId}:port:${endpoint.port}`
    : `patch-panel:${endpoint.patchPanelId}:port:${endpoint.portId}`;
}

function updateConnectionPortStatuses(
  patchPanels: ProjectDraft["patchPanels"],
  connections: Connection[]
) {
  const connectedPorts = new Set(
    connections.flatMap((connection) =>
      [connection.from, connection.to]
        .filter(
          (endpoint): endpoint is Extract<
            ConnectionEndpoint,
            { kind: "patch-panel" }
          > => endpoint.kind === "patch-panel"
        )
        .map(endpointKey)
    )
  );

  return patchPanels.map((panel) => ({
    ...panel,
    portList: panel.portList.map((port) => ({
      ...port,
      status: connectedPorts.has(
        endpointKey({
          kind: "patch-panel",
          patchPanelId: panel.id,
          portId: port.id,
        })
      )
        ? "connected"
        : "free",
    })),
  }));
}

function App() {
  const [view, setView] = useState<View>("dashboard");
  const [project, setProject] = useState<ProjectDraft>(loadProject);
  const [draft, setDraft] = useState<ProjectDraft>(createEmptyProject);
  const [focusedDeviceId, setFocusedDeviceId] = useState<string | null>(null);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [editingPatchPanel, setEditingPatchPanel] = useState<PatchPanel | null>(null);
  const [editingAccessory, setEditingAccessory] = useState<RackAccessory | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
    } catch {
      // Storage is optional; the application remains usable without it.
    }
  }, [project]);

  const openNewProject = () => {
    setDraft(createEmptyProject());
    setView("new-project");
  };

  const cancelNewProject = () => setView("dashboard");

  const createProject = (createdProject: ProjectDraft) => {
    setProject(createdProject);
    setView("dashboard");
  };

  const createPatchPanelPorts = (count: number): PatchPanelPort[] =>
    Array.from({ length: count }, (_, index) => ({ id: crypto.randomUUID(), number: index + 1, label: String(index + 1).padStart(2, "0"), status: "free" }));

  const addDevice = () => {
    const device: Device = { id: crypto.randomUUID(), name: "SW-" + String(project.devices.length + 1).padStart(2, "0"), type: "switch", manufacturer: "", model: "", ports: 24, heightU: 1, positionU: null };
    setProject((current) => ({ ...current, devices: [...current.devices, device] }));
    setEditingDevice(device);
  };

  const addPatchPanel = () => {
    const ports = 24;
    const panel: PatchPanel = { id: crypto.randomUUID(), name: "PP-" + String(project.patchPanels.length + 1).padStart(2, "0"), manufacturer: "", model: "", type: "Cat.6", ports, heightU: 1, positionU: null, portList: createPatchPanelPorts(ports) };
    setProject((current) => ({ ...current, patchPanels: [...current.patchPanels, panel] }));
    setEditingPatchPanel(panel);
  };

  const addAccessory = (type: RackAccessoryType) => {
    const labels: Record<RackAccessoryType, string> = { organizer: "ORGANIZER", maskownica: "MASKOWNICA", ups: "UPS", listwa: "LISTWA" };
    const heights: Record<RackAccessoryType, number> = { organizer: 1, maskownica: 1, ups: 2, listwa: 1 };
    const item: RackAccessory = { id: crypto.randomUUID(), name: labels[type] + "-" + String(project.accessories.filter((x) => x.type === type).length + 1).padStart(2, "0"), type, manufacturer: "", model: "", heightU: heights[type], positionU: null };
    setProject((current) => ({ ...current, accessories: [...current.accessories, item] }));
    setEditingAccessory(item);
  };
  const moveRackItem = (
    id: string,
    type: "device" | "patch-panel" | "accessory",
    positionU: number
  ): boolean => {
    let moved = false;

    setProject((current) => {
      const items = [
        ...current.devices.map((item) => ({ id: item.id, heightU: item.heightU, positionU: item.positionU })),
        ...current.patchPanels.map((item) => ({ id: item.id, heightU: item.heightU, positionU: item.positionU })),
        ...current.accessories.map((item) => ({ id: item.id, heightU: item.heightU, positionU: item.positionU })),
      ];
      const item = items.find((candidate) => candidate.id === id);
      if (!item) return current;
      if (positionU < 1 || positionU + item.heightU - 1 > current.rack.heightU) return current;

      const overlaps = items.some((other) => {
        if (other.id === id || other.positionU === null) return false;
        const nextStart = positionU;
        const nextEnd = positionU + item.heightU - 1;
        const otherStart = other.positionU;
        const otherEnd = other.positionU + other.heightU - 1;
        return nextStart <= otherEnd && otherStart <= nextEnd;
      });
      if (overlaps) return current;

      moved = true;
      if (type === "device") {
        return { ...current, devices: current.devices.map((device) => device.id === id ? { ...device, positionU } : device) };
      }
      if (type === "patch-panel") {
        return { ...current, patchPanels: current.patchPanels.map((panel) => panel.id === id ? { ...panel, positionU } : panel) };
      }
      return { ...current, accessories: current.accessories.map((accessory) => accessory.id === id ? { ...accessory, positionU } : accessory) };
    });

    return moved;
  };

  const removeRackItem = (id: string, type: "device" | "patch-panel" | "accessory") => {
    setProject((current) => {
      if (type === "device") {
        const connections = current.connections.filter((connection) =>
          ![connection.from, connection.to].some((endpoint) => endpoint.kind === "device" && endpoint.deviceId === id)
        );
        return {
          ...current,
          devices: current.devices.filter((device) => device.id !== id),
          connections,
          patchPanels: updateConnectionPortStatuses(current.patchPanels, connections),
        };
      }
      if (type === "patch-panel") {
        const connections = current.connections.filter((connection) =>
          ![connection.from, connection.to].some((endpoint) => endpoint.kind === "patch-panel" && endpoint.patchPanelId === id)
        );
        return {
          ...current,
          patchPanels: updateConnectionPortStatuses(current.patchPanels.filter((panel) => panel.id !== id), connections),
          connections,
        };
      }
      return { ...current, accessories: current.accessories.filter((accessory) => accessory.id !== id) };
    });
    if (type === "device") setEditingDevice((current) => current?.id === id ? null : current);
    if (type === "patch-panel") setEditingPatchPanel((current) => current?.id === id ? null : current);
    if (type === "accessory") setEditingAccessory((current) => current?.id === id ? null : current);
  };

  const saveConnection = (connection: Connection) => {
    setProject((current) => {
      const connections = current.connections.some((item) => item.id === connection.id)
        ? current.connections.map((item) =>
            item.id === connection.id ? connection : item
          )
        : [...current.connections, connection];

      return {
        ...current,
        connections,
        patchPanels: updateConnectionPortStatuses(
          current.patchPanels,
          connections
        ),
      };
    });
  };

  const deleteConnection = (id: string) => {
    setProject((current) => {
      const connections = current.connections.filter(
        (connection) => connection.id !== id
      );
      return {
        ...current,
        connections,
        patchPanels: updateConnectionPortStatuses(
          current.patchPanels,
          connections
        ),
      };
    });
  };

  if (view === "new-project") {
    return (
      <NewProject
        project={draft}
        setProject={setDraft}
        onCancel={cancelNewProject}
        onCreateProject={createProject}
      />
    );
  }

  const navigate = (nextView: View) => setView(nextView);
  const openDevice = (deviceId: string) => {
    setFocusedDeviceId(deviceId);
    setView("devices");
  };

  return (
    <div className="app">
      <Sidebar
        hasProject={Boolean(project.name.trim())}
        activeView={view}
        onNavigate={navigate}
      />

      {view === "dashboard" ? (
        <Dashboard
          project={project}
          onNewProject={openNewProject}
          onNavigate={navigate}
        />
      ) : (
        <main className="main">
          <header className="topbar">
            <div className="topbar-project">
              <span className="topbar-label">PROJEKT</span>
              <strong>{project.name || "Brak projektu"}</strong>
              <span className="topbar-location">{project.location || "Lokalizacja nie podana"}</span>
            </div>
            <div className="topbar-meta">
              <span><b>{project.rack.heightU}U</b> RACK</span>
              <span><b>{project.devices.length}</b> URZĄDZENIA</span>
              <span><b>{project.patchPanels.length}</b> PATCHPANELE</span>
              <span><b>{project.connections.length}</b> POŁĄCZENIA</span>
              <span><b>{project.accessories.length}</b> AKCESORIA</span>
            </div>
          </header>

          <section className="content documentation-content">
            <DocumentationView
              project={project}
              view={view}
              onSaveConnection={saveConnection}
              onDeleteConnection={deleteConnection}
              onOpenDevice={openDevice}
              focusedDeviceId={focusedDeviceId}
              onClearFocusedDevice={() => setFocusedDeviceId(null)}
              onAddDevice={addDevice}
              onAddPatchPanel={addPatchPanel}
              onAddAccessory={addAccessory}
              onMoveItem={moveRackItem}
              onRemoveItem={removeRackItem}
            />
          </section>
        </main>
      )}

      {editingDevice && (
        <DeviceEditorModal
          device={editingDevice}
          rackHeight={project.rack.heightU}
          deviceModels={DEVICE_MODELS}
          onSave={(changes) => {
            setProject((current) => ({
              ...current,
              devices: current.devices.map((device) =>
                device.id === editingDevice.id ? { ...device, ...changes } : device
              ),
            }));
            setEditingDevice(null);
          }}
          onCancel={() => setEditingDevice(null)}
        />
      )}

      {editingPatchPanel && (
        <PatchPanelEditorModal
          patchPanel={editingPatchPanel}
          rackHeight={project.rack.heightU}
          onSave={(updatedPatchPanel) => {
            setProject((current) => ({
              ...current,
              patchPanels: current.patchPanels.map((panel) =>
                panel.id === updatedPatchPanel.id ? updatedPatchPanel : panel
              ),
            }));
            setEditingPatchPanel(null);
          }}
          onCancel={() => setEditingPatchPanel(null)}
        />
      )}

      {editingAccessory && (
        <RackAccessoryEditorModal
          accessory={editingAccessory}
          rackHeight={project.rack.heightU}
          onSave={(changes) => {
            setProject((current) => ({
              ...current,
              accessories: current.accessories.map((accessory) =>
                accessory.id === editingAccessory.id ? { ...accessory, ...changes } : accessory
              ),
            }));
            setEditingAccessory(null);
          }}
          onCancel={() => setEditingAccessory(null)}
        />
      )}
    </div>
  );
}

export default App;
