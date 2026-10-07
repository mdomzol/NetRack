import { useState, type CSSProperties } from "react";
import ConnectionEditorModal from "./ConnectionEditorModal";
import { Connection, ConnectionEndpoint, ProjectDraft } from "../types";

export type DocumentationViewType =
  | "rack"
  | "devices"
  | "patch-panels"
  | "connections";

type Props = {
  project: ProjectDraft;
  view: DocumentationViewType;
  onSaveConnection: (connection: Connection) => void;
  onDeleteConnection: (id: string) => void;
};

function endpointLabel(endpoint: ConnectionEndpoint, project: ProjectDraft) {
  if (endpoint.kind === "device") {
    const device = project.devices.find((item) => item.id === endpoint.deviceId);
    return (device?.name || "Nieznane urządzenie") + "-" + String(endpoint.port).padStart(2, "0");
  }

  const panel = project.patchPanels.find((item) => item.id === endpoint.patchPanelId);
  const port = panel?.portList.find((item) => item.id === endpoint.portId);
  return (panel?.name || "Nieznany patchpanel") + "-" + (port?.label || "??");
}

function endpointKindLabel(endpoint: ConnectionEndpoint) {
  return endpoint.kind === "device" ? "AKTYWNE" : "PASYWNE";
}

const deviceLabels: Record<string, string> = {
  switch: "Switch",
  router: "Router",
  server: "Serwer",
  firewall: "Firewall",
  other: "Inne",
};

function DocumentationView({ project, view, onSaveConnection, onDeleteConnection }: Props) {
  const [editingConnectionId, setEditingConnectionId] = useState<string | null>(null);
  const [creatingConnection, setCreatingConnection] = useState(false);
  const connectedPorts = project.patchPanels.reduce(
    (total, panel) =>
      total + panel.portList.filter((port) => port.status === "connected").length,
    0
  );
  const totalPorts = project.patchPanels.reduce((total, panel) => total + panel.ports, 0);
  const mounted = (position: number | null) => position !== null;
  const editingConnection = project.connections.find((connection) => connection.id === editingConnectionId) ?? null;

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
      <PageHeader
        eyebrow="DOKUMENTACJA / POŁĄCZENIA"
        title="Połączenia"
        description="Mapa całej szafy z portami urządzeń. Najedź na port, aby zobaczyć jego połączenie i drugi koniec trasy."
      />
      <div className="connections-toolbar">
        <div className="connection-toolbar-copy"><span>MAPA OKABLOWANIA</span><strong>{project.connections.length} połączeń</strong></div>
        <button type="button" className="primary-button" onClick={() => setCreatingConnection(true)}>+ Dodaj połączenie</button>
      </div>
      <ConnectionRackMap project={project} />
      {(creatingConnection || editingConnection) && (
        <ConnectionEditorModal
          devices={project.devices}
          patchPanels={project.patchPanels}
          connections={project.connections}
          connection={editingConnection}
          onSave={(connection) => {
            onSaveConnection(connection);
            setCreatingConnection(false);
            setEditingConnectionId(null);
          }}
          onDelete={(id) => {
            onDeleteConnection(id);
            setCreatingConnection(false);
            setEditingConnectionId(null);
          }}
          onCancel={() => {
            setCreatingConnection(false);
            setEditingConnectionId(null);
          }}
        />
      )}
    </div>
  );
}


function endpointKey(endpoint: ConnectionEndpoint) {
  return endpoint.kind === "device"
    ? "device:" + endpoint.deviceId + ":port:" + endpoint.port
    : "patch-panel:" + endpoint.patchPanelId + ":port:" + endpoint.portId;
}

