import { ProjectDraft } from "../types";

type SummaryStepProps = {
  project: ProjectDraft;
  validationErrors: {
    message: string;
  }[];
};

function SummaryStep({ project, validationErrors }: SummaryStepProps) {
  const connectedPorts = project.patchPanels.reduce(
    (total, patchPanel) =>
      total +
      patchPanel.portList.filter((port) => port.status === "connected").length,
    0
  );

  const mountedDevices = project.devices.filter(
    (device) => device.positionU !== null
  ).length;

  const mountedPatchPanels = project.patchPanels.filter(
    (patchPanel) => patchPanel.positionU !== null
  ).length;

  const totalEquipment = project.devices.length + project.patchPanels.length + project.accessories.length;
  const totalMounted = mountedDevices + mountedPatchPanels;
  const isValid = validationErrors.length === 0;

  return (
    <div className="summary-page">
      <div className="summary-intro">
        <div>
          <span className="summary-eyebrow">FINAL CHECK</span>
          <h2>Podsumowanie projektu</h2>
          <p>Zweryfikuj najważniejsze informacje i wyposażenie przed utworzeniem dokumentacji.</p>
        </div>
        <div className={`summary-state-badge ${isValid ? "valid" : "invalid"}`}>
          <span>{isValid ? "✓" : "!"}</span>
          {isValid ? "GOTOWE DO UTWORZENIA" : "WYMAGA POPRAWY"}
        </div>
      </div>

      <div className="summary-overview">
        <div className="summary-project-card">
          <span className="summary-card-kicker">PROJEKT</span>
          <strong>{project.name || "Projekt bez nazwy"}</strong>
          <span>{project.location || "Lokalizacja nie podana"}</span>
          {project.description && <p>{project.description}</p>}
        </div>

        <div className="summary-stat">
          <span>RACK</span>
          <strong>{project.rack.heightU}U</strong>
          <small>{project.rack.name || "Bez nazwy"}</small>
        </div>

        <div className="summary-stat">
          <span>URZĄDZENIA</span>
          <strong>{project.devices.length}</strong>
          <small>{mountedDevices} zamontowanych</small>
        </div>

        <div className="summary-stat">
          <span>PATCHPANELE</span>
          <strong>{project.patchPanels.length}</strong>
          <small>{connectedPorts} aktywnych portów</small>
        </div>

        <div className="summary-stat">
          <span>MONTAŻ</span>
          <strong>{totalMounted}/{totalEquipment}</strong>
          <small>{totalEquipment ? "elementów w racku" : "brak wyposażenia"}</small>
        </div>
      </div>

      {!isValid && (
        <section className="summary-alert error">
          <div className="summary-alert-icon">!</div>
          <div>
            <strong>Przed utworzeniem projektu popraw {validationErrors.length === 1 ? "wskazany problem" : "wskazane problemy"}.</strong>
            <div className="summary-alert-list">
              {validationErrors.map((error, index) => (
                <div key={index}>{error.message}</div>
              ))}
            </div>
          </div>
        </section>
      )}

      {isValid && (
        <section className="summary-alert success">
          <div className="summary-alert-icon">✓</div>
          <div>
            <strong>Konfiguracja jest kompletna.</strong>
            <span>Projekt można teraz utworzyć i zapisać.</span>
          </div>
        </section>
      )}

      <div className="summary-columns">
        <div className="summary-column">
          <section className="summary-panel">
            <div className="summary-panel-header">
              <div>
                <span className="summary-panel-kicker">01 / PROJECT</span>
                <h3>Informacje projektu</h3>
              </div>
            </div>
            <div className="summary-details">
              <div><span>Nazwa</span><strong>{project.name || "—"}</strong></div>
              <div><span>Lokalizacja</span><strong>{project.location || "—"}</strong></div>
              <div className="wide"><span>Opis</span><strong>{project.description || "Brak opisu"}</strong></div>
            </div>
          </section>

          <section className="summary-panel">
            <div className="summary-panel-header">
              <div>
                <span className="summary-panel-kicker">02 / RACK</span>
                <h3>Parametry szafy</h3>
              </div>
              <span className="summary-panel-code">{project.rack.name || "SR-01"}</span>
            </div>
            <div className="summary-details">
              <div><span>Lokalizacja</span><strong>{project.rack.location || "—"}</strong></div>
              <div><span>Producent</span><strong>{project.rack.manufacturer || "—"}</strong></div>
              <div><span>Model</span><strong>{project.rack.model || "—"}</strong></div>
              <div><span>Wysokość</span><strong>{project.rack.heightU}U</strong></div>
              <div><span>Szerokość</span><strong>{project.rack.width}"</strong></div>
              <div><span>Głębokość</span><strong>{project.rack.depth} mm</strong></div>
            </div>
          </section>
        </div>

        <div className="summary-column">
          <section className="summary-panel summary-equipment-panel">
            <div className="summary-panel-header">
              <div>
                <span className="summary-panel-kicker">03 / EQUIPMENT</span>
                <h3>Wyposażenie racka</h3>
              </div>
              <span className="summary-panel-count">{totalEquipment}</span>
            </div>

            {totalEquipment === 0 ? (
              <div className="summary-empty-state">
                <strong>Brak wyposażenia</strong>
                <span>Dodaj urządzenia lub patchpanele w poprzednim kroku.</span>
              </div>
            ) : (
              <div className="summary-equipment-list">
                {project.devices.map((device) => (
                  <div className="summary-equipment-row" key={device.id}>
                    <div className="summary-equipment-index">SW</div>
                    <div className="summary-equipment-main">
                      <strong>{device.name}</strong>
                      <span>{device.manufacturer || "—"} · {device.model || "Model nie podany"}</span>
                    </div>
                    <div className="summary-equipment-meta">
                      <span>{device.ports}P</span>
                      <span>{device.heightU}U</span>
                      <span className={device.positionU !== null ? "mounted" : "unmounted"}>
                        {device.positionU !== null ? `U${device.positionU}` : "POZA RACKIEM"}
                      </span>
                    </div>
                  </div>
                ))}

                {project.accessories.map((item)=><div className="summary-equipment-row" key={item.id}><div className="summary-equipment-index accessory">RA</div><div className="summary-equipment-main"><strong>{item.name}</strong><span>{item.type==="organizer"?"Organizer kablowy":item.type==="spacer"?"Panel zaślepiający":"UPS"} · {item.manufacturer||"—"}{item.model?" · "+item.model:""}</span></div><div className="summary-equipment-meta"><span>{item.heightU}U</span><span className={item.positionU!==null?"mounted":"unmounted"}>{item.positionU!==null?`U${item.positionU}`:"POZA RACKIEM"}</span></div></div>)}

                {project.patchPanels.map((patchPanel) => {
                  const connected = patchPanel.portList.filter(
                    (port) => port.status === "connected"
                  ).length;

                  return (
                    <div className="summary-equipment-row" key={patchPanel.id}>
                      <div className="summary-equipment-index pp">PP</div>
                      <div className="summary-equipment-main">
                        <strong>{patchPanel.name}</strong>
                        <span>{patchPanel.manufacturer || "—"} · {patchPanel.model || "Model nie podany"}</span>
                      </div>
                      <div className="summary-equipment-meta">
                        <span>{patchPanel.ports}P</span>
                        <span>{patchPanel.heightU}U</span>
                        <span>{connected}/{patchPanel.ports} PRT.</span>
                        <span className={patchPanel.positionU !== null ? "mounted" : "unmounted"}>
                          {patchPanel.positionU !== null ? `U${patchPanel.positionU}` : "POZA RACKIEM"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default SummaryStep;
