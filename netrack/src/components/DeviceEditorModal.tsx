import { useEffect, useState } from "react";
import { Device, DeviceModel, DeviceType } from "../types";

type DeviceEditorModalProps = {
  device: Device;
  rackHeight: number;
  deviceModels: DeviceModel[];
  onSave: (changes: Partial<Device>) => void;
  onCancel: () => void;
};

function DeviceEditorModal({
  device,
  rackHeight,
  deviceModels,
  onSave,
  onCancel,
}: DeviceEditorModalProps) {
  const [form, setForm] = useState<Device>(device);

  useEffect(() => {
    setForm(device);
  }, [device]);

  const updateField = <K extends keyof Device>(
    field: K,
    value: Device[K]
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleModelChange = (modelId: string) => {
    const model = deviceModels.find(
      (item) => item.id === modelId
    );

    if (!model) {
      return;
    }

    setForm((current) => ({
      ...current,
      manufacturer: model.manufacturer,
      model: model.model,
      type: model.type,
      ports: model.ports,
      portLayout: model.portLayout,
      heightU: model.heightU,
    }));
  };

  const selectedModel =
    deviceModels.find(
      (model) =>
        model.manufacturer === form.manufacturer &&
        model.model === form.model
    )?.id ?? "";

  const handleSave = () => {
    onSave({
      name: form.name,
      type: form.type,
      manufacturer: form.manufacturer,
      model: form.model,
      ports: form.ports,
      portLayout: form.portLayout,
      heightU: form.heightU,
    });
  };

  return (
    <div
      className="device-modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onCancel();
        }
      }}
    >
      <div
        className="device-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="device-editor-title"
      >
        <header className="device-modal-header">
          <div>
            <div className="form-section-title">
              EDYCJA URZĄDZENIA
            </div>

            <h2 id="device-editor-title">
              {form.name || "Nowe urządzenie"}
            </h2>

            <p>
              Konfiguracja urządzenia sieciowego
            </p>
          </div>

          <button
            className="close-button"
            onClick={onCancel}
            aria-label="Zamknij edytor"
          >
            ×
          </button>
        </header>

        <div className="device-modal-body">
          <section className="device-editor-section">
            <div className="device-editor-section-title">
              Informacje podstawowe
            </div>

            <div className="device-editor-grid">
              <div className="form-field full">
                <label htmlFor="device-name">
                  Nazwa urządzenia
                </label>

                <input
                  id="device-name"
                  type="text"
                  value={form.name}
                  onChange={(event) =>
                    updateField(
                      "name",
                      event.target.value
                    )
                  }
                  autoFocus
                />
              </div>

              <div className="form-field full">
                <label htmlFor="device-model">
                  Gotowy model
                </label>

                <select
                  id="device-model"
                  value={selectedModel}
                  onChange={(event) =>
                    handleModelChange(
                      event.target.value
                    )
                  }
                >
                  <option value="">
                    Wybierz model...
                  </option>

                  {deviceModels.map((model) => (
                    <option
                      key={model.id}
                      value={model.id}
                    >
                      {model.manufacturer}{" "}
                      {model.model}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="device-type">
                  Typ urządzenia
                </label>

                <select
                  id="device-type"
                  value={form.type}
                  onChange={(event) =>
                    updateField(
                      "type",
                      event.target.value as DeviceType
                    )
                  }
                >
                  <option value="switch">
                    Switch
                  </option>

                  <option value="router">
                    Router
                  </option>

                  <option value="server">
                    Serwer
                  </option>

                  <option value="firewall">
                    Firewall
                  </option>

                  <option value="other">
                    Inne
                  </option>
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="device-manufacturer">
                  Producent
                </label>

                <input
                  id="device-manufacturer"
                  type="text"
                  value={form.manufacturer}
                  onChange={(event) =>
                    updateField(
                      "manufacturer",
                      event.target.value
                    )
                  }
                />
              </div>

              <div className="form-field">
                <label htmlFor="device-model-name">
                  Model
                </label>

                <input
                  id="device-model-name"
                  type="text"
                  value={form.model}
                  onChange={(event) =>
                    updateField(
                      "model",
                      event.target.value
                    )
                  }
                />
              </div>
            </div>
          </section>

          <section className="device-editor-section">
            <div className="device-editor-section-title">
              Parametry
            </div>

            <div className="device-editor-grid three">
              <div className="form-field">
                <label htmlFor="device-ports">
                  Liczba portów
                </label>

                <input
                  id="device-ports"
                  type="number"
                  min="0"
                  value={form.ports}
                  onChange={(event) =>
                    updateField(
                      "ports",
                      Math.max(
                        0,
                        Number(event.target.value)
                      )
                    )
                  }
                />
              </div>

              <div className="form-field">
                <label htmlFor="device-height">
                  Wysokość
                </label>

                <select
                  id="device-height"
                  value={form.heightU}
                  onChange={(event) =>
                    updateField(
                      "heightU",
                      Number(event.target.value)
                    )
                  }
                >
                  {Array.from(
                    { length: Math.min(rackHeight, 10) },
                    (_, index) => index + 1
                  ).map((height) => (
                    <option
                      key={height}
                      value={height}
                    >
                      {height}U
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="device-position">
                  Pozycja w szafie
                </label>

                <select
                  id="device-position"
                  value={form.positionU ?? ""}
                  onChange={(event) =>
                    updateField(
                      "positionU",
                      event.target.value
                        ? Number(event.target.value)
                        : null
                    )
                  }
                >
                  <option value="">
                    Automatyczna
                  </option>

                  {Array.from(
                    { length: rackHeight },
                    (_, index) => rackHeight - index
                  ).map((position) => (
                    <option
                      key={position}
                      value={position}
                    >
                      U{position}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section className="device-editor-section">
            <div className="device-editor-section-title">
              Podgląd
            </div>

            <div className="device-summary">
              <div className="device-summary-icon">
                ◈
              </div>

              <div>
                <strong>
                  {form.name || "Bez nazwy"}
                </strong>

                <span>
                  {form.manufacturer || "Brak producenta"}
                  {" · "}
                  {form.model || "Brak modelu"}
                  {" · "}
                  {form.portLayout?.filter((port) => port.type === "rj45").length ?? form.ports} RJ45
                  {(form.portLayout?.filter((port) => port.type !== "rj45").length ?? 0) > 0 && (
                    <>
                      {" · "}
                      {form.portLayout?.filter((port) => port.type === "sfp").length ?? 0} SFP
                      {" · "}
                      {form.portLayout?.filter((port) => port.type === "sfp+").length ?? 0} SFP+
                    </>
                  )}
                  {" · "}
                  {form.heightU}U
                </span>
              </div>
            </div>
          </section>
        </div>

        <footer className="device-modal-footer">
          <button
            className="secondary-button"
            onClick={onCancel}
          >
            Anuluj
          </button>

          <button
            className="primary-button"
            onClick={handleSave}
            disabled={!form.name.trim()}
          >
            Zapisz zmiany
          </button>
        </footer>
      </div>
    </div>
  );
}

export default DeviceEditorModal;