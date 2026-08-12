import { PatchPanel } from "../types";

type PatchPanelStepProps = {
  patchPanels: PatchPanel[];
  onAddPatchPanel: () => void;
  onEditPatchPanel: (id: string) => void;
  onRemovePatchPanel: (id: string) => void;
};

function PatchPanelStep({
  patchPanels,
  onAddPatchPanel,
  onEditPatchPanel,
  onRemovePatchPanel,
}: PatchPanelStepProps) {
  return (
    <>
      <div className="wizard-card-header">
        <div>
          <h2>Patchpanele</h2>

          <span>
            Skonfiguruj patchpanele i ich porty
          </span>
        </div>

        <button
          className="secondary-button"
          onClick={onAddPatchPanel}
        >
          + Dodaj patchpanel
        </button>
      </div>

      <div className="patch-panels-content">
        {patchPanels.length === 0 ? (
          <div className="empty-state">
            <div className="placeholder-icon">
              ▤
            </div>

            <h3>Brak patchpaneli</h3>

            <p>
              Dodaj pierwszy patchpanel znajdujący się
              w dokumentowanej szafie.
            </p>

            <button
              className="primary-button"
              onClick={onAddPatchPanel}
            >
              + Dodaj patchpanel
            </button>
          </div>
        ) : (
          <div className="patch-panel-list">
            {patchPanels.map((patchPanel) => (
              <div
                key={patchPanel.id}
                className="patch-panel-row"
                onClick={() =>
                  onEditPatchPanel(patchPanel.id)
                }
              >
                <div className="patch-panel-main">
                  <div className="patch-panel-icon">
                    ▤
                  </div>

                  <div>
                    <div className="patch-panel-name">
                      {patchPanel.name}
                    </div>

                    <div className="patch-panel-meta">
                      {patchPanel.manufacturer ||
                        "Nie określono producenta"}

                      {" · "}

                      {patchPanel.model ||
                        "Nie określono modelu"}
                    </div>
                  </div>
                </div>

                <div className="patch-panel-spec">
                  <span>
                    {patchPanel.ports} portów
                  </span>

                  <span>
                    {patchPanel.heightU}U
                  </span>

                  <span>
                    {patchPanel.type}
                  </span>
                </div>

                <button
                  type="button"
                  className="device-remove"
                  onClick={(event) => {
                    event.stopPropagation();

                    onRemovePatchPanel(
                      patchPanel.id
                    );
                  }}
                  aria-label={`Usuń ${patchPanel.name}`}
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

export default PatchPanelStep;