import StatCard from "./StatCard";
import Icon from "./Icon";
import { ProjectDraft } from "../types";

type DashboardProps = {
  onNavigate?: (view: "rack" | "devices" | "patch-panels" | "connections") => void;
  project: ProjectDraft;
  onNewProject: () => void;
};

function Dashboard({ project, onNewProject, onNavigate }: DashboardProps) {
  const hasProject = Boolean(project.name.trim());
  const occupiedItems = [...project.devices, ...project.patchPanels];
  const totalPorts = project.patchPanels.reduce((total, panel) => total + panel.ports, 0);
  const freePorts = project.patchPanels.reduce(
    (total, panel) => total + panel.portList.filter((port) => port.status === "free").length,
    0
  );

  return (
    <div className="app">
      <main className="main">
        <header className="topbar">
          <div>
            <div className="breadcrumb">NETRACK / DASHBOARD</div>
            <h1>Panel główny</h1>
          </div>

          <div className="project-info">
            <span className={`project-status ${hasProject ? "online" : ""}`} />
            {hasProject ? project.name : "Brak otwartego projektu"}
          </div>
        </header>

        <section className="content dashboard-content">
          <div className={`welcome ${hasProject ? "welcome-project" : ""}`}>
            <div className="welcome-copy">
              <span className="eyebrow">EDU-FIX / NETRACK</span>

              <h2>
                {hasProject ? (
                  <>
                    {project.name}
                    <br />
                    <span>Dokumentacja infrastruktury.</span>
                  </>
                ) : (
                  <>
                    Dokumentuj swoją
                    <br />
                    infrastrukturę sieciową.
                  </>
                )}
              </h2>

              <p>
                {hasProject
                  ? project.location + " · " + project.rack.name + " · " + project.rack.heightU + "U"
                  : "Projektuj i opisuj szafy rackowe, urządzenia oraz patchpanele w jednym uporządkowanym narzędziu."}
              </p>

              <button className="primary-button" onClick={onNewProject}>
                ＋ {hasProject ? "Nowy projekt" : "Utwórz pierwszy projekt"}
              </button>
            </div>
          </div>

          <div className="section-header">
            <div>
              <h3>Stan projektu</h3>
              <span>
                {hasProject ? "Aktualny stan dokumentowanej infrastruktury" : "Statystyki pojawią się po utworzeniu projektu"}
              </span>
            </div>
          </div>

          <div className="stats project-status-grid">
            <button className="stat-card stat-card-link project-status-card" type="button" onClick={() => onNavigate?.("devices")}>
              <span className="project-status-card-top">
                <span className="project-status-card-icon"><Icon name="switch" /></span>
                <span className="project-status-card-index">01</span>
              </span>
              <span className="stat-card-content">
                <span className="stat-card-label">Urządzenia</span>
                <strong>{project.devices.length}</strong>
                <span className="project-status-card-meta">
                  <b>{project.devices.filter((device) => device.positionU !== null).length}</b> zamontowanych w racku
                </span>
              </span>
              <span className="project-status-card-footer">
                <span className="project-status-card-track"><i style={{ width: project.devices.length ? `${(project.devices.filter((device) => device.positionU !== null).length / project.devices.length) * 100}%` : "0%" }} /></span>
                <span className="stat-card-arrow">→</span>
              </span>
            </button>

            <button className="stat-card stat-card-link project-status-card" type="button" onClick={() => onNavigate?.("patch-panels")}>
              <span className="project-status-card-top">
                <span className="project-status-card-icon"><Icon name="patch-panel" /></span>
                <span className="project-status-card-index">02</span>
              </span>
              <span className="stat-card-content">
                <span className="stat-card-label">Patchpanele</span>
                <strong>{project.patchPanels.length}</strong>
                <span className="project-status-card-meta">
                  <b>{project.patchPanels.filter((panel) => panel.positionU !== null).length}</b> zamontowanych w racku
                </span>
              </span>
              <span className="project-status-card-footer">
                <span className="project-status-card-track"><i style={{ width: project.patchPanels.length ? `${(project.patchPanels.filter((panel) => panel.positionU !== null).length / project.patchPanels.length) * 100}%` : "0%" }} /></span>
                <span className="stat-card-arrow">→</span>
              </span>
            </button>

            <button className="stat-card stat-card-link project-status-card" type="button" onClick={() => onNavigate?.("connections")}>
              <span className="project-status-card-top">
                <span className="project-status-card-icon"><Icon name="port" /></span>
                <span className="project-status-card-index">03</span>
              </span>
              <span className="stat-card-content">
                <span className="stat-card-label">Porty patchpaneli</span>
                <strong>{totalPorts}</strong>
                <span className="project-status-card-meta">
                  <b>{totalPorts - freePorts}</b> zajętych · {freePorts} wolnych
                </span>
              </span>
              <span className="project-status-card-footer">
                <span className="project-status-card-track"><i style={{ width: totalPorts ? `${((totalPorts - freePorts) / totalPorts) * 100}%` : "0%" }} /></span>
                <span className="stat-card-arrow">→</span>
              </span>
            </button>

            <button className="stat-card stat-card-link project-status-card project-status-card-accent" type="button" onClick={() => onNavigate?.("connections")}>
              <span className="project-status-card-top">
                <span className="project-status-card-icon"><Icon name="port" active /></span>
                <span className="project-status-card-index">04</span>
              </span>
              <span className="stat-card-content">
                <span className="stat-card-label">Wolne porty</span>
                <strong>{hasProject ? freePorts : "—"}</strong>
                <span className="project-status-card-meta">
                  {totalPorts ? <><b>{Math.round((freePorts / totalPorts) * 100)}%</b> dostępnych</> : "Brak patchpaneli"}
                </span>
              </span>
              <span className="project-status-card-footer">
                <span className="project-status-card-track"><i style={{ width: totalPorts ? `${(freePorts / totalPorts) * 100}%` : "0%" }} /></span>
                <span className="stat-card-arrow">→</span>
              </span>
            </button>
          </div>

          {hasProject && (
            <div className="dashboard-details">
              <div className="detail-panel">
                <div className="detail-panel-heading">
                  <div>
                    <span className="eyebrow">RACK</span>
                    <h3>{project.rack.name}</h3>
                  </div>
                  <span className="detail-badge">{project.rack.heightU}U</span>
                </div>

                <div className="detail-grid">
                  <div><span>Lokalizacja</span><strong>{project.rack.location || "Nie określono"}</strong></div>
                  <div><span>Wymiary</span><strong>{project.rack.width}" · {project.rack.depth} mm</strong></div>
                  <div><span>Producent</span><strong>{project.rack.manufacturer || "Nie określono"}</strong></div>
                  <div><span>Model</span><strong>{project.rack.model || "Nie określono"}</strong></div>
                </div>
              </div>

              <div className="detail-panel detail-panel-accent">
                <span className="eyebrow">INFRASTRUKTURA</span>
                <div className="mini-stat-list">
                  <div><span>Urządzenia w szafie</span><strong>{project.devices.filter((d) => d.positionU !== null).length}/{project.devices.length}</strong></div>
                  <div><span>Patchpanele w szafie</span><strong>{project.patchPanels.filter((p) => p.positionU !== null).length}/{project.patchPanels.length}</strong></div>
                  <div><span>Zajęte elementy</span><strong>{occupiedItems.length}</strong></div>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
