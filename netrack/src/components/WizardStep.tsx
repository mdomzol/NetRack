type WizardStepProps = {
  number: string;
  label: string;
  active?: boolean;
  completed?: boolean;
};

function WizardStep({
  number,
  label,
  active = false,
  completed = false,
}: WizardStepProps) {
  const className = [
    "wizard-step",
    active ? "active" : "",
    completed ? "completed" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={className}>
      <div className="wizard-step-number">
        {completed ? "✓" : number}
      </div>

      <span>{label}</span>
    </div>
  );
}

export default WizardStep;