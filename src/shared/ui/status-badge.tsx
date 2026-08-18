import { CheckCircle2, Circle, CircleX, Info, TriangleAlert } from "lucide-react";

type StatusBadgeProps = {
  children: React.ReactNode;
  tone?: "default" | "success" | "warning" | "danger" | "info";
};

export function StatusBadge({ children, tone = "default" }: StatusBadgeProps) {
  const Icon = {
    default: Circle,
    success: CheckCircle2,
    warning: TriangleAlert,
    danger: CircleX,
    info: Info,
  }[tone];

  return (
    <span className={`status-badge status-badge-${tone}`}>
      <Icon aria-hidden="true" size={13} strokeWidth={2.25} />
      {children}
    </span>
  );
}
