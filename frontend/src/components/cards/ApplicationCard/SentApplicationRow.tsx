"use client";
import Link from "next/link";
import { useI18n } from "@/i18n/client";
import Button from "@/components/ui/Button/Button";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";
import { timeAgo } from "@/lib/format";
import type { Application } from "@/types";
import scss from "./ApplicationCard.module.scss";
import ProjectIcon from "@/components/ui/ProjectIcon/ProjectIcon";

type SentApplicationRowProps = {
  application: Application;
  busy?: boolean;
  onWithdraw: () => void;
};

// Моя заявка в чужой проект: проект, роль, дата, статус и действие по статусу
const SentApplicationRow = ({ application: a, busy, onWithdraw }: SentApplicationRowProps) => {
  const { t, locale } = useI18n();
  return (
    <article className={`${scss.card} ${scss.row}`}>
      <span className={scss.projectIcon}><ProjectIcon icon={a.project.icon} size={20} /></span>

      <div className={scss.rowInfo}>
        <Link href={`/projects/${a.project.id}`} className={scss.projectTitle}>
          {a.project.title}
        </Link>
        <p className={scss.meta}>
          {t.applications.sentMeta(a.vacancy?.title ?? t.applications.anyRoleCap, timeAgo(a.createdAt, locale))}
        </p>
      </div>

      <div className={scss.rowActions}>
        <StatusBadge status={a.status} />
        {a.status === "pending" && (
          <Button size="sm" variant="outline" onClick={onWithdraw} disabled={busy}>
            {busy ? t.project.withdrawing : t.project.withdraw}
          </Button>
        )}
        {a.status === "accepted" && (
          <Button size="sm" variant="outline" href={`/chat/${a.project.id}`}>
            {t.common.teamChat}
          </Button>
        )}
      </div>
    </article>
  );
};

export default SentApplicationRow;
