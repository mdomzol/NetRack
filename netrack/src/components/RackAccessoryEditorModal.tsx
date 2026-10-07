import { useEffect, useState } from "react";
import { RackAccessory } from "../types";
type Props={accessory:RackAccessory;rackHeight:number;onSave:(changes:Partial<RackAccessory>)=>void;onCancel:()=>void};
export default function RackAccessoryEditorModal({accessory,rackHeight,onSave,onCancel}:Props){
 const [form,setForm]=useState(accessory); useEffect(()=>setForm(accessory),[accessory]);
 return <div className="device-modal-overlay" onMouseDown={e=>e.target===e.currentTarget&&onCancel()}>
  <div className="device-modal" role="dialog" aria-modal="true" aria-labelledby="rack-accessory-title">
   <header className="device-modal-header"><div><div className="form-section-title">ELEMENT RACKA</div><h2 id="rack-accessory-title">{form.name||"Nowy element"}</h2><p>Konfiguracja elementu racka.</p></div><button className="close-button" onClick={onCancel}>×</button></header>
   <div className="device-modal-body">
    <section className="device-editor-section"><div className="device-editor-section-title">Informacje podstawowe</div><div className="device-editor-grid">
     <div className="form-field full"><label>Nazwa</label><input autoFocus value={form.name} onChange={e=>setForm(v=>({...v,name:e.target.value}))}/></div>
     <div className="form-field"><label>Producent</label><input value={form.manufacturer} onChange={e=>setForm(v=>({...v,manufacturer:e.target.value}))}/></div>
     <div className="form-field"><label>Model</label><input value={form.model} onChange={e=>setForm(v=>({...v,model:e.target.value}))}/></div>
    </div></section>
    <section className="device-editor-section"><div className="device-editor-section-title">Montaż</div><div className="device-editor-grid">
     <div className="form-field"><label>Wysokość</label><select value={form.heightU} onChange={e=>setForm(v=>({...v,heightU:Number(e.target.value)}))}>{Array.from({length:Math.min(rackHeight,10)},(_,i)=>i+1).map(u=><option key={u} value={u}>{u}U</option>)}</select></div>
     <div className="form-field"><label>Pozycja</label><select value={form.positionU??""} onChange={e=>setForm(v=>({...v,positionU:e.target.value?Number(e.target.value):null}))}><option value="">Automatyczna</option>{Array.from({length:rackHeight},(_,i)=>rackHeight-i).map(u=><option key={u} value={u}>U{u}</option>)}</select></div>
    </div></section>
   </div>
   <footer className="device-modal-footer"><button className="secondary-button" onClick={onCancel}>Anuluj</button><button className="primary-button" disabled={!form.name.trim()} onClick={()=>onSave({name:form.name,type:form.type,manufacturer:form.manufacturer,model:form.model,heightU:form.heightU,positionU:form.positionU})}>Zapisz zmiany</button></footer>
  </div>
 </div>
}