import { useState } from "react";

import DeviceEditorModal from "../components/DeviceEditorModal";
import PatchPanelEditorModal from "../components/PatchPanelEditorModal";
import RackAccessoryEditorModal from "../components/RackAccessoryEditorModal";
import WizardStep from "../components/WizardStep";

import { DEVICE_MODELS } from "../constants";

import ProjectStep from "../components/ProjectStep";
import RackStep from "../components/RackStep";
import RackEquipmentStep from "../components/RackEquipmentStep";
import SummaryStep from "../components/SummaryStep";

import {
  Device,
  PatchPanel,
  PatchPanelPort,
  RackAccessory,
  RackAccessoryType,
  ProjectDraft,
  Rack,
} from "../types";

type NewProjectProps = {
  project: ProjectDraft;
  setProject: React.Dispatch<React.SetStateAction<ProjectDraft>>;
  onCancel: () => void;
  onCreateProject: (project: ProjectDraft) => void;
};

type ValidationError = {
  message: string;
};

function NewProject({
  project,
  setProject,
  onCancel,
  onCreateProject,
}: NewProjectProps) {
  const [currentStep, setCurrentStep] = useState(1);

  const [editingDeviceId, setEditingDeviceId] =
    useState<string | null>(null);

  const [editingPatchPanelId, setEditingPatchPanelId] =
    useState<string | null>(null);
  const [editingAccessoryId, setEditingAccessoryId] = useState<string | null>(null);

  const editingDevice = project.devices.find(
    (device) => device.id === editingDeviceId
  );

  const editingPatchPanel = project.patchPanels.find((patchPanel) => patchPanel.id === editingPatchPanelId);
  const editingAccessory = project.accessories.find((accessory) => accessory.id === editingAccessoryId);

  /* =========================================================
     PROJECT UPDATE
     ========================================================= */

  const updateField = (
    field: keyof Pick<
      ProjectDraft,
      "name" | "location" | "description"
    >,
    value: string
  ) => {
    setProject((current) => ({
      ...current,
      [field]: value,
    }));
  };

  /* =========================================================
     RACK UPDATE
     ========================================================= */

  const updateRackField = <K extends keyof Rack>(
    field: K,
    value: Rack[K]
  ) => {
    setProject((current) => ({
      ...current,
      rack: {
        ...current.rack,
        [field]: value,
      },
    }));
  };

  /* =========================================================
     DEVICE MANAGEMENT
     ========================================================= */

  const findAvailablePosition = (
    heightU: number,
    devices: Device[],
    patchPanels: PatchPanel[], accessories: RackAccessory[] = project.accessories
  ): number | null => {
    const items = [
      ...devices.map((device) => ({
        positionU: device.positionU,
        heightU: device.heightU,
      })),
      ...patchPanels.map((patchPanel) => ({ positionU: patchPanel.positionU, heightU: patchPanel.heightU })),
      ...accessories.map((accessory) => ({ positionU: accessory.positionU, heightU: accessory.heightU })),
    ];

    for (let position = project.rack.heightU - heightU + 1; position >= 1; position--) {
      const overlaps = items.some((item) => {
        if (item.positionU === null) return false;

        const itemEnd = item.positionU + item.heightU - 1;
        const candidateEnd = position + heightU - 1;

        return position <= itemEnd && item.positionU <= candidateEnd;
      });

      if (!overlaps) return position;
    }

    return null;
  };

  const addDevice = () => {
    const newDevice: Device = {
      id: crypto.randomUUID(),
      name: `SW-${String(
        project.devices.length + 1
      ).padStart(2, "0")}`,
      type: "switch",
      manufacturer: "",
      model: "",
      ports: 24,
      heightU: 1,
      positionU: null,
    };

    setProject((current) => ({
      ...current,
      devices: [...current.devices, newDevice],
    }));

    setEditingDeviceId(newDevice.id);
  };

  const moveItem = (id: string, type: "device" | "patch-panel" | "accessory", positionU: number) => {
    const item = type === "device" ? project.devices.find((candidate) => candidate.id === id) : type === "patch-panel" ? project.patchPanels.find((candidate) => candidate.id === id) : project.accessories.find((candidate) => candidate.id === id);
    if (!item || positionU < 1 || positionU + item.heightU - 1 > project.rack.heightU) return false;
    const overlaps = [...project.devices, ...project.patchPanels, ...project.accessories].some((candidate) => {
      if (candidate.id === id || candidate.positionU === null) return false;
      return positionU <= candidate.positionU + candidate.heightU - 1 &&
        candidate.positionU <= positionU + item.heightU - 1;
    });
    if (overlaps) return false;
    setProject((current) => type === "device" ? { ...current, devices: current.devices.map((candidate) => candidate.id === id ? { ...candidate, positionU } : candidate) } : type === "patch-panel" ? { ...current, patchPanels: current.patchPanels.map((candidate) => candidate.id === id ? { ...candidate, positionU } : candidate) } : { ...current, accessories: current.accessories.map((candidate) => candidate.id === id ? { ...candidate, positionU } : candidate) });
    return true;
  };

  const removeDevice = (id: string) => {
    setProject((current) => ({
      ...current,
      devices: current.devices.filter(
        (device) => device.id !== id
      ),
    }));

    if (editingDeviceId === id) {
      setEditingDeviceId(null);
    }
  };

  const updateDevice = (
    id: string,
    changes: Partial<Device>
  ) => {
    setProject((current) => ({
      ...current,
      devices: current.devices.map((device) =>
        device.id === id
          ? {
              ...device,
              ...changes,
            }
          : device
      ),
    }));
  };

  /* =========================================================
     PATCH PANEL MANAGEMENT
     ========================================================= */

  const createPatchPanelPorts = (
    count: number
  ): PatchPanelPort[] => {
    return Array.from(
      { length: count },
      (_, index) => ({
        id: crypto.randomUUID(),
        number: index + 1,
        label: String(index + 1).padStart(2, "0"),
        status: "free",
      })
    );
  };

  const addPatchPanel = () => {
    const portCount = 24;

    const newPatchPanel: PatchPanel = {
      id: crypto.randomUUID(),
      name: `PP-${String(
        project.patchPanels.length + 1
      ).padStart(2, "0")}`,
      manufacturer: "",
      model: "",
      type: "Cat.6",
      ports: portCount,
      heightU: 1,
      positionU: null,
      portList: createPatchPanelPorts(portCount),
    };

    setProject((current) => ({
      ...current,
      patchPanels: [
        ...current.patchPanels,
        newPatchPanel,
      ],
    }));

    setEditingPatchPanelId(newPatchPanel.id);
  };

  const removePatchPanel = (id: string) => {
    setProject((current) => ({
      ...current,
      patchPanels: current.patchPanels.filter(
        (patchPanel) => patchPanel.id !== id
      ),
    }));

    if (editingPatchPanelId === id) {
      setEditingPatchPanelId(null);
    }
  };


  const addAccessory = (type: RackAccessoryType) => {
    const labels: Record<RackAccessoryType,string> = { organizer:"ORGANIZER", maskownica:"MASKOWNICA", ups:"UPS" };
    const heights: Record<RackAccessoryType,number> = { organizer:1, maskownica:1, ups:2 };
    const item: RackAccessory = { id:crypto.randomUUID(), name:`${labels[type]}-${String(project.accessories.filter((x)=>x.type===type).length+1).padStart(2,"0")}`, type, manufacturer:"", model:"", heightU:heights[type], positionU:null };
    setProject((current)=>({...current, accessories:[...current.accessories,item]})); setEditingAccessoryId(item.id);
  };
  const removeAccessory = (id:string) => { setProject((current)=>({...current, accessories:current.accessories.filter((x)=>x.id!==id)})); if(editingAccessoryId===id) setEditingAccessoryId(null); };
  const updateAccessory = (id:string, changes:Partial<RackAccessory>) => setProject((current)=>({...current, accessories:current.accessories.map((x)=>x.id===id?{...x,...changes}:x)}));

  /* =========================================================
     PROJECT VALIDATION
     ========================================================= */

  const validateProject = (): ValidationError[] => {
    const errors: ValidationError[] = [];

    /* ---------- PROJECT ---------- */

    if (!project.name.trim()) {
      errors.push({
        message: "Podaj nazwę projektu.",
      });
    }

    if (!project.location.trim()) {
      errors.push({
        message: "Podaj lokalizację projektu.",
      });
    }

    /* ---------- RACK ---------- */

    if (!project.rack.name.trim()) {
      errors.push({
        message: "Podaj nazwę szafy rack.",
      });
    }

    const rackHeight = project.rack.heightU;

    /* ---------- OCCUPIED UNITS ---------- */

    const occupiedUnits: {
      from: number;
      to: number;
      name: string;
    }[] = [];

    /* ---------- DEVICES ---------- */

    project.devices.forEach((device) => {
      if (device.positionU === null) {
        errors.push({
          message: `Urządzenie "${device.name}" nie ma ustalonej pozycji w szafie.`,
        });

        return;
      }

      const from = device.positionU;
      const to = from + device.heightU - 1;

      if (from < 1 || to > rackHeight) {
        errors.push({
          message: `Urządzenie "${device.name}" wychodzi poza wysokość szafy.`,
        });

        return;
      }

      occupiedUnits.push({
        from,
        to,
        name: device.name,
      });
    });

    /* ---------- PATCH PANELS ---------- */

    project.patchPanels.forEach((patchPanel) => {
      if (patchPanel.positionU === null) {
        errors.push({
          message: `Patchpanel "${patchPanel.name}" nie ma ustalonej pozycji w szafie.`,
        });

        return;
      }

      const from = patchPanel.positionU;
      const to = from + patchPanel.heightU - 1;

      if (from < 1 || to > rackHeight) {
        errors.push({
          message: `Patchpanel "${patchPanel.name}" wychodzi poza wysokość szafy.`,
        });

        return;
      }

      occupiedUnits.push({
        from,
        to,
        name: patchPanel.name,
      });
    });

    project.accessories.forEach((item) => { if (item.positionU === null) { errors.push({ message: `Element racka "${item.name}" nie ma ustalonej pozycji w szafie.` }); return; } const from=item.positionU,to=from+item.heightU-1; if(from<1||to>rackHeight){errors.push({message:`Element racka "${item.name}" wychodzi poza wysokość szafy.`});return;} occupiedUnits.push({from,to,name:item.name}); });

    /* ---------- POSITION CONFLICTS ---------- */

    for (let i = 0; i < occupiedUnits.length; i++) {
      for (let j = i + 1; j < occupiedUnits.length; j++) {
        const first = occupiedUnits[i];
        const second = occupiedUnits[j];

        const overlaps =
          first.from <= second.to &&
          second.from <= first.to;

        if (overlaps) {
          errors.push({
            message: `Konflikt pozycji: "${first.name}" i "${second.name}".`,
          });
        }
      }
    }

    return errors;
  };

  /* =========================================================
     VALIDATION RESULT
     ========================================================= */

  const validationErrors = validateProject();

  /* =========================================================
     NAVIGATION
     ========================================================= */

  const goNext = () => {
    if (currentStep < 4) {
      setCurrentStep((step) => step + 1);
      setEditingDeviceId(null);
      setEditingPatchPanelId(null);
    }
  };

  const goBack = () => {
    if (currentStep > 1) {
      setCurrentStep((step) => step - 1);
      setEditingDeviceId(null);
      setEditingPatchPanelId(null);
    }
  };

  /* =========================================================
     STEP CONTENT
     ========================================================= */

  const renderStepContent = () => {
    switch (currentStep) {
      /* -----------------------------------------------------
         STEP 1 — PROJECT DATA
         ----------------------------------------------------- */

      case 1:
        return (
          <ProjectStep
            project={project}
            updateField={updateField}
          />
        );

      /* -----------------------------------------------------
         STEP 2 — RACK
         ----------------------------------------------------- */

      case 2:
        return (
          <RackStep
            rack={project.rack}
            devices={project.devices}
            patchPanels={project.patchPanels}
            accessories={project.accessories}
            updateRackField={updateRackField}
          />
        );

      /* -----------------------------------------------------
         STEP 3 — RACK EQUIPMENT
         ----------------------------------------------------- */

      case 3:
        return (
          <RackEquipmentStep
            rack={project.rack}
            devices={project.devices}
            patchPanels={project.patchPanels}
            accessories={project.accessories}
            editingDeviceId={editingDeviceId}
            editingPatchPanelId={editingPatchPanelId}
            editingAccessoryId={editingAccessoryId}
            onAddDevice={addDevice}
            onEditDevice={setEditingDeviceId}
            onRemoveDevice={removeDevice}
            onAddPatchPanel={addPatchPanel}
            onEditPatchPanel={setEditingPatchPanelId}
            onRemovePatchPanel={removePatchPanel}
            onAddAccessory={addAccessory}
            onEditAccessory={setEditingAccessoryId}
            onRemoveAccessory={removeAccessory}
            onMoveItem={moveItem}
          />
        );

      /* -----------------------------------------------------
         STEP 4 — SUMMARY
         ----------------------------------------------------- */

      case 4:
        return (
          <SummaryStep
            project={project}
            validationErrors={validationErrors}
          />
        );

      default:
        return null;
    }
  };

  /* =========================================================
     CREATE PROJECT
     ========================================================= */

  const handleCreateProject = () => {
    if (validationErrors.length > 0) {
      return;
    }

    onCreateProject(project);
  };

  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <div className="wizard-app">

      {/* =====================================================
          TOPBAR
          ===================================================== */}

      <header className="wizard-topbar">
        <div className="wizard-brand">

          <div className="brand-mark">
            N
          </div>

          <div>
            <div className="brand-name">
              NetRack
            </div>

            <div className="brand-version">
              Nowy projekt
            </div>
          </div>

        </div>

        <button
          className="close-button"
          onClick={onCancel}
          aria-label="Zamknij"
        >
          ×
        </button>
      </header>

      {/* =====================================================
          CONTENT
          ===================================================== */}

      <main className="wizard-shell">
        <aside className="wizard-sidebar">
          <div className="wizard-sidebar-brand">
            <div className="wizard-brand-mark">EF</div>
            <div>
              <strong>NetRack</strong>
              <span>EDU-FIX · projekt</span>
            </div>
          </div>
          <div className="wizard-sidebar-intro">
            <div className="eyebrow">NEW PROJECT</div>
            <h1>Dokumentacja szafy</h1>
            <p>Skonfiguruj infrastrukturę krok po kroku. Zmiany są zachowywane w projekcie roboczym.</p>
          </div>
          <nav className="wizard-steps wizard-steps-vertical" aria-label="Etapy projektu">
            <WizardStep number="01" label="Dane projektu" active={currentStep === 1} completed={currentStep > 1} onClick={() => currentStep > 1 && setCurrentStep(1)} />
            <WizardStep number="02" label="Szafa rack" active={currentStep === 2} completed={currentStep > 2} onClick={() => currentStep > 2 && setCurrentStep(2)} />
            <WizardStep number="03" label="Wyposażenie racka" active={currentStep === 3} completed={currentStep > 3} onClick={() => currentStep > 3 && setCurrentStep(3)} />
            <WizardStep number="04" label="Podsumowanie" active={currentStep === 4} />
          </nav>
          <div className="wizard-sidebar-status">
            <span className="status-dot" />
            <div>
              <strong>Projekt roboczy</strong>
              <span>Zmiany nie są jeszcze zapisane</span>
            </div>
          </div>
        </aside>

        <section className="wizard-main">
          <div className="wizard-main-header">
            <div>
              <span className="wizard-step-kicker">KROK {String(currentStep).padStart(2, "0")} / 04</span>
              <h2>{["Dane projektu", "Konfiguracja szafy", "Wyposażenie racka", "Podsumowanie"][currentStep - 1]}</h2>
            </div>
            <button className="close-button" onClick={onCancel} aria-label="Zamknij">×</button>
          </div>
          <section className="wizard-card">
            {renderStepContent()}
          </section>
        <div className="wizard-footer">

          {currentStep === 1 ? (
            <button
              className="secondary-button"
              onClick={onCancel}
            >
              Anuluj
            </button>
          ) : (
            <button
              className="secondary-button"
              onClick={goBack}
            >
              ← Wstecz
            </button>
          )}

          {currentStep < 4 ? (
            <button
              className="primary-button"
              onClick={goNext}
              disabled={
                currentStep === 1 &&
                (
                  !project.name.trim() ||
                  !project.location.trim()
                )
              }
            >
              Dalej →
            </button>
          ) : (
            <button
              className="primary-button"
              onClick={handleCreateProject}
              disabled={validationErrors.length > 0}
            >
              Utwórz projekt
            </button>
          )}

        </div>
        </section>
      </main>

      {/* =====================================================
          DEVICE EDITOR
          ===================================================== */}

      {editingDevice && (
        <DeviceEditorModal
          device={editingDevice}
          rackHeight={project.rack.heightU}
          deviceModels={DEVICE_MODELS}
          onSave={(changes) => {
            updateDevice(
              editingDevice.id,
              changes
            );

            setEditingDeviceId(null);
          }}
          onCancel={() => {
            setEditingDeviceId(null);
          }}
        />
      )}

      {/* =====================================================
          PATCH PANEL EDITOR
          ===================================================== */}

      {editingAccessory && (<RackAccessoryEditorModal accessory={editingAccessory} rackHeight={project.rack.heightU} onSave={(changes)=>{updateAccessory(editingAccessory.id,changes);setEditingAccessoryId(null)}} onCancel={()=>setEditingAccessoryId(null)} />)}

      {editingPatchPanel && (
        <PatchPanelEditorModal
          patchPanel={editingPatchPanel}
          rackHeight={project.rack.heightU}
          onSave={(updatedPatchPanel) => {
            setProject((current) => ({
              ...current,
              patchPanels:
                current.patchPanels.map(
                  (patchPanel) =>
                    patchPanel.id ===
                    updatedPatchPanel.id
                      ? updatedPatchPanel
                      : patchPanel
                ),
            }));

            setEditingPatchPanelId(null);
          }}
          onCancel={() => {
            setEditingPatchPanelId(null);
          }}
        />
      )}

    </div>
  );
}

export default NewProject;