import Link from "next/link";
import Button from "@/components/ui/Button/Button";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";
import type { Application } from "@/types";
import scss from "./ApplicationCard.module.scss";

type SentApplicationRowProps = {
  application: Application;
  onWithdraw: () => void;
};

// Моя заявка в чужой проект: проект, роль, дата, статус и действие по статусу
const SentApplicationRow = ({ application: a, onWithdraw }: SentApplicationRowProps) => (
  <article className={`${scss.card} ${scss.row}`}>
    <span className={scss.projectIcon}>{a.project.icon}</span>

    <div className={scss.rowInfo}>
      <Link href={`/projects/${a.project.id}`} className={scss.projectTitle}>
        {a.project.title}
      </Link>
      <p className={scss.meta}>
        {a.vacancy?.title ?? "Any role"} · Applied {a.createdAt}
      </p>
    </div>

    <div className={scss.rowActions}>
      <StatusBadge status={a.status} />
      {a.status === "pending" && (
        <Button size="sm" variant="outline" onClick={onWithdraw}>
          Withdraw
        </Button>
      )}
      {a.status === "accepted" && (
        <Button size="sm" variant="outline" href={`/chat/${a.project.id}`}>
          Team chat
        </Button>
      )}
    </div>
  </article>
);

export default SentApplicationRow;
