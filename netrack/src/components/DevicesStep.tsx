import { Device, PatchPanel, Rack } from "../types";
import RackCanvas from "./RackCanvas";

type DeviceStepProps = { rack: Rack; devices: Device[]; patchPanels: PatchPanel[]; editingDeviceId: string | null; onAddDevice: () => void; onEditDevice: (id: string) => void; onRemoveDevice: (id: string) => void; onMoveItem: (id: string, type: "device" | "patch-panel", positionU: number) => boolean | void; };

export default function DevicesStep({ rack, devices, patchPanels, editingDeviceId, onAddDevice, onEditDevice, onRemoveDevice, onMoveItem }: DeviceStepProps) {
  return <>
    <div className="wizard-card-header"><div><h2>Urządzenia</h2><span>Dodaj urządzenia i ustaw ich fizyczne położenie bezpośrednio na szafie.</span></div><button className="secondary-button" onClick={onAddDevice}>+ Dodaj urządzenie</button></div>
    <div className="layout-workspace">
      <RackCanvas rack={rack} devices={devices} patchPanels={patchPanels} onMoveItem={onMoveItem} onEditItem={(id, type) => type === "device" && onEditDevice(id)} />
      <div className="workspace-list">
        <div className="workspace-list-header"><span>URZĄDZENIA</span><strong>{devices.length}</strong></div>
        {devices.length === 0 ? <div className="empty-state compact"><div className="placeholder-icon">◈</div><h3>Brak urządzeń</h3><p>Dodaj urządzenie, a następnie przeciągnij je na wybraną jednostkę U.</p><button className="primary-button" onClick={onAddDevice}>+ Dodaj urządzenie</button></div> : <div className="device-list">
          {devices.map((device) => <div className={"device-row " + (editingDeviceId === device.id ? "editing" : "")} key={device.id} draggable onDragStart={(event) => { event.dataTransfer.effectAllowed = "move"; event.dataTransfer.setData("text/netrack-item", JSON.stringify({ id: device.id, type: "device" })); }} onClick={() => onEditDevice(device.id)}>
            <div className="device-main"><div className="device-icon">◈</div><div><div className="device-name">{device.name}</div><div className="device-meta">{device.manufacturer || "Nie określono producenta"} · {device.model || "Nie określono modelu"}</div></div></div>
            <div className="device-spec"><span>U{device.positionU ?? "—"}</span><span>{device.heightU}U</span><span>{device.ports} portów</span></div>
            <button type="button" className="device-remove" onClick={(event) => { event.stopPropagation(); onRemoveDevice(device.id); }} aria-label={"Usuń " + device.name}>×</button>
          </div>)}
        </div>}
      </div>
    </div>
  </>;
}