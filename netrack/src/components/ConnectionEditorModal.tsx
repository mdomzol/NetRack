import { useEffect, useMemo, useState } from "react";
import { Connection, ConnectionEndpoint, Device, PatchPanel } from "../types";

type Props = {
  devices: Device[];
  patchPanels: PatchPanel[];
  connections: Connection[];
  connection?: Connection | null;
  onSave: (connection: Connection) => void;
  onDelete?: (id: string) => void;
  onCancel: () => void;
};

type EndpointSide = "from" | "to";

function portLabel(number: number) {
  return String(number).padStart(2, "0");
}

function endpointKey(endpoint: ConnectionEndpoint) {
  return endpoint.kind === "device"
    ? `device:${endpoint.deviceId}:port:${endpoint.port}`
    : `patch-panel:${endpoint.patchPanelId}:port:${endpoint.portId}`;
}

function endpointTitle(
  endpoint: ConnectionEndpoint,
  devices: Device[],
  patchPanels: PatchPanel[]
) {
  if (endpoint.kind === "device") {
    const device = devices.find((item) => item.id === endpoint.deviceId);
    return `${device?.name ?? "Urządzenie"}-${portLabel(endpoint.port)}`;
  }

  const panel = patchPanels.find((item) => item.id === endpoint.patchPanelId);
  const port = panel?.portList.find((item) => item.id === endpoint.portId);
  return `${panel?.name ?? "Patchpanel"}-${port?.label ?? "??"}`;
}

