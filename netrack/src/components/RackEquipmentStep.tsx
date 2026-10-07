import { Device, PatchPanel, Rack } from "../types";
import RackCanvas from "./RackCanvas";

type Props = {
  rack: Rack;
  devices: Device[];
  patchPanels: PatchPanel[];
  editingDeviceId: string | null;
  editingPatchPanelId: string | null;
  onAddDevice: () => void;
  onEditDevice: (id: string) => void;
  onRemoveDevice: (id: string) => void;
  onAddPatchPanel: () => void;
  onEditPatchPanel: (id: string) => void;
  onRemovePatchPanel: (id: string) => void;
  onMoveItem: (id: string, type: "device" | "patch-panel", positionU: number) => boolean | void;
};

export default function RackEquipmentStep({
  rack, devices, patchPanels, editingDeviceId, editingPatchPanelId,
  onAddDevice, onEditDevice, onRemoveDevice,
  onAddPatchPanel, onEditPatchPanel, onRemovePatchPanel, onMoveItem,
}: Props) {
  const drag = (event: React.DragEvent, id: string, type: "device" | "patch-panel") => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/netrack-item", JSON.stringify({ id, type }));
  };

  return (
    <>
      <div className="wizard-card-header equipment-header">
        <div>
          <h2>Wyposażenie racka</h2>
          <span>Układaj urządzenia i patchpanele bezpośrednio w szafie. Przeciągaj je między jednostkami U.</span>
        </div>
        <div className="equipment-actions">
          <button className="secondary-button" onClick={onAddPatchPanel}>+ Patchpanel</button>
          <button className="primary-button" onClick={onAddDevice}>+ Urządzenie</button>
        </div>
      </div>

      <div className="layout-workspace rack-equipment-workspace">
        <RackCanvas
          rack={rack}
          devices={devices}
          patchPanels={patchPanels}
          onMoveItem={onMoveItem}
          onEditItem={(id, type) => type === "device" ? onEditDevice(id) : onEditPatchPanel(id)}
        />

        <div className="workspace-list equipment-list">
          <div className="workspace-list-header">
            <span>ELEMENTY SZAFY</span>
            <strong>{devices.length + patchPanels.length}</strong>
          </div>

          <div className="equipment-group">
            <div className="equipment-group-title"><span>URZĄDZENIA</span><em>{devices.length}</em></div>
            {devices.length === 0 ? (
              <div className="equipment-empty">Brak urządzeń. Dodaj pierwsze urządzenie.</div>
            ) : devices.map((device) => (
              <button
                type="button"
                key={device.id}
                draggable
                onDragStart={(event) => drag(event, device.id, "device")}
                onClick={() => onEditDevice(device.id)}
                className={`equipment-row ${editingDeviceId === device.id ? "editing" : ""}`}
              >
                <span className="equipment-row-icon">SW</span>
                <span className="equipment-row-main"><strong>{device.name}</strong><small>{device.manufacturer || "Brak producenta"} · {device.model || "Brak modelu"}</small></span>
                <span className={`equipment-row-position ${device.positionU === null ? "unmounted" : ""}`}>{device.positionU ? `U${device.positionU}` : "NIEZAMONTOWANE"}<small>{device.positionU ? `${device.heightU}U` : "przeciągnij do racka"}</small></span>
                <span className="equipment-row-remove" onClick={(event) => { event.stopPropagation(); onRemoveDevice(device.id); }}>×</span>
              </button>
            ))}
          </div>

          <div className="equipment-group">
            <div className="equipment-group-title"><span>PATCHPANELE</span><em>{patchPanels.length}</em></div>
            {patchPanels.length === 0 ? (
              <div className="equipment-empty">Brak patchpaneli. Dodaj element, aby umieścić go w szafie.</div>
            ) : patchPanels.map((panel) => (
              <button
                type="button"
                key={panel.id}
                draggable
                onDragStart={(event) => drag(event, panel.id, "patch-panel")}
                onClick={() => onEditPatchPanel(panel.id)}
                className={`equipment-row ${editingPatchPanelId === panel.id ? "editing" : ""}`}
              >
                <span className="equipment-row-icon pp">PP</span>
                <span className="equipment-row-main"><strong>{panel.name}</strong><small>{panel.type} · {panel.ports} portów</small></span>
                <span className={`equipment-row-position ${panel.positionU === null ? "unmounted" : ""}`}>{panel.positionU ? `U${panel.positionU}` : "NIEZAMONTOWANE"}<small>{panel.positionU ? `${panel.heightU}U` : "przeciągnij do racka"}</small></span>
                <span className="equipment-row-remove" onClick={(event) => { event.stopPropagation(); onRemovePatchPanel(panel.id); }}>×</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
