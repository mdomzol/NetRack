import { Device } from "../types";

type DeviceStepProps = {
  devices: Device[];
  editingDeviceId: string | null;
  onAddDevice: () => void;
  onEditDevice: (id: string) => void;
  onRemoveDevice: (id: string) => void;
};

function DeviceStep({
  devices,
  editingDeviceId,
  onAddDevice,
  onEditDevice,
  onRemoveDevice,
}: DeviceStepProps) {
  return (
    <>
      <div className="wizard-card-header">
        <div>
          <h2>Urządzenia</h2>

          <span>
            Dodaj urządzenia znajdujące się
            w szafie
          </span>
        </div>

        <button
          className="secondary-button"
          onClick={onAddDevice}
        >
          + Dodaj urządzenie
        </button>
      </div>

      <div className="devices-content">
        {devices.length === 0 ? (
          <div className="empty-state">
            <div className="placeholder-icon">
              ◈
            </div>

            <h3>Brak urządzeń</h3>

            <p>
              Dodaj pierwsze urządzenie
              znajdujące się w dokumentowanej
              szafie.
            </p>

            <button
              className="primary-button"
              onClick={onAddDevice}
            >
              + Dodaj urządzenie
            </button>
          </div>
        ) : (
          <div className="device-list">
            {devices.map((device) => (
              <div
                className={`device-row ${
                  editingDeviceId === device.id
                    ? "editing"
                    : ""
                }`}
                key={device.id}
                onClick={() =>
                  onEditDevice(device.id)
                }
              >
                <div className="device-main">
                  <div className="device-icon">
                    ◈
                  </div>

                  <div>
                    <div className="device-name">
                      {device.name}
                    </div>

                    <div className="device-meta">
                      {device.manufacturer ||
                        "Nie określono producenta"}

                      {" · "}

                      {device.model ||
                        "Nie określono modelu"}
                    </div>
                  </div>
                </div>

                <div className="device-spec">
                  <span>
                    {device.ports} portów
                  </span>

                  <span>
                    {device.heightU}U
                  </span>
                </div>

                <button
                  type="button"
                  className="device-remove"
                  onClick={(event) => {
                    event.stopPropagation();

                    onRemoveDevice(device.id);
                  }}
                  aria-label={`Usuń ${device.name}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default DeviceStep;