function initialEndpoint(
  endpoint: ConnectionEndpoint | undefined,
  devices: Device[],
  patchPanels: PatchPanel[]
): ConnectionEndpoint {
  if (endpoint) return endpoint;
  if (devices[0]) return { kind: "device", deviceId: devices[0].id, port: 1 };
  return {
    kind: "patch-panel",
    patchPanelId: patchPanels[0]?.id ?? "",
    portId: patchPanels[0]?.portList[0]?.id ?? "",
  };
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
  const endpointOptions = useMemo(
    () => [
      ...devices.map((device) => ({
        kind: "device" as const,
        id: device.id,
        name: device.name,
        detail: `${device.manufacturer || "Producent nie podany"} · ${device.ports}P`,
      })),
      ...patchPanels.map((panel) => ({
        kind: "patch-panel" as const,
        id: panel.id,
        name: panel.name,
        detail: `${panel.model || "Model nie podany"} · ${panel.ports}P`,
      })),
    ],
    [devices, patchPanels]
  );

  const [from, setFrom] = useState<ConnectionEndpoint>(() =>
    initialEndpoint(connection?.from, devices, patchPanels)
  );
  const [to, setTo] = useState<ConnectionEndpoint>(() =>
    initialEndpoint(connection?.to, devices, patchPanels)
  );

  useEffect(() => {
    if (!connection) return;
    setFrom(connection.from);
    setTo(connection.to);
  }, [connection]);

  const endpointAvailable = (endpoint: ConnectionEndpoint) =>
    endpointOptions.some(
      (option) =>
        option.kind === endpoint.kind &&
        option.id ===
          (endpoint.kind === "device"
            ? endpoint.deviceId
            : endpoint.patchPanelId)
    );

  const normalizeEndpoint = (endpoint: ConnectionEndpoint): ConnectionEndpoint => {
    if (endpointAvailable(endpoint)) return endpoint;
    return initialEndpoint(undefined, devices, patchPanels);
  };

  const selectedFrom = normalizeEndpoint(from);
  const selectedTo = normalizeEndpoint(to);

  const conflict = connections.some((item) => {
    if (item.id === connection?.id) return false;
    const occupied = [item.from, item.to].map(endpointKey);
    return (
      occupied.includes(endpointKey(selectedFrom)) ||
      occupied.includes(endpointKey(selectedTo))
    );
  });

  const sameEndpoint = endpointKey(selectedFrom) === endpointKey(selectedTo);

  const existingConnectionFor = (endpoint: ConnectionEndpoint) => {
    const key = endpointKey(endpoint);
    return connections.find((item) => {
      if (item.id === connection?.id) return false;
      return endpointKey(item.from) === key || endpointKey(item.to) === key;
    });
  };

  const connectionTargetLabel = (item: Connection) => {
    const selectedKey = endpointKey(item.from) === endpointKey(selectedFrom)
      ? endpointKey(item.from)
      : endpointKey(item.to) === endpointKey(selectedFrom)
        ? endpointKey(item.to)
        : endpointKey(selectedTo);
    const target = endpointKey(item.from) === selectedKey ? item.to : item.from;
    return endpointTitle(target, devices, patchPanels);
  };

  const fromExisting = existingConnectionFor(selectedFrom);
  const toExisting = existingConnectionFor(selectedTo);
  const canSave =
    endpointOptions.length >= 2 &&
    endpointAvailable(selectedFrom) &&
    endpointAvailable(selectedTo) &&
    !sameEndpoint &&
    !conflict;

  const changeKind = (side: EndpointSide, kind: ConnectionEndpoint["kind"]) => {
    const collection = kind === "device" ? devices : patchPanels;
    const next = collection[0]
      ? kind === "device"
        ? { kind, deviceId: collection[0].id, port: 1 } as ConnectionEndpoint
        : {
            kind,
            patchPanelId: collection[0].id,
            portId: collection[0].portList[0]?.id ?? "",
          } as ConnectionEndpoint
      : null;

    if (!next) return;
    side === "from" ? setFrom(next) : setTo(next);
  };

  const changeResource = (side: EndpointSide, id: string) => {
    const current = side === "from" ? selectedFrom : selectedTo;
    const next: ConnectionEndpoint =
      current.kind === "device"
        ? { kind: "device", deviceId: id, port: 1 }
        : {
            kind: "patch-panel",
            patchPanelId: id,
            portId:
              patchPanels.find((panel) => panel.id === id)?.portList[0]?.id ??
              "",
          };

    side === "from" ? setFrom(next) : setTo(next);
  };

  const changePort = (side: EndpointSide, value: string) => {
    const current = side === "from" ? selectedFrom : selectedTo;
    const next: ConnectionEndpoint =
      current.kind === "device"
        ? { ...current, port: Number(value) }
        : { ...current, portId: value };

    side === "from" ? setFrom(next) : setTo(next);
  };

  const renderEndpoint = (side: EndpointSide, endpoint: ConnectionEndpoint) => {
    const resourceId =
      endpoint.kind === "device" ? endpoint.deviceId : endpoint.patchPanelId;
    const resource = endpointOptions.find(
      (option) => option.kind === endpoint.kind && option.id === resourceId
    );

    const ports =
      endpoint.kind === "device"
        ? Array.from(
            {
              length:
                devices.find((device) => device.id === endpoint.deviceId)
                  ?.ports ?? 0,
            },
            (_, index) => ({
              value: String(index + 1),
              label: portLabel(index + 1),
            })
          )
        : patchPanels
            .find((panel) => panel.id === endpoint.patchPanelId)
            ?.portList.map((port) => ({
              value: port.id,
              label: port.label,
            })) ?? [];

    return (
      <div className="connection-endpoint-editor">
        <div className="connection-endpoint-heading">
          <span>{side === "from" ? "PUNKT A" : "PUNKT B"}</span>
          <strong>{endpointTitle(endpoint, devices, patchPanels)}</strong>
        </div>

        <label>
          <span>TYP</span>
          <select
            value={endpoint.kind}
            onChange={(event) =>
              changeKind(
                side,
                event.target.value as ConnectionEndpoint["kind"]
              )
            }
          >
            <option value="device">URZĄDZENIE AKTYWNE</option>
            <option value="patch-panel">URZĄDZENIE PASYWNE</option>
          </select>
        </label>

        <label>
          <span>URZĄDZENIE / PANEL</span>
          <select
            value={resourceId}
            onChange={(event) => changeResource(side, event.target.value)}
          >
            {endpointOptions
              .filter((option) => option.kind === endpoint.kind)
              .map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name} · {option.detail}
                </option>
              ))}
          </select>
        </label>

        <label>
          <span>PORT</span>
          <select
            value={
              endpoint.kind === "device"
                ? String(endpoint.port)
                : endpoint.portId
            }
            onChange={(event) => changePort(side, event.target.value)}
          >
            {ports.map((port) => (
              <option key={port.value} value={port.value}>
                {port.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    );
  };

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <section
        className="editor-modal connection-editor-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="connection-editor-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="editor-modal-header">
          <div>
            <span className="eyebrow">KREATOR POŁĄCZENIA</span>
            <h2 id="connection-editor-title">
              {connection ? "Edytuj połączenie" : "Nowe połączenie"}
            </h2>
            <p className="connection-modal-description">
              Połącz dowolne urządzenie aktywne z innym urządzeniem lub urządzeniem pasywnym.
            </p>
          </div>
          <button
            type="button"
            className="close-button"
            onClick={onCancel}
            aria-label="Zamknij"
          >
            ×
          </button>
        </header>

        {endpointOptions.length < 2 ? (
          <div className="connection-editor-empty">
            <strong>Brak wystarczającej liczby punktów końcowych</strong>
            <span>
              Dodaj co najmniej dwa urządzenia lub patchpanele z portami.
            </span>
          </div>
        ) : (
          <>
            <div className="connection-editor-route">
              <div className="connection-endpoint">
                <span>PUNKT A</span>
                <strong>{endpointTitle(selectedFrom, devices, patchPanels)}</strong>
              </div>
              <div className="connection-arrow">↔</div>
              <div className="connection-endpoint patch">
                <span>PUNKT B</span>
                <strong>{endpointTitle(selectedTo, devices, patchPanels)}</strong>
              </div>
            </div>

            <div className="connection-editor-endpoints">
              {renderEndpoint("from", selectedFrom)}
              {renderEndpoint("to", selectedTo)}
            </div>

            {sameEndpoint && (
              <div className="connection-editor-error">
                Punkt A i punkt B wskazują ten sam port. Wybierz dwa różne punkty końcowe.
              </div>
            )}

            {fromExisting && !sameEndpoint && (
              <div className="connection-editor-warning">
                <strong>Port {endpointTitle(selectedFrom, devices, patchPanels)} jest już połączony z</strong>
                <span>{connectionTargetLabel(fromExisting)}</span>
              </div>
            )}

            {toExisting && !sameEndpoint && (
              <div className="connection-editor-warning">
                <strong>Port {endpointTitle(selectedTo, devices, patchPanels)} jest już połączony z</strong>
                <span>{endpointTitle(
                  endpointKey(fromExisting ?? toExisting) === endpointKey(toExisting.from)
                    ? toExisting.to
                    : toExisting.from,
                  devices,
                  patchPanels
                )}</span>
              </div>
            )}

            {conflict && !sameEndpoint && (
              <div className="connection-editor-error">
                Nie można zapisać nowego połączenia, dopóki wybrany port jest zajęty. Wybierz wolny port albo edytuj istniejące połączenie.
              </div>
            )}

            <footer className="editor-modal-footer">
              {connection && onDelete ? (
                <button
                  type="button"
                  className="danger-button"
                  onClick={() => onDelete(connection.id)}
                >
                  Usuń
                </button>
              ) : (
                <span />
              )}
              <div>
                <button type="button" className="secondary-button" onClick={onCancel}>
                  Anuluj
                </button>
                <button
                  type="button"
                  className="primary-button"
                  disabled={!canSave}
                  onClick={() =>
                    onSave({
                      id: connection?.id ?? crypto.randomUUID(),
                      from: selectedFrom,
                      to: selectedTo,
                    })
                  }
                >
                  Zapisz połączenie
                </button>
              </div>
            </footer>
          </>
        )}
      </section>
    </div>
  );
}
