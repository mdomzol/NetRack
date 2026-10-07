import { Device, PatchPanel, Rack } from "../types";
import RackCanvas from "./RackCanvas";

type PatchPanelStepProps = { rack: Rack; devices: Device[]; patchPanels: PatchPanel[]; onAddPatchPanel: () => void; onEditPatchPanel: (id: string) => void; onRemovePatchPanel: (id: string) => void; onMoveItem: (id: string, type: "device" | "patch-panel", positionU: number) => boolean | void; };

export default function PatchPanelStep({ rack, devices, patchPanels, onAddPatchPanel, onEditPatchPanel, onRemovePatchPanel, onMoveItem }: PatchPanelStepProps) {
  return <>
    <div className="wizard-card-header"><div><h2>Patchpanele</h2><span>Rozmieść patchpanele i urządzenia wspólnie w jednym widoku szafy.</span></div><button className="secondary-button" onClick={onAddPatchPanel}>+ Dodaj patchpanel</button></div>
    <div className="layout-workspace">
      <RackCanvas rack={rack} devices={devices} patchPanels={patchPanels} onMoveItem={onMoveItem} onEditItem={(id, type) => type === "patch-panel" && onEditPatchPanel(id)} />
      <div className="workspace-list">
        <div className="workspace-list-header"><span>PATCHPANELE</span><strong>{patchPanels.length}</strong></div>
        {patchPanels.length === 0 ? <div className="empty-state compact"><div className="placeholder-icon">▤</div><h3>Brak patchpaneli</h3><p>Dodaj patchpanel i ustaw go przeciągając na wybraną jednostkę U.</p><button className="primary-button" onClick={onAddPatchPanel}>+ Dodaj patchpanel</button></div> : <div className="patch-panel-list">
          {patchPanels.map((item) => <div key={item.id} className="patch-panel-row" draggable onDragStart={(event) => { event.dataTransfer.effectAllowed = "move"; event.dataTransfer.setData("text/netrack-item", JSON.stringify({ id: item.id, type: "patch-panel" })); }} onClick={() => onEditPatchPanel(item.id)}>
            <div className="patch-panel-main"><div className="patch-panel-icon">▤</div><div><div className="patch-panel-name">{item.name}</div><div className="patch-panel-meta">{item.manufacturer || "Nie określono producenta"} · {item.model || "Nie określono modelu"}</div></div></div>
            <div className="patch-panel-spec"><span>U{item.positionU ?? "—"}</span><span>{item.heightU}U</span><span>{item.ports} portów</span></div>
            <button type="button" className="device-remove" onClick={(event) => { event.stopPropagation(); onRemovePatchPanel(item.id); }} aria-label={"Usuń " + item.name}>×</button>
          </div>)}
        </div>}
      </div>
    </div>
  </>;
}