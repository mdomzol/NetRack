import { useState, type CSSProperties } from "react";
import ConnectionEditorModal from "./ConnectionEditorModal";
import { Connection, ConnectionEndpoint, ProjectDraft } from "../types";

export type DocumentationViewType =
  | "rack"
  | "devices"
  | "patch-panels"
  | "connections"
  | "connection-map";

type Props = {
  project: ProjectDraft;
  view: DocumentationViewType;
  onSaveConnection: (connection: Connection) => void;
  onDeleteConnection: (id: string) => void;
  onOpenDevice: (deviceId: string) => void;
  focusedDeviceId: string | null;
  onClearFocusedDevice: () => void;
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

function DocumentationView({ project, view, onSaveConnection, onDeleteConnection, onOpenDevice, focusedDeviceId, onClearFocusedDevice }: Props) {
  const [editingConnectionId, setEditingConnectionId] = useState<string | null>(null);
  const [selectedRackItemId, setSelectedRackItemId] = useState<string | null>(null);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(focusedDeviceId);
  const [selectedPatchPanelId, setSelectedPatchPanelId] = useState<string | null>(null);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
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
    const rackItems = [...project.devices, ...project.patchPanels];
    const selectedRackItem = rackItems.find((item) => item.id === selectedRackItemId) ?? null;

    return (
      <div className="documentation-page">
        <PageHeader eyebrow="DOKUMENTACJA / RACK" title={project.rack.name || "Szafa rack"} description="Kliknij element w szafie, aby wyświetlić jego informacje." />
        <div className="documentation-grid rack-documentation">
          <section className="documentation-panel rack-overview-panel">
            <div className="documentation-panel-heading">
              <div><span>RACK</span><h2>{project.rack.name || "SR-01"}</h2></div>
              <strong>{project.rack.heightU}U</strong>
            </div>
            <div className="rack-visual-scroll">
              <div className="rack-chassis"><div className="rack-rail rack-rail-left" /><div className="rack-rail rack-rail-right" /><div className="rack-u-scale">
                {Array.from({ length: project.rack.heightU }, (_, i) => {
                  const u = project.rack.heightU - i;
                  const item = rackItems.find((x) => x.positionU !== null && u >= x.positionU && u < x.positionU + x.heightU);
                  const selected = item?.id === selectedRackItemId;
                  return (
                    <button
                      key={u}
                      type="button"
                      className={`rack-mini-row ${item ? "occupied" : ""} ${selected ? "selected" : ""}`}
                      onClick={() => item && setSelectedRackItemId(item.id)}
                      disabled={!item}
                    >
                      <span>{u}</span>
                      <div>
                        {item && <><strong>{item.name}</strong><span>{item.manufacturer || "—"} · {item.model || "Model nie podany"}</span></>}
                      </div>
                    </button>
                  );
                })}
              </div></div>
            </div>
          </section>

          <section className="documentation-panel rack-item-details-panel">
            {selectedRackItem ? (
              <>
                <div className="rack-item-details-header">
                  <div><span>{project.devices.some((device) => device.id === selectedRackItem.id) ? "URZĄDZENIE" : "PATCHPANEL"}</span><h2>{selectedRackItem.name}</h2></div>
                  <button type="button" className="rack-item-details-close" onClick={() => setSelectedRackItemId(null)} aria-label="Zamknij">×</button>
                </div>
                <div className="rack-item-details-body">
                  <div className="rack-item-details-model">
                    <strong>{selectedRackItem.manufacturer || "—"}</strong>
                    <span>{selectedRackItem.model || "Model nie podany"}</span>
                  </div>
                  <div className="rack-item-details-list">
                    <div><span>Pozycja</span><strong>U{selectedRackItem.positionU ?? "—"}</strong></div>
                    <div><span>Wysokość</span><strong>{selectedRackItem.heightU}U</strong></div>
                    <div><span>Porty</span><strong>{selectedRackItem.ports}</strong></div>
                    {project.devices.some((device) => device.id === selectedRackItem.id) && (
                      <div><span>Typ</span><strong>{deviceLabels[(selectedRackItem as typeof project.devices[number]).type] || "Urządzenie"}</strong></div>
                    )}
                  </div>
                  <div className="rack-item-details-action">
                    {project.devices.some((device) => device.id === selectedRackItem.id) ? (
                      <button type="button" className="primary-button" onClick={() => onOpenDevice(selectedRackItem.id)}>Otwórz urządzenie <span>→</span></button>
                    ) : (
                      <button type="button" className="primary-button" onClick={() => setSelectedRackItemId(null)}>Otwórz patchpanel <span>→</span></button>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="rack-item-details-empty">
                <span>WYBIERZ ELEMENT</span>
                <strong>Kliknij urządzenie lub patchpanel w widoku szafy.</strong>
                <p>Wyświetlimy jego podstawowe dane oraz przejście do dokumentacji.</p>
              </div>
            )}
          </section>

          <section className="documentation-panel documentation-panel-wide">
            <PanelTitle eyebrow="OBSADA" title="Wyposażenie szafy" />
            <EquipmentRows project={project} />
          </section>
        </div>
      </div>
    );
  }

  if (view === "connection-map") {
    return (
      <div className="documentation-page connection-map-page">
        <PageHeader
          eyebrow="DOKUMENTACJA / MAPA POŁĄCZEŃ"
          title="Mapa połączeń"
          description="Kompletny widok szafy rack. Najedź na port, aby zobaczyć drugi koniec połączenia."
        />
        <section className="documentation-panel connection-map-full-panel">
          <div className="connection-map-full-heading">
            <div>
              <span>MAPA OKABLOWANIA</span>
              <strong>{String(project.connections.length).padStart(2, "0")} <small>POŁĄCZENIA</small></strong>
            </div>
            <button type="button" className="primary-button" onClick={() => setCreatingConnection(true)}>
              + Dodaj połączenie
            </button>
          </div>
          <ConnectionRackMap project={project} />
        </section>

        {creatingConnection && (
          <ConnectionEditorModal
            devices={project.devices}
            patchPanels={project.patchPanels}
            connections={project.connections}
            onSave={(connection) => {
              onSaveConnection(connection);
              setCreatingConnection(false);
            }}
            onCancel={() => setCreatingConnection(false)}
          />
        )}
      </div>
    );
  }

  if (view === "devices") {
    const activeDeviceId = selectedDeviceId ?? focusedDeviceId;
    const selectedDevice = project.devices.find((device) => device.id === activeDeviceId) ?? null;
    const mountedDevices = project.devices.filter((device) => mounted(device.positionU)).length;

    return (
      <div className="documentation-page devices-page">
        <PageHeader eyebrow="DOKUMENTACJA / URZĄDZENIA" title="Urządzenia" description="Wybierz urządzenie z listy, aby wyświetlić jego szczegóły." />

        <div className="devices-toolbar">
          <div className="devices-toolbar-stat"><span>URZĄDZENIA</span><strong>{project.devices.length}</strong></div>
          <div className="devices-toolbar-stat"><span>W RACKU</span><strong>{mountedDevices}</strong></div>
          <div className="devices-toolbar-stat"><span>POZA RACKIEM</span><strong>{project.devices.length - mountedDevices}</strong></div>
          <div className="devices-toolbar-stat"><span>PORTY</span><strong>{project.devices.reduce((sum, device) => sum + device.ports, 0)}</strong></div>
        </div>

        <div className="devices-workspace">
          <aside className="documentation-panel device-selector">
            <div className="device-selector-heading">
              <span>INWENTARZ</span>
              <strong>Urządzenia</strong>
            </div>
            <div className="device-selector-list">
              {project.devices.length ? project.devices.map((device) => {
                const selected = activeDeviceId === device.id;
                const layout = device.portLayout ?? [];
                const rj45 = layout.filter((port) => port.type === "rj45").length || device.ports;
                const sfp = layout.filter((port) => port.type === "sfp").length;
                const sfpPlus = layout.filter((port) => port.type === "sfp+").length;

                return (
                  <button
                    type="button"
                    key={device.id}
                    className={`device-selector-item ${selected ? "is-selected" : ""}`}
                    onClick={() => setSelectedDeviceId(device.id)}
                  >
                    <span className="device-selector-index">{device.type === "switch" ? "SW" : "DEV"}</span>
                    <span className="device-selector-copy">
                      <strong>{device.name}</strong>
                      <small>{device.manufacturer || "—"} · {device.model || "Model nie podany"}</small>
                    </span>
                    <span className="device-selector-state">{rj45 + sfp + sfpPlus}</span>
                  </button>
                );
              }) : <Empty text="Nie dodano jeszcze żadnych urządzeń." />}
            </div>
          </aside>

          <section className="device-detail-workspace">
            {selectedDevice ? (
              <section className="documentation-panel device-details-panel">
                <div className="device-detail-hero">
                  <div className="device-detail-eyebrow">{deviceLabels[selectedDevice.type] || "URZĄDZENIE"}</div>
                  <h2>{selectedDevice.name}</h2>
                  <p>{selectedDevice.manufacturer || "—"} · {selectedDevice.model || "Model nie podany"}</p>
                  <div className="device-detail-badges">
                    <span><small>LOKALIZACJA</small><strong>{mounted(selectedDevice.positionU) ? `RACK · U${selectedDevice.positionU}` : "POZA RACKIEM"}</strong></span>
                    <span><small>WYSOKOŚĆ</small><strong>{selectedDevice.heightU}U</strong></span>
                    <span><small>PORTY</small><strong>{selectedDevice.ports}</strong></span>
                  </div>
                </div>

                <div className="device-detail-stats">
                  <div><span>RJ45</span><strong>{(selectedDevice.portLayout ?? []).filter((port) => port.type === "rj45").length || selectedDevice.ports}</strong></div>
                  <div><span>SFP</span><strong>{(selectedDevice.portLayout ?? []).filter((port) => port.type === "sfp").length}</strong></div>
                  <div><span>SFP+</span><strong>{(selectedDevice.portLayout ?? []).filter((port) => port.type === "sfp+").length}</strong></div>
                  <div><span>MODEL</span><strong>{selectedDevice.model || "—"}</strong></div>
                </div>

                <div className="device-port-list">
                  <div className="device-port-list-heading">
                    <span>PORTY URZĄDZENIA</span>
                    <span>NUMERACJA FIZYCZNA</span>
                  </div>
                  {(() => {
                    const ports = selectedDevice.portLayout?.length
                      ? selectedDevice.portLayout
                      : Array.from({ length: selectedDevice.ports }, (_, index) => ({ number: index + 1, type: "rj45" as const }));
                    const rj45Ports = ports.filter((port) => port.type === "rj45");
                    const sfpPorts = ports.filter((port) => port.type !== "rj45");
                    const perRow = rj45Ports.length >= 48 ? 24 : rj45Ports.length >= 24 ? 12 : Math.max(rj45Ports.length, 1);
                    const rows = Array.from({ length: Math.ceil(rj45Ports.length / perRow) }, (_, index) =>
                      rj45Ports.slice(index * perRow, (index + 1) * perRow)
                    );

                    return (
                      <div className="device-port-map">
                        {rows.map((row, rowIndex) => (
                          <div className="device-port-row" key={`rj45-${rowIndex}`}>
                            {row.map((port) => <span className="device-port-box rj45" key={`rj45-${port.number}`}>{port.number}</span>)}
                          </div>
                        ))}
                        {sfpPorts.length > 0 && (
                          <div className="device-port-sfp-section">
                            <span className="device-port-group-label">SFP / SFP+</span>
                            <div className="device-port-row device-port-sfp-row">
                              {sfpPorts.map((port) => <span className={`device-port-box ${port.type}`} key={`${port.type}-${port.number}`}>{port.number}</span>)}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </section>
            ) : (
              <section className="documentation-panel device-empty-state">
                <span>URZĄDZENIA</span>
                <h2>Wybierz urządzenie</h2>
                <p>Lista po lewej stronie służy do szybkiego przełączania między urządzeniami. Po wyborze tutaj pojawią się jego parametry i fizyczny układ portów.</p>
              </section>
            )}
          </section>
        </div>
      </div>
    );
  }

  if (view === "patch-panels") {
    const selectedPanel = project.patchPanels.find((panel) => panel.id === selectedPatchPanelId) ?? null;
    const mountedPanels = project.patchPanels.filter((panel) => mounted(panel.positionU)).length;
    const freePorts = project.patchPanels.reduce(
      (sum, panel) => sum + panel.portList.filter((port) => port.status === "free").length,
      0
    );

    return (
      <div className="documentation-page patch-panels-page">
        <PageHeader eyebrow="DOKUMENTACJA / PATCHPANELE" title="Patchpanele" description="Wybierz patchpanel z listy, aby wyświetlić jego szczegóły." />

        <div className="devices-toolbar patch-panels-toolbar">
          <div className="devices-toolbar-stat"><span>PATCHPANELE</span><strong>{project.patchPanels.length}</strong></div>
          <div className="devices-toolbar-stat"><span>W RACKU</span><strong>{mountedPanels}</strong></div>
          <div className="devices-toolbar-stat"><span>PORTY</span><strong>{totalPorts}</strong></div>
          <div className="devices-toolbar-stat"><span>WOLNE PORTY</span><strong>{freePorts}</strong></div>
        </div>

        <div className="patch-panels-workspace">
          <aside className="documentation-panel patch-panel-selector">
            <div className="patch-panel-selector-heading">
              <span>INWENTARZ</span>
              <strong>Patchpanele</strong>
            </div>
            <div className="patch-panel-selector-list">
              {project.patchPanels.length ? project.patchPanels.map((panel) => {
                const selected = selectedPatchPanelId === panel.id;
                const connected = panel.portList.filter((port) => port.status === "connected").length;
                const free = panel.portList.filter((port) => port.status === "free").length;

                return (
                  <button
                    type="button"
                    key={panel.id}
                    className={`patch-panel-selector-item ${selected ? "is-selected" : ""}`}
                    onClick={() => setSelectedPatchPanelId(panel.id)}
                  >
                    <span className="patch-panel-selector-index">PP</span>
                    <span className="patch-panel-selector-copy">
                      <strong>{panel.name}</strong>
                      <small>{panel.manufacturer || "—"} · {panel.model || "Model nie podany"}</small>
                    </span>
                    <span className="patch-panel-selector-state">{free}/{panel.ports}</span>
                  </button>
                );
              }) : <Empty text="Nie dodano jeszcze żadnych patchpaneli." />}
            </div>
          </aside>

          <section className="patch-panel-detail-workspace">
            {selectedPanel ? (
              <section className="documentation-panel patch-panel-details-panel">
                <div className="patch-panel-detail-hero">
                  <div className="patch-panel-detail-eyebrow">PATCHPANEL · PASYWNE</div>
                  <h2>{selectedPanel.name}</h2>
                  <p>{selectedPanel.manufacturer || "—"} · {selectedPanel.model || "Model nie podany"} · {selectedPanel.type || "RJ45"}</p>
                  <div className="patch-panel-detail-badges">
                    <span><small>LOKALIZACJA</small><strong>{mounted(selectedPanel.positionU) ? `RACK · U${selectedPanel.positionU}` : "POZA RACKIEM"}</strong></span>
                    <span><small>WYSOKOŚĆ</small><strong>{selectedPanel.heightU}U</strong></span>
                    <span><small>PORTY</small><strong>{selectedPanel.ports}</strong></span>
                  </div>
                </div>

                <div className="patch-panel-detail-stats">
                  <div><span>PORTY</span><strong>{selectedPanel.ports}</strong></div>
                  <div><span>ZAJĘTE</span><strong>{selectedPanel.ports - selectedPanel.portList.filter((port) => port.status === "free").length}</strong></div>
                  <div><span>WOLNE</span><strong>{selectedPanel.portList.filter((port) => port.status === "free").length}</strong></div>
                  <div><span>POZYCJA</span><strong>{mounted(selectedPanel.positionU) ? `U${selectedPanel.positionU}` : "—"}</strong></div>
                </div>

                <div className="patch-panel-port-list">
                  <div className="patch-panel-port-list-heading">
                    <span>PORTY PATCHPANELU</span>
                    <span>{selectedPanel.portList.length} PORTÓW</span>
                  </div>
                  <div className="patch-panel-port-grid">
                    {selectedPanel.portList.map((port) => (
                      <div key={port.id} className={`patch-panel-port ${port.status === "connected" ? "is-connected" : "is-free"}`}>
                        <strong>{port.number}</strong>
                        <span>{port.label || "—"}</span>
                        <small>{port.status === "connected" ? "ZAJĘTY" : "WOLNY"}</small>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            ) : (
              <section className="documentation-panel patch-panel-empty-state">
                <span>PATCHPANELE</span>
                <h2>Wybierz patchpanel</h2>
                <p>Lista po lewej stronie służy do szybkiego przełączania między panelami. Po wyborze tutaj pojawią się jego parametry i stan portów.</p>
              </section>
            )}
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="documentation-page connections-page">
      <PageHeader
        eyebrow="DOKUMENTACJA / POŁĄCZENIA"
        title="Połączenia"
        description="Wybierz połączenie z listy, aby zobaczyć oba końce trasy i jej przebieg w racku."
      />

      <div className="connections-toolbar">
        <div className="connection-toolbar-copy">
          <span>MAPA OKABLOWANIA</span>
          <div>
            <strong>{String(project.connections.length).padStart(2, "0")}</strong>
            <small>POŁĄCZENIA</small>
          </div>
        </div>
        <button type="button" className="primary-button" onClick={() => setCreatingConnection(true)}>+ Dodaj połączenie</button>
      </div>

      <div className="connections-workspace">
        <aside className="documentation-panel connection-selector">
          <div className="connection-selector-heading">
            <span>INWENTARZ</span>
            <strong>Połączenia</strong>
          </div>
          <div className="connection-selector-list">
            {project.connections.length ? project.connections.map((connection, index) => {
              const selected = selectedConnectionId === connection.id;
              return (
                <button
                  type="button"
                  key={connection.id}
                  className={`connection-selector-item ${selected ? "is-selected" : ""}`}
                  onClick={() => setSelectedConnectionId(connection.id)}
                >
                  <span className="connection-selector-index">{String(index + 1).padStart(2, "0")}</span>
                  <span className="connection-selector-copy">
                    <strong>{endpointLabel(connection.from, project)}</strong>
                    <small>→ {endpointLabel(connection.to, project)}</small>
                  </span>
                  <span className="connection-selector-arrow">→</span>
                </button>
              );
            }) : <Empty text="Nie dodano jeszcze żadnych połączeń." />}
          </div>
        </aside>

        <section className="connection-detail-workspace">
          {(() => {
            const selectedConnection = project.connections.find((item) => item.id === selectedConnectionId) ?? null;

            return selectedConnection ? (
              <section className="documentation-panel connection-details-panel">
                <div className="connection-detail-hero">
                  <div className="connection-detail-eyebrow">TRASA · POŁĄCZENIE</div>
                  <h2>{endpointLabel(selectedConnection.from, project)} <span>→</span> {endpointLabel(selectedConnection.to, project)}</h2>
                  <p>Połączenie infrastruktury pomiędzy urządzeniem aktywnym i punktem pasywnym.</p>
                  <div className="connection-detail-actions">
                    <button type="button" className="secondary-button" onClick={() => setEditingConnectionId(selectedConnection.id)}>Edytuj połączenie</button>
                  </div>
                </div>

                <div className="connection-endpoints">
                  <div className="connection-endpoint-card">
                    <span>A · ŹRÓDŁO</span>
                    <strong>{endpointLabel(selectedConnection.from, project)}</strong>
                    <small>{selectedConnection.from.kind === "device" ? "URZĄDZENIE AKTYWNE" : "PATCHPANEL"}</small>
                  </div>
                  <div className="connection-endpoint-line">→</div>
                  <div className="connection-endpoint-card">
                    <span>B · CEL</span>
                    <strong>{endpointLabel(selectedConnection.to, project)}</strong>
                    <small>{selectedConnection.to.kind === "device" ? "URZĄDZENIE AKTYWNE" : "PATCHPANEL"}</small>
                  </div>
                </div>

                <div className="connection-detail-meta">
                  <div><span>IDENTYFIKATOR</span><strong>{selectedConnection.id}</strong></div>
                  <div><span>STATUS</span><strong>AKTYWNE</strong></div>
                </div>

              </section>
            ) : (
              <section className="documentation-panel connection-empty-state">
                <span>POŁĄCZENIA</span>
                <h2>Wybierz połączenie</h2>
                <p>Lista po lewej stronie służy do szybkiego przełączania między trasami. Po wyborze tutaj pojawią się oba końce połączenia, jego status oraz mapa racka.</p>
              </section>
            );
          })()}
        </section>
      </div>

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
            setSelectedConnectionId(connection.id);
          }}
          onDelete={(id) => {
            onDeleteConnection(id);
            setCreatingConnection(false);
            setEditingConnectionId(null);
            setSelectedConnectionId((current) => current === id ? null : current);
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
                ? (item as typeof project.devices[number]).portLayout ??
                  Array.from({ length: item.ports }, (_, index) => ({
                    number: index + 1,
                    type: "rj45" as const,
                  }))
                : Array.from({ length: item.ports }, (_, index) => ({
                    number: index + 1,
                    type: "rj45" as const,
                  }));

              const portGroups = [
                {
                  type: "rj45" as const,
                  label: "RJ45",
                  ports: portLayout.filter((port) => port.type === "rj45"),
                },
                {
                  type: "sfp" as const,
                  label: "SFP",
                  ports: portLayout.filter(
                    (port) => port.type === "sfp" || port.type === "sfp+"
                  ),
                },
              ].filter((group) => group.ports.length > 0);

              const itemKeys = portLayout.map((port) =>
                isDevice
                  ? endpointKey({
                      kind: "device",
                      deviceId: item.id,
                      port: port.number,
                    })
                  : endpointKey({
                      kind: "patch-panel",
                      patchPanelId: item.id,
                      portId:
                        (item as typeof project.patchPanels[number]).portList[
                          port.number - 1
                        ]?.id || item.id + "-port-" + port.number,
                    })
              );

              const hoveredConnection = hoveredKey
                ? findConnection(hoveredKey)
                : null;
              const targetKey = hoveredConnection
                ? endpointKey(counterpart(hoveredConnection, hoveredKey))
                : null;
              const itemHighlighted =
                hoveredKey !== null &&
                (itemKeys.includes(hoveredKey) ||
                  itemKeys.includes(targetKey || ""));

              return (
                <div
                  key={item.id}
                  className={
                    "connection-rack-equipment " +
                    (itemHighlighted ? "is-highlighted" : "")
                  }
                  style={{ gridRow: row + " / span " + height }}
                >
                  <div className="connection-rack-equipment-heading">
                    <div>
                      <strong>{item.name}</strong>
                      <span>
                        {isDevice ? "AKTYWNE" : "PASYWNE"} · {item.heightU}U
                      </span>
                    </div>
                    <small>
                      {item.manufacturer || "—"} · {item.model || "—"}
                    </small>
                  </div>

                  <div className="connection-rack-port-groups">
                    {portGroups.map((group) => (
                      <div
                        key={group.type}
                        className={
                          "connection-rack-port-group " +
                          (group.type === "sfp" ? "is-sfp" : "")
                        }
                      >
                        <span className="connection-rack-port-group-label">
                          {group.label}
                        </span>

                        <div
                          className="connection-rack-ports"
                          style={
                            {
                              "--port-columns":
                                group.ports.length <= 12 ? 12 : 24,
                            } as CSSProperties
                          }
                        >
                          {group.ports.map((port) => {
                            const key = isDevice
                              ? endpointKey({
                                  kind: "device",
                                  deviceId: item.id,
                                  port: port.number,
                                })
                              : endpointKey({
                                  kind: "patch-panel",
                                  patchPanelId: item.id,
                                  portId:
                                    (
                                      item as typeof project.patchPanels[number]
                                    ).portList[port.number - 1]?.id ||
                                    item.id + "-port-" + port.number,
                                });

                            const connection = findConnection(key);
                            const target = connection
                              ? counterpart(connection, key)
                              : null;
                            const connected = Boolean(connection);
                            const selected = hoveredKey === key;
                            const targetSelected = target
                              ? hoveredKey === endpointKey(target)
                              : false;

                            return (
                              <div
                                key={key}
                                className={
                                  "connection-port-box " +
                                  (port.type !== "rj45" ? "is-sfp " : "") +
                                  (connected ? "is-connected " : "is-free ") +
                                  (selected ? "is-highlighted is-source " : "") +
                                  (targetSelected ? "is-highlighted is-target " : "")
                                }
                                onMouseEnter={() => setHoveredKey(key)}
                                onMouseLeave={() => setHoveredKey(null)}
                                title={
                                  connected && target
                                    ? endpointTitle(target)
                                    : "Port wolny"
                                }
                              >
                                <span>{String(port.number).padStart(2, "0")}</span>
                                {connected && <i />}
                                {selected && (
                                  <div className="connection-port-tooltip">
                                    <b>{connected ? "POŁĄCZONY" : "WOLNY"}</b>
                                    <strong>
                                      {connected && target
                                        ? endpointTitle(target)
                                        : "Brak połączenia"}
                                    </strong>
                                    {connected && target && (
                                      <span>
                                        {target.kind === "device"
                                          ? "URZĄDZENIE AKTYWNE"
                                          : "URZĄDZENIE PASYWNE"}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {!mountedItems.length && (
          <div className="connection-rack-empty">
            <strong>Brak zamontowanego wyposażenia</strong>
            <span>
              Zamontuj urządzenia lub patchpanele, aby zobaczyć mapę portów.
            </span>
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

function DetailGrid({ items, className = "" }: { items: [string, string][]; className?: string }) {
  return <div className={`documentation-details ${className}`.trim()}>{items.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>;
}

function EquipmentRows({ project }: { project: ProjectDraft }) {
  const items = [...project.devices.map((x) => ({ ...x, kind: "SW" })), ...project.patchPanels.map((x) => ({ ...x, kind: "PP" }))];
  return items.length ? <div className="documentation-equipment">{items.map((item) => <div className="documentation-row" key={item.id}><div className="documentation-type">{item.kind}</div><div className="documentation-main"><strong>{item.name}</strong><span>{item.manufacturer || "—"} · {item.model || "Model nie podany"}</span><em>{item.kind === "SW" ? "Urządzenie aktywne" : "Patchpanel · okablowanie pasywne"}</em></div><div className="documentation-meta"><span>{item.heightU}U</span><span className={item.positionU !== null ? "mounted" : ""}>{item.positionU !== null ? `U${item.positionU}` : "POZA RACKIEM"}</span></div></div>)}</div> : <Empty text="Szafa nie ma jeszcze wyposażenia." />;
}

function Empty({ text }: { text: string }) {
  return <div className="documentation-empty"><strong>Brak danych</strong><span>{text}</span></div>;
}

export default DocumentationView;
