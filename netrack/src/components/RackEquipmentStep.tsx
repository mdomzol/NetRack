import { Device, PatchPanel, Rack, RackAccessory, RackAccessoryType } from "../types";
import RackCanvas from "./RackCanvas";
import Icon from "./Icon";

type Props = {
  rack: Rack;
  devices: Device[];
  patchPanels: PatchPanel[];
  accessories: RackAccessory[];
  editingDeviceId: string | null;
  editingPatchPanelId: string | null;
  editingAccessoryId: string | null;
  onAddDevice: () => void;
  onEditDevice: (id: string) => void;
  onRemoveDevice: (id: string) => void;
  onAddPatchPanel: () => void;
  onEditPatchPanel: (id: string) => void;
  onRemovePatchPanel: (id: string) => void;
  onAddAccessory: (type: RackAccessoryType) => void;
  onEditAccessory: (id: string) => void;
  onRemoveAccessory: (id: string) => void;
  onMoveItem: (id: string, type: "device" | "patch-panel", positionU: number) => boolean | void;
};

export default function RackEquipmentStep({
  rack, devices, patchPanels, accessories, editingDeviceId, editingPatchPanelId, editingAccessoryId,
  onAddDevice, onEditDevice, onRemoveDevice,
  onAddPatchPanel, onEditPatchPanel, onRemovePatchPanel, onAddAccessory, onEditAccessory, onRemoveAccessory, onMoveItem,
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
          <button className="secondary-button" onClick={onAddPatchPanel}><Icon name="patch-panel" /> Patchpanel</button>
          <button className="primary-button" onClick={onAddDevice}><Icon name="switch" /> Urządzenie</button>
          <div className="equipment-accessory-actions"><button className="secondary-button" onClick={()=>onAddAccessory("organizer")}>Organizer</button><button className="secondary-button" onClick={()=>onAddAccessory("maskownica")}>Maskownica</button><button className="secondary-button" onClick={()=>onAddAccessory("ups")}>UPS</button></div>
        </div>
      </div>

      <div className="layout-workspace rack-equipment-workspace">
        <RackCanvas
          rack={rack}
          devices={devices}
          patchPanels={patchPanels}
          accessories={accessories}
          onMoveItem={onMoveItem}
          onEditItem={(id, type) => type === "device" ? onEditDevice(id) : type === "patch-panel" ? onEditPatchPanel(id) : onEditAccessory(id)}
        />

        <div className="workspace-list equipment-list">
          <div className="workspace-list-header">
            <span>ELEMENTY SZAFY</span>
            <strong>{devices.length + patchPanels.length}</strong>
          </div>

          <div className="equipment-group"><div className="equipment-group-title"><span>AKCESORIA RACKA</span><em>{accessories.length}</em></div>{accessories.length ? accessories.map((item)=><button type="button" key={item.id} draggable onDragStart={(e)=>drag(e,item.id,"accessory")} onClick={()=>onEditAccessory(item.id)} className={`equipment-row accessory ${editingAccessoryId===item.id?"editing":""}`}><span className="equipment-row-icon accessory">R</span><span className="equipment-row-main"><strong>{item.name}</strong><small>{item.type==="organizer"?"Organizer kablowy":item.type==="maskownica"?"Panel zaślepiający":"UPS"} · {item.manufacturer||"Brak producenta"}{item.model?" · "+item.model:""}</small></span><span className={`equipment-row-position ${item.positionU===null?"unmounted":""}`}>{item.positionU?`U${item.positionU}`:"NIEZAMONTOWANE"}<small>{item.positionU?`${item.heightU}U`:"przeciągnij do racka"}</small></span><span className="equipment-row-remove" onClick={(e)=>{e.stopPropagation();onRemoveAccessory(item.id)}}>×</span></button>):<div className="equipment-empty">Brak organizerów, maskownicaów i UPS-ów.</div>}</div>

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
                <span className="equipment-row-icon"><Icon name="switch" /></span>
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
                <span className="equipment-row-icon pp"><Icon name="patch-panel" /></span>
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
