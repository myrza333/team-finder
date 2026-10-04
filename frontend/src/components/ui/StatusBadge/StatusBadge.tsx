"use client";
import { useI18n } from "@/i18n/client";
import scss from "./StatusBadge.module.scss";

export type Status = "pending" | "accepted" | "rejected" | "recruiting" | "closed" | "owner" | "open" | "announced";

// Цветной бейдж статуса: заявки, проекты, роль в команде
const StatusBadge = ({ status }: { status: Status }) => {
  const { t } = useI18n();
  return <span className={`${scss.badge} ${scss[status]}`}>{t.status[status]}</span>;
};

export default StatusBadge;
