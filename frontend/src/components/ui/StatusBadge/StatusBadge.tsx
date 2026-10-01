import scss from "./StatusBadge.module.scss";

export type Status = "pending" | "accepted" | "rejected" | "recruiting" | "closed" | "owner" | "open" | "announced";

const labels: Record<Status, string> = {
  pending: "Pending",
  accepted: "Accepted",
  rejected: "Declined",
  recruiting: "Recruiting",
  closed: "Closed",
  owner: "Owner",
  open: "Open to projects",
  announced: "Announced",
};

// Цветной бейдж статуса: заявки, проекты, роль в команде
const StatusBadge = ({ status }: { status: Status }) => (
  <span className={`${scss.badge} ${scss[status]}`}>{labels[status]}</span>
);

export default StatusBadge;
