import { Check, X } from "lucide-react";

type Props = {
  reason: string;
  variant?: "default" | "icon";
};

export default function StatusBadge({ reason, variant = "default" }: Props) {
  const isApproved = reason === "";
  if (variant === "icon") {
    const label = isApproved ? "Approved" : "Rejected";
    return (
      <span
        className={`review-status-icon ${isApproved ? "is-approved" : "is-rejected"}`}
        aria-label={label}
        role="img"
      >
        {isApproved ? (
          <Check size={14} strokeWidth={2.5} aria-hidden="true" />
        ) : (
          <X size={14} strokeWidth={2.5} aria-hidden="true" />
        )}
      </span>
    );
  }
  return (
    <span
      className={`badge ${isApproved ? "badge-approved" : "badge-rejected"}`}
    >
      {isApproved ? "Approved" : "Rejected"}
    </span>
  );
}
