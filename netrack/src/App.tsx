import { useEffect, useState } from "react";
import "./App.css";

import Dashboard from "./components/Dashboard";
import Sidebar from "./components/Sidebar";
import DocumentationView, {
  DocumentationViewType,
} from "./components/DocumentationView";
import NewProject from "./pages/NewProject";

import { createEmptyProject } from "./constants";
import { Connection, ConnectionEndpoint, ProjectDraft } from "./types";

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
            />
          </section>
        </main>
      )}
    </div>
  );
}

export default App;
