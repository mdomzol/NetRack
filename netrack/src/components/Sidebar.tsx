type SidebarProps = {
  hasProject: boolean;
};

function Sidebar({ hasProject }: SidebarProps) {
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
        <button className="nav-item active" type="button">
          <span>⌂</span>
          Panel główny
        </button>

        <div className="nav-section-title">DOKUMENTACJA</div>
        {[
          ["▣", "Szafa"],
          ["◈", "Urządzenia"],
          ["▤", "Patchpanele"],
          ["⌁", "Połączenia"],
        ].map(([icon, label], index) => (
          <button className="nav-item" type="button" disabled key={label}>
            <span>{icon}</span>
            {label}
            <em>{index === 3 ? "Wkrótce" : hasProject ? "w projekcie" : "—"}</em>
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-brand-line">
          <span className="status-dot" />
          System gotowy
        </div>
        <div className="sidebar-footer-label">IT, które po prostu nie przeszkadza.</div>
      </div>
    </aside>
  );
}

export default Sidebar;
