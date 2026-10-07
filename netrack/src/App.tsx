import { useEffect, useState } from "react";
import "./App.css";

import Dashboard from "./components/Dashboard";
import NewProject from "./pages/NewProject";

import { createEmptyProject } from "./constants";
import { ProjectDraft } from "./types";

type View = "dashboard" | "new-project";
const STORAGE_KEY = "netrack:project";

function loadProject(): ProjectDraft {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored) as ProjectDraft;
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

  return <Dashboard project={project} onNewProject={openNewProject} />;
}

export default App;
