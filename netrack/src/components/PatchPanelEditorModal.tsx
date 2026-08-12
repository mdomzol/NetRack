import { useEffect, useState } from "react";
import { PatchPanel } from "../types";

type PatchPanelEditorModalProps = {
  patchPanel: PatchPanel;
  rackHeight: number;
  onSave: (patchPanel: PatchPanel) => void;
  onCancel: () => void;
};

const PORT_OPTIONS = [12, 16, 24, 48, 96];
const HEIGHT_OPTIONS = [1, 2, 3];

function createPort(
  number: number
): PatchPanel["portList"][number] {
  return {
    id: crypto.randomUUID(),
    number,
    label: String(number).padStart(2, "0"),
    status: "free",
  };
}

function resizePortList(
  currentPorts: PatchPanel["portList"],
  count: number
): PatchPanel["portList"] {
  return Array.from({ length: count }, (_, index) => {
    const existingPort = currentPorts[index];

    if (existingPort) {
      return {
        ...existingPort,
        number: index + 1,
      };
    }

    return createPort(index + 1);
  });
}

function PatchPanelEditorModal({
  patchPanel,
  rackHeight,
  onSave,
  onCancel,
}: PatchPanelEditorModalProps) {
  const [draft, setDraft] = useState<PatchPanel>(() => ({
    ...patchPanel,
    portList: patchPanel.portList.map((port) => ({
      ...port,
    })),
  }));

  useEffect(() => {
    setDraft({
      ...patchPanel,
      portList: patchPanel.portList.map((port) => ({
        ...port,
      })),
    });
  }, [patchPanel]);

  const updateField = <K extends keyof PatchPanel>(
    field: K,
    value: PatchPanel[K]
  ) => {
    setDraft((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updatePorts = (ports: number) => {
    setDraft((current) => ({
      ...current,
      ports,
      portList: resizePortList(
        current.portList,
        ports
      ),
    }));
  };

  const handleSave = () => {
    onSave(draft);
  };

  return (
    <div
      className="editor-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="patch-panel-editor-title"
    >
      <div className="editor-panel">

        {/* HEADER */}

        <div className="editor-panel-header">
          <div>
            <div className="form-section-title">
              EDYCJA PATCHPANELU
            </div>

            <h2 id="patch-panel-editor-title">
              {draft.name || "Patchpanel"}
            </h2>
          </div>

          <button
            type="button"
            className="close-button"
            onClick={onCancel}
            aria-label="Zamknij edytor"
          >
            ×
          </button>
        </div>

        <div className="editor-panel-body">

          {/* IDENTYFIKACJA */}

          <div className="editor-section">
            <div className="form-section-title">
              IDENTYFIKACJA
            </div>

            <div className="form-grid">

              <div className="form-field">
                <label htmlFor="patch-panel-name">
                  Nazwa
                </label>

                <input
                  id="patch-panel-name"
                  type="text"
                  value={draft.name}
                  onChange={(event) =>
                    updateField(
                      "name",
                      event.target.value
                    )
                  }
                />
              </div>

              <div className="form-field">
                <label htmlFor="patch-panel-type">
                  Typ
                </label>

                <select
                  id="patch-panel-type"
                  value={draft.type}
                  onChange={(event) =>
                    updateField(
                      "type",
                      event.target.value
                    )
                  }
                >
                  <option value="Cat.5e">
                    Cat.5e
                  </option>

                  <option value="Cat.6">
                    Cat.6
                  </option>

                  <option value="Cat.6A">
                    Cat.6A
                  </option>

                  <option value="Cat.7">
                    Cat.7
                  </option>

                  <option value="światłowód">
                    Światłowód
                  </option>

                  <option value="inne">
                    Inne
                  </option>
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="patch-panel-manufacturer">
                  Producent
                </label>

                <input
                  id="patch-panel-manufacturer"
                  type="text"
                  value={draft.manufacturer}
                  onChange={(event) =>
                    updateField(
                      "manufacturer",
                      event.target.value
                    )
                  }
                  placeholder="np. Digitus"
                />
              </div>

              <div className="form-field">
                <label htmlFor="patch-panel-model">
                  Model
                </label>

                <input
                  id="patch-panel-model"
                  type="text"
                  value={draft.model}
                  onChange={(event) =>
                    updateField(
                      "model",
                      event.target.value
                    )
                  }
                  placeholder="np. DN-91624S"
                />
              </div>

            </div>
          </div>

          {/* PARAMETRY */}

          <div className="editor-section">
            <div className="form-section-title">
              PARAMETRY
            </div>

            <div className="form-grid">

              <div className="form-field">
                <label htmlFor="patch-panel-ports">
                  Liczba portów
                </label>

                <select
                  id="patch-panel-ports"
                  value={draft.ports}
                  onChange={(event) =>
                    updatePorts(
                      Number(event.target.value)
                    )
                  }
                >
                  {PORT_OPTIONS.map((count) => (
                    <option
                      key={count}
                      value={count}
                    >
                      {count}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="patch-panel-height">
                  Wysokość
                </label>

                <select
                  id="patch-panel-height"
                  value={draft.heightU}
                  onChange={(event) =>
                    updateField(
                      "heightU",
                      Number(event.target.value)
                    )
                  }
                >
                  {HEIGHT_OPTIONS.map((height) => (
                    <option
                      key={height}
                      value={height}
                    >
                      {height}U
                    </option>
                  ))}
                </select>
              </div>

              {/* NOWE POLE */}

              <div className="form-field">
                <label htmlFor="patch-panel-position">
                  Pozycja w szafie
                </label>

                <select
                  id="patch-panel-position"
                  value={
                    draft.positionU === null
                      ? ""
                      : draft.positionU
                  }
                  onChange={(event) =>
                    updateField(
                      "positionU",
                      event.target.value === ""
                        ? null
                        : Number(event.target.value)
                    )
                  }
                >
                  <option value="">
                    Nieprzypisane
                  </option>

                  {Array.from(
                    { length: rackHeight },
                    (_, index) => {
                      const position = index + 1;

                      return (
                        <option
                          key={position}
                          value={position}
                        >
                          U{position}
                        </option>
                      );
                    }
                  )}
                </select>
              </div>

            </div>
          </div>

          {/* PORTY */}

          <div className="editor-section">
            <div className="form-section-title">
              PORTY
            </div>

            <div className="port-preview">
              {draft.portList.map((port) => (
                <div
                  key={port.id}
                  className={`port-item ${port.status}`}
                >
                  <span className="port-number">
                    {port.label}
                  </span>

                  <span className="port-status">
                    {port.status === "free"
                      ? "Wolny"
                      : "Połączony"}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* FOOTER */}

        <div className="editor-panel-footer">
          <button
            type="button"
            className="secondary-button"
            onClick={onCancel}
          >
            Anuluj
          </button>

          <button
            type="button"
            className="primary-button"
            onClick={handleSave}
          >
            Zapisz zmiany
          </button>
        </div>

      </div>
    </div>
  );
}

export default PatchPanelEditorModal;