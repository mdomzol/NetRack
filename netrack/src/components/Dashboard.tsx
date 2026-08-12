import Sidebar from "./Sidebar";
import StatCard from "./StatCard";

type DashboardProps = {
  onNewProject: () => void;
};

function Dashboard({ onNewProject }: DashboardProps) {
  return (
    <div className="app">
      <Sidebar />

      <main className="main">
        <header className="topbar">
          <div>
            <div className="breadcrumb">
              NETRACK / DASHBOARD
            </div>

            <h1>Dashboard</h1>
          </div>

          <div className="project-info">
            <span className="project-status" />
            Brak otwartego projektu
          </div>
        </header>

        <section className="content">
          <div className="welcome">
            <div>
              <span className="eyebrow">
                NETWORK DOCUMENTATION
              </span>

              <h2>
                Dokumentuj swoją
                <br />
                infrastrukturę sieciową.
              </h2>

              <p>
                Twórz interaktywne schematy połączeń,
                dokumentuj patchpanele i urządzenia oraz
                generuj gotową dokumentację szafy.
              </p>

              <button
                className="primary-button"
                onClick={onNewProject}
              >
                + Nowy projekt
              </button>
            </div>

            <div className="welcome-graphic">
              <div className="graphic-rack">
                <div className="rack-unit">PP-01</div>
                <div className="rack-unit">SW-01</div>
                <div className="rack-unit">SW-02</div>
                <div className="rack-unit">RTR-01</div>
              </div>

              <div className="graphic-lines">
                <span />
                <span />
                <span />
                <span />
              </div>
            </div>
          </div>

          <div className="section-header">
            <div>
              <h3>Projekt</h3>

              <span>
                Statystyki aktualnego projektu
              </span>
            </div>
          </div>

          <div className="stats">
            <StatCard
              label="Urządzenia"
              value="0"
              icon="◈"
            />

            <StatCard
              label="Patchpanele"
              value="0"
              icon="▤"
            />

            <StatCard
              label="Połączenia"
              value="0"
              icon="⌁"
            />

            <StatCard
              label="Wolne porty"
              value="—"
              icon="○"
            />
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;