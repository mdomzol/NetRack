type WizardStepProps = {
  number: string;
  label: string;
  active?: boolean;
  completed?: boolean;
  onClick?: () => void;
};

function WizardStep({
  number,
  label,
  active = false,
  completed = false,
  onClick,
}: WizardStepProps) {
  const className = [
    "wizard-step",
    active ? "active" : "",
    completed ? "completed" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type="button" className={className} onClick={onClick} disabled={!onClick}>
      <div className="wizard-step-number">
        {completed ? "✓" : number}
      </div>

      <span>{label}</span>
    </div>
  );
}

export default WizardStep;