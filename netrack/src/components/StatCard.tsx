type StatCardProps = {
  label: string;
  value: string;
  icon: string;
};

function StatCard({
  label,
  value,
  icon,
}: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>

      <div>
        <div className="stat-value">
          {value}
        </div>

        <div className="stat-label">
          {label}
        </div>
      </div>
    </div>
  );
}

export default StatCard;