import { useMemo, useState } from "react";
import { Connection, Device, PatchPanel } from "../types";

type Props = {
  devices: Device[];
  patchPanels: PatchPanel[];
  connections: Connection[];
  connection?: Connection | null;
  onSave: (connection: Connection) => void;
  onDelete?: (id: string) => void;
  onCancel: () => void;
};

function portLabel(number: number) {
  return String(number).padStart(2, "0");
}

export default function ConnectionEditorModal({
  devices,
  patchPanels,
  connections,
  connection,
  onSave,
  onDelete,
  onCancel,
}: Props) {
  const switches = useMemo(
    () => devices.filter((device) => device.type === "switch"),
    [devices]
  );

  const [deviceId, setDeviceId] = useState(connection?.deviceId ?? switches[0]?.id ?? "");
  const [devicePort, setDevicePort] = useState(connection?.devicePort ?? 1);
  const [patchPanelId, setPatchPanelId] = useState(
    connection?.patchPanelId ?? patchPanels[0]?.id ?? ""
  );
  const [patchPanelPortId, setPatchPanelPortId] = useState(
    connection?.patchPanelPortId ?? patchPanels[0]?.portList[0]?.id ?? ""
  );

  const selectedSwitch = switches.find((device) => device.id === deviceId);
  const selectedPanel = patchPanels.find((panel) => panel.id === patchPanelId);

  const conflict = connections.some((item) => {
    if (item.id === connection?.id) return false;
    return (
      (item.deviceId === deviceId && item.devicePort === devicePort) ||
      (item.patchPanelId === patchPanelId &&
        item.patchPanelPortId === patchPanelPortId)
    );
  });

  const canSave =
    Boolean(selectedSwitch && selectedPanel && patchPanelPortId) && !conflict;

  const handlePanelChange = (id: string) => {
    setPatchPanelId(id);
    const panel = patchPanels.find((item) => item.id === id);
    setPatchPanelPortId(panel?.portList[0]?.id ?? "");
  };

  const handleSave = () => {
    if (!canSave || !selectedSwitch || !selectedPanel) return;

    onSave({
      id: connection?.id ?? crypto.randomUUID(),
      deviceId,
      devicePort,
      patchPanelId,
      patchPanelPortId,
    });
  };

  return (
    <div className="modal-backdrop">
      <section className="editor-modal connection-editor-modal" role="dialog" aria-modal="true" aria-labelledby="connection-editor-title">
        <header className="editor-modal-header">
          <div>
            <span className="eyebrow">POŁĄCZENIE</span>
            <h2 id="connection-editor-title">
              {connection ? "Edytuj połączenie" : "Dodaj połączenie"}
            </h2>
          </div>
          <button type="button" className="close-button" onClick={onCancel} aria-label="Zamknij">×</button>
        </header>

        {switches.length === 0 || patchPanels.length === 0 ? (
          <div className="connection-editor-empty">
            <strong>Brak dostępnych punktów końcowych</strong>
            <span>Dodaj co najmniej jeden switch i jeden patchpanel, aby utworzyć połączenie.</span>
          </div>
        ) : (
          <>
            <div className="connection-editor-route">
              <div className="connection-endpoint">
                <span>SWITCH</span>
                <strong>{selectedSwitch?.name || "—"}-{portLabel(devicePort)}</strong>
              </div>
              <div className="connection-arrow">→</div>
              <div className="connection-endpoint patch">
                <span>PATCHPANEL</span>
                <strong>{selectedPanel?.name || "—"}-{selectedPanel?.portList.find((port) => port.id === patchPanelPortId)?.label || "—"}</strong>
              </div>
            </div>

            <div className="connection-editor-fields">
              <label>
                <span>PORT SWITCHA</span>
                <select value={deviceId} onChange={(event) => { setDeviceId(event.target.value); setDevicePort(1); }}>
                  {switches.map((device) => <option key={device.id} value={device.id}>{device.name} · {device.manufacturer || "Producent nie podany"} · {device.ports}P</option>)}
                </select>
              </label>

              <label>
                <span>NUMER PORTU</span>
                <select value={devicePort} onChange={(event) => setDevicePort(Number(event.target.value))}>
                  {Array.from({ length: selectedSwitch?.ports ?? 0 }, (_, index) => index + 1).map((port) => (
                    <option key={port} value={port}>{portLabel(port)}</option>
                  ))}
                </select>
              </label>

              <label>
                <span>PATCHPANEL</span>
                <select value={patchPanelId} onChange={(event) => handlePanelChange(event.target.value)}>
                  {patchPanels.map((panel) => <option key={panel.id} value={panel.id}>{panel.name} · {panel.model || "Model nie podany"} · {panel.ports}P</option>)}
                </select>
              </label>

              <label>
                <span>PORT PATCHPANELA</span>
                <select value={patchPanelPortId} onChange={(event) => setPatchPanelPortId(event.target.value)}>
                  {selectedPanel?.portList.map((port) => <option key={port.id} value={port.id}>{port.label}</option>)}
                </select>
              </label>
            </div>

            {conflict && (
              <div className="connection-editor-error">
                Wybrany port jest już przypisany do innego połączenia. Każdy port może wystąpić tylko raz.
              </div>
            )}

            <footer className="editor-modal-footer">
              {connection && onDelete ? (
                <button type="button" className="danger-button" onClick={() => onDelete(connection.id)}>Usuń</button>
              ) : <span />}
              <div>
                <button type="button" className="secondary-button" onClick={onCancel}>Anuluj</button>
                <button type="button" className="primary-button" disabled={!canSave} onClick={handleSave}>Zapisz połączenie</button>
              </div>
            </footer>
          </>
        )}
      </section>
    </div>
  );
}
