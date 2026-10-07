type NavigationView = "dashboard" | "rack" | "devices" | "patch-panels" | "connections";

type SidebarProps = {
  hasProject: boolean;
  activeView: NavigationView;
  onNavigate: (view: NavigationView) => void;
};

function Sidebar({ hasProject, activeView, onNavigate }: SidebarProps) {
  const items: { view: NavigationView; icon: string; label: string }[] = [
    { view: "rack", icon: "▣", label: "Szafa" },
    { view: "devices", icon: "◈", label: "Urządzenia" },
    { view: "patch-panels", icon: "▤", label: "Patchpanele" },
    { view: "connections", icon: "⌁", label: "Połączenia" },
  ];

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">EF</div>
        <div>
          <div className="brand-name">NetRack</div>
          <div className="brand-version">EDU-FIX · v0.1.0</div>
        </div>
      </div>

      <nav className="navigation" aria-label="Nawigacja">
        <div className="nav-section-title">WORKSPACE</div>
        <button
          className={`nav-item ${activeView === "dashboard" ? "active" : ""}`}
          type="button"
          onClick={() => onNavigate("dashboard")}
        >
          <span>⌂</span>
          Panel główny
        </button>

        <div className="nav-section-title">DOKUMENTACJA</div>
        {items.map(({ view, icon, label }) => (
          <button
            className={`nav-item ${activeView === view ? "active" : ""}`}
            type="button"
            key={view}
            onClick={() => onNavigate(view)}
            disabled={!hasProject}
          >
            <span>{icon}</span>
            {label}
            <em>{hasProject ? "" : "—"}</em>
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-brand-line">
          <span className="status-dot" />
          {hasProject ? "Projekt aktywny" : "Brak projektu"}
        </div>
        <div className="sidebar-footer-label">IT, które po prostu nie przeszkadza.</div>
      </div>
    </aside>
  );
}

export default Sidebar;
