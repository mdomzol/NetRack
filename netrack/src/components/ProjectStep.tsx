import { ProjectDraft } from "../types";

type ProjectStepProps = {
project: ProjectDraft;
updateField: (
field: keyof Pick<
ProjectDraft,
"name" | "location" | "description"
>,
value: string
) => void;
};

function ProjectStep({
project,
updateField,
}: ProjectStepProps) {
return (
<> <div className="wizard-card-header"> <div> <h2>Dane projektu</h2>

      <span>
        Podstawowe informacje o dokumentacji
      </span>
    </div>
  </div>

  <div className="form-grid">
    <div className="form-field full">
      <label htmlFor="project-name">
        Nazwa projektu
      </label>

      <input
        id="project-name"
        type="text"
        value={project.name}
        onChange={(event) =>
          updateField(
            "name",
            event.target.value
          )
        }
        placeholder="np. PRUiM – Serwerownia"
        autoFocus
      />
    </div>

    <div className="form-field">
      <label htmlFor="project-location">
        Lokalizacja
      </label>

      <input
        id="project-location"
        type="text"
        value={project.location}
        onChange={(event) =>
          updateField(
            "location",
            event.target.value
          )
        }
        placeholder="np. Gliwice"
      />
    </div>

    <div className="form-field">
      <label htmlFor="project-description">
        Opis
      </label>

      <input
        id="project-description"
        type="text"
        value={project.description}
        onChange={(event) =>
          updateField(
            "description",
            event.target.value
          )
        }
        placeholder="Krótki opis projektu"
      />
    </div>
  </div>
</>

);
}

export default ProjectStep;
