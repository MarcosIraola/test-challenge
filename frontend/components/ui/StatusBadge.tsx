type Props = {
  reason: string;
};

export default function StatusBadge({ reason }: Props) {
  const isApproved = reason === "";
  return (
    <span
      className={`badge ${isApproved ? "badge-approved" : "badge-rejected"}`}
    >
      {isApproved ? "Approved" : "Rejected"}
    </span>
  );
}
