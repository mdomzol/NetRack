import { ProjectDraft } from "../types";

export type DocumentationViewType =
  | "rack"
  | "devices"
  | "patch-panels"
  | "connections";

type Props = {
  project: ProjectDraft;
  view: DocumentationViewType;
};

const deviceLabels: Record<string, string> = {
  switch: "Switch",
  router: "Router",
  server: "Serwer",
  firewall: "Firewall",
  other: "Inne",
};

function DocumentationView({ project, view }: Props) {
  const connectedPorts = project.patchPanels.reduce(
    (total, panel) =>
      total + panel.portList.filter((port) => port.status === "connected").length,
    0
  );
  const totalPorts = project.patchPanels.reduce((total, panel) => total + panel.ports, 0);
  const mounted = (position: number | null) => position !== null;

  if (view === "rack") {
    return (
      <div className="documentation-page">
        <PageHeader eyebrow="DOKUMENTACJA / RACK" title={project.rack.name || "Szafa rack"} description="Parametry fizyczne szafy i aktualne rozmieszczenie wyposażenia." />
        <div className="documentation-grid rack-documentation">
          <section className="documentation-panel rack-overview-panel">
            <div className="documentation-panel-heading"><div><span>RACK</span><h2>{project.rack.name || "SR-01"}</h2></div><strong>{project.rack.heightU}U</strong></div>
            <div className="rack-visual-mini">
              {Array.from({ length: project.rack.heightU }, (_, i) => {
                const u = project.rack.heightU - i;
                const item = [...project.devices, ...project.patchPanels].find((x) => x.positionU !== null && u >= x.positionU && u < x.positionU + x.heightU);
                return <div key={u} className={`rack-mini-row ${item ? "occupied" : ""}`}><span>{u}</span><div>{item && <strong>{item.name}</strong>}</div></div>;
              })}
            </div>
          </section>
          <section className="documentation-panel">
            <PanelTitle eyebrow="PARAMETRY" title="Specyfikacja" />
            <DetailGrid items={[
              ["Lokalizacja", project.rack.location || "—"],
              ["Producent", project.rack.manufacturer || "—"],
              ["Model", project.rack.model || "—"],
              ["Wysokość", `${project.rack.heightU}U`],
              ["Szerokość", `${project.rack.width}"`],
              ["Głębokość", `${project.rack.depth} mm`],
            ]} />
          </section>
          <section className="documentation-panel documentation-panel-wide">
            <PanelTitle eyebrow="OBSADA" title="Wyposażenie szafy" />
            <EquipmentRows project={project} />
          </section>
        </div>
      </div>
    );
  }

  if (view === "devices") {
    return (
      <div className="documentation-page">
        <PageHeader eyebrow="DOKUMENTACJA / URZĄDZENIA" title="Urządzenia" description="Lista urządzeń infrastruktury wraz z pozycją w szafie." />
        <div className="documentation-toolbar"><span>{project.devices.length} urządzeń</span><span>{project.devices.filter((d) => mounted(d.positionU)).length} zamontowanych</span></div>
        <section className="documentation-panel documentation-list-panel">
          {project.devices.length ? project.devices.map((device) => (
            <div className="documentation-row" key={device.id}>
              <div className="documentation-type device-type">{deviceLabels[device.type] || "Urządzenie"}</div>
              <div className="documentation-main"><strong>{device.name}</strong><span>{device.manufacturer || "—"} · {device.model || "Model nie podany"}</span></div>
              <div className="documentation-meta"><span>{device.ports} portów</span><span>{device.heightU}U</span><span className={mounted(device.positionU) ? "mounted" : ""}>{mounted(device.positionU) ? `U${device.positionU}` : "POZA RACKIEM"}</span></div>
            </div>
          )) : <Empty text="Nie dodano jeszcze żadnych urządzeń." />}
        </section>
      </div>
    );
  }

  if (view === "patch-panels") {
    return (
      <div className="documentation-page">
        <PageHeader eyebrow="DOKUMENTACJA / PATCHPANELE" title="Patchpanele" description="Porty, typy okablowania i stan połączeń patchpaneli." />
        <div className="documentation-toolbar"><span>{project.patchPanels.length} patchpaneli</span><span>{connectedPorts}/{totalPorts} portów zajętych</span></div>
        <section className="documentation-panel documentation-list-panel">
          {project.patchPanels.length ? project.patchPanels.map((panel) => {
            const connected = panel.portList.filter((port) => port.status === "connected").length;
            return <div className="documentation-row" key={panel.id}>
              <div className="documentation-type patch-type">PP</div>
              <div className="documentation-main"><strong>{panel.name}</strong><span>{panel.manufacturer || "—"} · {panel.model || "Model nie podany"} · {panel.type}</span></div>
              <div className="documentation-meta"><span>{panel.ports} portów</span><span>{connected}/{panel.ports} zajętych</span><span className={mounted(panel.positionU) ? "mounted" : ""}>{mounted(panel.positionU) ? `U${panel.positionU}` : "POZA RACKIEM"}</span></div>
            </div>;
          }) : <Empty text="Nie dodano jeszcze żadnych patchpaneli." />}
        </section>
      </div>
    );
  }

  return (
    <div className="documentation-page">
      <PageHeader eyebrow="DOKUMENTACJA / POŁĄCZENIA" title="Połączenia" description="Widok portów patchpaneli i ich aktualnego stanu." />
      <div className="connection-summary">
        <div><span>PATCHPANELE</span><strong>{project.patchPanels.length}</strong></div>
        <div><span>PORTY</span><strong>{totalPorts}</strong></div>
        <div><span>ZAJĘTE</span><strong>{connectedPorts}</strong></div>
        <div><span>WOLNE</span><strong>{totalPorts - connectedPorts}</strong></div>
      </div>
      <section className="documentation-panel connection-panel">
        <PanelTitle eyebrow="PORTY" title="Mapa połączeń" />
        {project.patchPanels.length ? project.patchPanels.map((panel) => (
          <div className="port-group" key={panel.id}>
            <div className="port-group-header"><strong>{panel.name}</strong><span>{panel.type} · {panel.ports}P</span></div>
            <div className="port-grid">
              {panel.portList.map((port) => <div className={`port-cell ${port.status}`} key={port.id}><span>{port.label}</span><small>{port.status === "connected" ? "ZAJĘTY" : "WOLNY"}</small></div>)}
            </div>
          </div>
        )) : <Empty text="Dodaj patchpanel, aby rozpocząć dokumentowanie połączeń." />}
      </section>
    </div>
  );
}

function PageHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <header className="documentation-header"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div></header>;
}

function PanelTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return <div className="documentation-panel-title"><div><span>{eyebrow}</span><h2>{title}</h2></div></div>;
}

function DetailGrid({ items }: { items: [string, string][] }) {
  return <div className="documentation-details">{items.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>;
}

function EquipmentRows({ project }: { project: ProjectDraft }) {
  const items = [...project.devices.map((x) => ({ ...x, kind: "SW" })), ...project.patchPanels.map((x) => ({ ...x, kind: "PP" }))];
  return items.length ? <div className="documentation-equipment">{items.map((item) => <div className="documentation-row" key={item.id}><div className="documentation-type">{item.kind}</div><div className="documentation-main"><strong>{item.name}</strong><span>{item.manufacturer || "—"} · {item.model || "Model nie podany"}</span></div><div className="documentation-meta"><span>{item.heightU}U</span><span className={item.positionU !== null ? "mounted" : ""}>{item.positionU !== null ? `U${item.positionU}` : "POZA RACKIEM"}</span></div></div>)}</div> : <Empty text="Szafa nie ma jeszcze wyposażenia." />;
}

function Empty({ text }: { text: string }) {
  return <div className="documentation-empty"><strong>Brak danych</strong><span>{text}</span></div>;
}

export default DocumentationView;
