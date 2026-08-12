import { useState } from "react";
import "./App.css";

import Dashboard from "./components/Dashboard";
import NewProject from "./pages/NewProject";

import { createEmptyProject } from "./constants";
import { ProjectDraft } from "./types";

type View = "dashboard" | "new-project";

function App() {
  const [view, setView] = useState<View>("dashboard");

  const [project, setProject] =
    useState<ProjectDraft>(createEmptyProject());

  const openNewProject = () => {
    setProject(createEmptyProject());
    setView("new-project");
  };

  const cancelNewProject = () => {
    setView("dashboard");
  };

  const createProject = (
    createdProject: ProjectDraft
  ) => {
    setProject(createdProject);
    setView("dashboard");
  };

  if (view === "new-project") {
    return (
      <NewProject
        project={project}
        setProject={setProject}
        onCancel={cancelNewProject}
        onCreateProject={createProject}
      />
    );
  }

  return (
    <Dashboard
      onNewProject={openNewProject}
    />
  );
}

export default App;