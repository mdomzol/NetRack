function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">N</div>

        <div>
          <div className="brand-name">NetRack</div>
          <div className="brand-version">v0.1.0</div>
        </div>
      </div>

      <nav className="navigation">
        <div className="nav-section-title">
          WORKSPACE
        </div>

        <button className="nav-item active">
          <span>⌂</span>
          Dashboard
        </button>

        <div className="nav-section-title">
          PROJECT
        </div>

        <button className="nav-item">
          <span>▣</span>
          Szafa
        </button>

        <button className="nav-item">
          <span>◈</span>
          Urządzenia
        </button>

        <button className="nav-item">
          <span>▤</span>
          Patchpanele
        </button>

        <button className="nav-item">
          <span>⌁</span>
          Połączenia
        </button>
      </nav>

      <div className="sidebar-bottom">
        <div className="connection-status">
          <span className="status-dot" />
          Aplikacja gotowa
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;