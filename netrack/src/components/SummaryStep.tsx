import { ProjectDraft } from "../types";

type SummaryStepProps = {
  project: ProjectDraft;
  validationErrors: {
    message: string;
  }[];
};

function SummaryStep({
  project,
  validationErrors,
}: SummaryStepProps) {
  return (
    <>
      <div className="wizard-card-header">
        <div>
          <h2>Podsumowanie</h2>

          <span>
            Sprawdź konfigurację przed utworzeniem projektu
          </span>
        </div>
      </div>

      {validationErrors.length > 0 ? (
        <div className="summary-validation error">
          <div className="summary-validation-icon">
            !
          </div>

          <div className="summary-validation-content">
            <strong>
              Konfiguracja wymaga poprawy
            </strong>

            <span>
              {validationErrors.length === 1
                ? "Wykryto 1 problem przed utworzeniem projektu."
                : `Wykryto ${validationErrors.length} problemy przed utworzeniem projektu.`}
            </span>

            <div className="summary-validation-list">
              {validationErrors.map((error, index) => (
                <div key={index}>
                  <span>•</span>
                  {error.message}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="summary-validation success">
          <div className="summary-validation-icon">
            ✓
          </div>

          <div className="summary-validation-content">
            <strong>
              Konfiguracja jest poprawna
            </strong>

            <span>
              Projekt jest gotowy do utworzenia.
            </span>
          </div>
        </div>
      )}

      <div className="summary-content">
        <section className="summary-section">
          <div className="summary-section-title">
            Projekt
          </div>

          <div className="summary-grid">
            <div className="summary-item">
              <span>Nazwa projektu</span>
              <strong>
                {project.name || "Nie podano"}
              </strong>
            </div>

            <div className="summary-item">
              <span>Lokalizacja</span>
              <strong>
                {project.location || "Nie podano"}
              </strong>
            </div>

            <div className="summary-item summary-item-wide">
              <span>Opis</span>
              <strong>
                {project.description || "Brak opisu"}
              </strong>
            </div>
          </div>
        </section>

        <section className="summary-section">
          <div className="summary-section-title">
            Szafa rack
          </div>

          <div className="summary-grid">
            <div className="summary-item">
              <span>Nazwa</span>
              <strong>
                {project.rack.name || "Nie podano"}
              </strong>
            </div>

            <div className="summary-item">
              <span>Lokalizacja</span>
              <strong>
                {project.rack.location || "Nie podano"}
              </strong>
            </div>

            <div className="summary-item">
              <span>Producent</span>
              <strong>
                {project.rack.manufacturer || "Nie podano"}
              </strong>
            </div>

            <div className="summary-item">
              <span>Model</span>
              <strong>
                {project.rack.model || "Nie podano"}
              </strong>
            </div>

            <div className="summary-item">
              <span>Wysokość</span>
              <strong>
                {project.rack.heightU}U
              </strong>
            </div>

            <div className="summary-item">
              <span>Wymiary</span>
              <strong>
                {project.rack.width}" ×{" "}
                {project.rack.depth} mm
              </strong>
            </div>
          </div>
        </section>

        <section className="summary-section">
          <div className="summary-section-header">
            <div className="summary-section-title">
              Urządzenia
            </div>

            <span className="summary-count">
              {project.devices.length}
            </span>
          </div>

          {project.devices.length === 0 ? (
            <div className="summary-empty">
              Nie dodano żadnych urządzeń.
            </div>
          ) : (
            <div className="summary-list">
              {project.devices.map((device) => (
                <div
                  key={device.id}
                  className="summary-list-row"
                >
                  <div>
                    <strong>{device.name}</strong>

                    <span>
                      {device.manufacturer ||
                        "Nie określono producenta"}

                      {" · "}

                      {device.model ||
                        "Nie określono modelu"}
                    </span>
                  </div>

                  <div className="summary-list-meta">
                    <span>
                      {device.type}
                    </span>

                    <span>
                      {device.ports} portów
                    </span>

                    <span>
                      {device.heightU}U
                    </span>

                    <span>
                      {device.positionU
                        ? `U${device.positionU}`
                        : "Pozycja nieustalona"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="summary-section">
          <div className="summary-section-header">
            <div className="summary-section-title">
              Patchpanele
            </div>

            <span className="summary-count">
              {project.patchPanels.length}
            </span>
          </div>

          {project.patchPanels.length === 0 ? (
            <div className="summary-empty">
              Nie dodano żadnych patchpaneli.
            </div>
          ) : (
            <div className="summary-list">
              {project.patchPanels.map(
                (patchPanel) => (
                  <div
                    key={patchPanel.id}
                    className="summary-list-row"
                  >
                    <div>
                      <strong>
                        {patchPanel.name}
                      </strong>

                      <span>
                        {patchPanel.manufacturer ||
                          "Nie określono producenta"}

                        {" · "}

                        {patchPanel.model ||
                          "Nie określono modelu"}
                      </span>
                    </div>

                    <div className="summary-list-meta">
                      <span>
                        {patchPanel.ports} portów
                      </span>

                      <span>
                        {patchPanel.heightU}U
                      </span>

                      <span>
                        {patchPanel.type}
                      </span>

                      <span>
                        {
                          patchPanel.portList.filter(
                            (port) =>
                              port.status ===
                              "connected"
                          ).length
                        }{" "}
                        podłączonych
                      </span>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </section>
      </div>
    </>
  );
}

export default SummaryStep;