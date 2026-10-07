import { useEffect, useState } from "react";
import "./App.css";

import Dashboard from "./components/Dashboard";
import Sidebar from "./components/Sidebar";
import DocumentationView, {
  DocumentationViewType,
} from "./components/DocumentationView";
import NewProject from "./pages/NewProject";

import { createEmptyProject } from "./constants";
import { Connection, ProjectDraft } from "./types";

type View = "dashboard" | DocumentationViewType | "new-project";
const STORAGE_KEY = "netrack:project";

function loadProject(): ProjectDraft {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as ProjectDraft;
      return { ...parsed, connections: parsed.connections ?? [] };
    }
  } catch {
    // Ignore invalid local data and start clean.
  }
  return createEmptyProject();
}

function App() {
  const [view, setView] = useState<View>("dashboard");
  const [project, setProject] = useState<ProjectDraft>(loadProject);
  const [draft, setDraft] = useState<ProjectDraft>(createEmptyProject);

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

  const updateConnectionPortStatuses = (patchPanels: ProjectDraft["patchPanels"], connections: Connection[]) => {
    const connectedPorts = new Set(
      connections.map((connection) => `${connection.patchPanelId}:${connection.patchPanelPortId}`)
    );

    return patchPanels.map((panel) => ({
      ...panel,
      portList: panel.portList.map((port) => ({
        ...port,
        status: connectedPorts.has(`${panel.id}:${port.id}`) ? "connected" : "free",
      })),
    }));
  };

  const saveConnection = (connection: Connection) => {
    setProject((current) => {
      const connections = current.connections.some((item) => item.id === connection.id)
        ? current.connections.map((item) => item.id === connection.id ? connection : item)
        : [...current.connections, connection];

      return {
        ...current,
        connections,
        patchPanels: updateConnectionPortStatuses(current.patchPanels, connections),
      };
    });
  };

  const deleteConnection = (id: string) => {
    setProject((current) => {
      const connections = current.connections.filter((connection) => connection.id !== id);
      return {
        ...current,
        connections,
        patchPanels: updateConnectionPortStatuses(current.patchPanels, connections),
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
            <div>
              <div className="breadcrumb">NETRACK / DOKUMENTACJA</div>
              <h1>
                {view === "rack"
                  ? "Szafa"
                  : view === "devices"
                    ? "Urządzenia"
                    : view === "patch-panels"
                      ? "Patchpanele"
                      : "Połączenia"}
              </h1>
            </div>
            <div className="project-info">
              <span className="project-status online" />
              {project.name || "Brak projektu"}
            </div>
          </header>

          <section className="content documentation-content">
            <DocumentationView project={project} view={view} />
          </section>
        </main>
      )}
    </div>
  );
}

export default App;
