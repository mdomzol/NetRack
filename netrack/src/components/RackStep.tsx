import { Device, PatchPanel, Rack } from "../types";

type RackStepProps = {
rack: Rack;
devices: Device[];
patchPanels: PatchPanel[];
updateRackField: <K extends keyof Rack>(
field: K,
value: Rack[K]
) => void;
};

function RackStep({
rack,
devices,
patchPanels,
updateRackField,
}: RackStepProps) {
const rackItems = [
...devices.map((device) => ({
id: device.id,
name: device.name,
type: "device" as const,
positionU: device.positionU,
heightU: device.heightU,
})),
...patchPanels.map((patchPanel) => ({
id: patchPanel.id,
name: patchPanel.name,
type: "patch-panel" as const,
positionU: patchPanel.positionU,
heightU: patchPanel.heightU,
})),
];

const getItemAtPosition = (positionU: number) => {
return rackItems.find(
(item) =>
item.positionU !== null &&
positionU >= item.positionU &&
positionU < item.positionU + item.heightU
);
};

return (
<> <div className="wizard-card-header"> <div> <h2>Konfiguracja szafy</h2>

      <span>
        Określ parametry fizyczne i identyfikację
        szafy rackowej
      </span>
    </div>
  </div>

  <div className="rack-config">
    <div className="rack-form">
      <div className="rack-form-section">
        <div className="form-section-title">
          Identyfikacja
        </div>

        <div className="form-grid">
          <div className="form-field">
            <label htmlFor="rack-name">
              Nazwa szafy
            </label>

            <input
              id="rack-name"
              type="text"
              value={rack.name}
              onChange={(event) =>
                updateRackField(
                  "name",
                  event.target.value
                )
              }
              placeholder="np. SR-01"
            />
          </div>

          <div className="form-field">
            <label htmlFor="rack-location">
              Lokalizacja
            </label>

            <input
              id="rack-location"
              type="text"
              value={rack.location}
              onChange={(event) =>
                updateRackField(
                  "location",
                  event.target.value
                )
              }
              placeholder="np. Serwerownia główna"
            />
          </div>

          <div className="form-field">
            <label htmlFor="rack-manufacturer">
              Producent
            </label>

            <input
              id="rack-manufacturer"
              type="text"
              value={rack.manufacturer}
              onChange={(event) =>
                updateRackField(
                  "manufacturer",
                  event.target.value
                )
              }
              placeholder="np. Lanberg"
            />
          </div>

          <div className="form-field">
            <label htmlFor="rack-model">
              Model
            </label>

            <input
              id="rack-model"
              type="text"
              value={rack.model}
              onChange={(event) =>
                updateRackField(
                  "model",
                  event.target.value
                )
              }
              placeholder="np. FF01-6822-12B"
            />
          </div>
        </div>
      </div>

      <div className="rack-form-section">
        <div className="form-section-title">
          Parametry szafy
        </div>

        <div className="form-grid rack-dimensions">
          <div className="form-field">
            <label htmlFor="rack-height">
              Wysokość
            </label>

            <select
              id="rack-height"
              value={rack.heightU}
              onChange={(event) =>
                updateRackField(
                  "heightU",
                  Number(event.target.value)
                )
              }
            >
              <option value={12}>12U</option>
              <option value={18}>18U</option>
              <option value={22}>22U</option>
              <option value={24}>24U</option>
              <option value={27}>27U</option>
              <option value={32}>32U</option>
              <option value={42}>42U</option>
              <option value={45}>45U</option>
              <option value={47}>47U</option>
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="rack-width">
              Szerokość
            </label>

            <select
              id="rack-width"
              value={rack.width}
              onChange={(event) =>
                updateRackField(
                  "width",
                  Number(event.target.value)
                )
              }
            >
              <option value={10}>10"</option>
              <option value={19}>19"</option>
              <option value={23}>23"</option>
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="rack-depth">
              Głębokość
            </label>

            <select
              id="rack-depth"
              value={rack.depth}
              onChange={(event) =>
                updateRackField(
                  "depth",
                  Number(event.target.value)
                )
              }
            >
              <option value={450}>450 mm</option>
              <option value={600}>600 mm</option>
              <option value={800}>800 mm</option>
              <option value={900}>900 mm</option>
              <option value={1000}>1000 mm</option>
              <option value={1200}>1200 mm</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <div className="rack-preview">
      <div className="rack-preview-header">
        <span>PREVIEW</span>

        <strong>
          {rack.name || "SR-01"}
        </strong>
      </div>

      <div className="rack-preview-body">
        <div className="rack-preview-scale">
          <div
            className="rack-unit-numbers"
            style={{
              gridTemplateRows:
                `repeat(${rack.heightU}, 1fr)`,
            }}
          >
            {Array.from(
              {
                length: rack.heightU,
              },
              (_, index) => (
                <span key={index}>
                  {rack.heightU - index}
                </span>
              )
            )}
          </div>

          <div className="rack-preview-unit">
            <div className="rack-preview-rail left" />
            <div className="rack-preview-rail right" />

            <div
              className="rack-units"
              style={{
                gridTemplateRows:
                  `repeat(${rack.heightU}, 1fr)`,
              }}
            >
              {Array.from(
                {
                  length: rack.heightU,
                },
                (_, index) => {
                  const positionU =
                    rack.heightU - index;

                  const item =
                    getItemAtPosition(
                      positionU
                    );

                  const isItemStart =
                    item?.positionU === positionU;

                  return (
                    <div
                      key={positionU}
                      className={`rack-preview-row ${
                        item
                          ? "rack-preview-row-occupied"
                          : ""
                      }`}
                    >
                      {isItemStart && (
                        <div
                          className={`rack-preview-item ${
                            item.type ===
                            "patch-panel"
                              ? "patch-panel"
                              : "device"
                          }`}
                          style={{
                            height: `calc(${item.heightU} * 100%)`,
                          }}
                        >
                          <strong>
                            {item.name}
                          </strong>

                          <span>
                            {item.heightU}U
                          </span>
                        </div>
                      )}
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="rack-preview-footer">
        <span>
          {rack.heightU}U
        </span>

        <span>
          {rack.width}" × {rack.depth} mm
        </span>
      </div>
    </div>
  </div>
</>

);
}

export default RackStep;