function ConnectionRackMap({ project }: { project: ProjectDraft }) {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const mountedItems = [...project.devices, ...project.patchPanels]
    .filter((item) => item.positionU !== null)
    .sort((a, b) => (b.positionU ?? 0) - (a.positionU ?? 0));

  const findConnection = (key: string) =>
    project.connections.find(
      (connection) =>
        endpointKey(connection.from) === key || endpointKey(connection.to) === key
    );

  const counterpart = (connection: Connection, key: string) =>
    endpointKey(connection.from) === key ? connection.to : connection.from;

  const endpointTitle = (endpoint: ConnectionEndpoint) => endpointLabel(endpoint, project);

  return (
    <section className="documentation-panel connection-rack-panel">
      <div className="connection-rack-header">
        <div>
          <span>RACK / PORTY</span>
          <h2>{project.rack.name || "Szafa rack"}</h2>
        </div>
        <div className="connection-rack-stats">
          <span>{project.rack.heightU}U</span>
          <span>{project.connections.length} połączeń</span>
        </div>
      </div>

      <div className="connection-rack-stage">
        <div className="connection-rack-frame">
          <div className="connection-rack-scale" style={{ "--rack-height": project.rack.heightU } as CSSProperties}>
            {Array.from({ length: project.rack.heightU }, (_, index) => {
              const u = project.rack.heightU - index;
              return <span key={u}>{u}</span>;
            })}
          </div>

          <div
            className="connection-rack-grid"
            style={{ gridTemplateRows: "repeat(" + project.rack.heightU + ", minmax(22px, 1fr))" }}
          >
            {Array.from({ length: project.rack.heightU }, (_, index) => {
              const u = project.rack.heightU - index;
              return <div key={u} className="connection-rack-row" />;
            })}

            {mountedItems.map((item) => {
              const row = project.rack.heightU - (item.positionU ?? 1) + 1;
              const height = Math.max(1, item.heightU);
              const isDevice = project.devices.some((device) => device.id === item.id);
              const portLayout = isDevice
                ? (item as typeof project.devices[number]).portLayout ?? Array.from({ length: item.ports }, (_, index) => ({ number: index + 1, type: "rj45" as const }))
                : Array.from({ length: item.ports }, (_, index) => ({ number: index + 1, type: "rj45" as const }));
              const portGroups = [
                { type: "rj45" as const, label: "RJ45", ports: portLayout.filter((port) => port.type === "rj45") },
                { type: "sfp" as const, label: "SFP", ports: portLayout.filter((port) => port.type === "sfp" || port.type === "sfp+") },
              ].filter((group) => group.ports.length > 0);
              const itemKeys = portLayout.map((port) =>
                isDevice
                  ? endpointKey({ kind: "device", deviceId: item.id, port: port.number })
                  : endpointKey({
                      kind: "patch-panel",
                      patchPanelId: item.id,
                      portId: (item as typeof project.patchPanels[number]).portList[port.number - 1]?.id || item.id + "-port-" + port.number,
                    })
              );
              const hoveredConnection = hoveredKey ? findConnection(hoveredKey) : null;
              const targetKey = hoveredConnection ? endpointKey(counterpart(hoveredConnection, hoveredKey)) : null;
              const itemHighlighted = hoveredKey !== null && (itemKeys.includes(hoveredKey) || itemKeys.includes(targetKey || ""));

              return (
                <div key={item.id} className={"connection-rack-equipment " + (itemHighlighted ? "is-highlighted" : "")} style={{ gridRow: row + " / span " + height }}>
                  <div className="connection-rack-equipment-heading">
                    <div>
                      <strong>{item.name}</strong>
                      <span>{isDevice ? "AKTYWNE" : "PASYWNE"} · {item.heightU}U</span>
                    </div>
                    <small>{item.manufacturer || "—"} · {item.model || "—"}</small>
                  </div>

                  <div className="connection-rack-port-groups">
                    {portGroups.map((group) => (
                      <div key={group.type} className={"connection-rack-port-group " + (group.type === "sfp" ? "is-sfp" : "")}>
                        <span className="connection-rack-port-group-label">{group.label}</span>
                        <div className="connection-rack-ports" style={{ "--port-columns": group.ports.length <= 12 ? 12 : 24 } as CSSProperties}>
                          {group.ports.map((port) => {
                            const key = isDevice
                              ? endpointKey({ kind: "device", deviceId: item.id, port: port.number })
                              : endpointKey({
                                  kind: "patch-panel",
                                  patchPanelId: item.id,
                                  portId: (item as typeof project.patchPanels[number]).portList[port.number - 1]?.id || item.id + "-port-" + port.number,
                                });
                            const connection = findConnection(key);
                            const target = connection ? counterpart(connection, key) : null;
                            const connected = Boolean(connection);
                            const selected = hoveredKey === key;
                            const targetSelected = target ? hoveredKey === endpointKey(target) : false;
                            return (
                              <div key={key} className={"connection-port-box " + (port.type !== "rj45" ? "is-sfp " : "") + (connected ? "is-connected " : "is-free ") + (selected || targetSelected ? "is-highlighted" : "")} onMouseEnter={() => setHoveredKey(key)} onMouseLeave={() => setHoveredKey(null)} title={connected && target ? endpointTitle(target) : "Port wolny"}>
                                <span>{String(port.number).padStart(2, "0")}</span>
                                {connected && <i />}
                                {selected && <div className="connection-port-tooltip"><b>{connected ? "POŁĄCZONY" : "WOLNY"}</b><strong>{connected && target ? endpointTitle(target) : "Brak połączenia"}</strong>{connected && target && <span>{target.kind === "device" ? "URZĄDZENIE AKTYWNE" : "URZĄDZENIE PASYWNE"}</span>}</div>}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
          </div>
        </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {!mountedItems.length && (
          <div className="connection-rack-empty">
            <strong>Brak zamontowanego wyposażenia</strong>
            <span>Zamontuj urządzenia lub patchpanele, aby zobaczyć mapę portów.</span>
          </div>
        )}
      </div>
    </section>
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
