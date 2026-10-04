"use client";
import Link from "next/link";
import { useI18n } from "@/i18n/client";
import { rich } from "@/i18n/rich";
import Avatar from "@/components/ui/Avatar/Avatar";
import Button from "@/components/ui/Button/Button";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";
import Tag, { TagList } from "@/components/ui/Tag/Tag";
import { timeAgo } from "@/lib/format";
import type { Application } from "@/types";
import scss from "./ApplicationCard.module.scss";

type ReceivedApplicationCardProps = {
  application: Application;
  showProject?: boolean; // на странице конкретного проекта название проекта не нужно
  busy?: boolean; // решение уже отправляется
  onAccept: () => void;
  onDecline: () => void;
  onMessage: () => void; // личный чат с кандидатом — обсудить до решения
};

// Входящая заявка: кто, на какую роль, сообщение, навыки, Accept / Decline / Message
const ReceivedApplicationCard = ({
  application: a,
  showProject = true,
  busy,
  onAccept,
  onDecline,
  onMessage,
}: ReceivedApplicationCardProps) => {
  const { t, locale } = useI18n();
  const role = <strong>{a.vacancy?.title ?? t.applications.anyRole}</strong>;
  return (
    <article className={scss.card}>
      <div className={scss.top}>
        <Link href={`/profile/${a.applicant.id}`} className={scss.person}>
          <Avatar src={a.applicant.avatarUrl} alt={a.applicant.name} size={44} />
          <div className={scss.personText}>
            <p className={scss.name}>{a.applicant.name}</p>
          </div>
        </Link>
        <span className={scss.time}>{timeAgo(a.createdAt, locale)}</span>
      </div>

      <p className={scss.appliedFor}>
        {showProject
          ? rich(t.applications.appliedFor, {
              role,
              project: <Link href={`/projects/${a.project.id}`}>{a.project.title}</Link>,
            })
          : rich(t.applications.appliedForRole, { role })}
      </p>

      {a.message && <p className={scss.message}>{a.message}</p>}

      <TagList>
        {a.applicant.skills.slice(0, 4).map((s) => (
          <Tag key={s}>{s}</Tag>
        ))}
      </TagList>

      <div className={scss.actions}>
        {a.status === "pending" ? (
          <>
            <Button size="sm" onClick={onAccept} disabled={busy} className={scss.actionButton}>
              {t.applications.accept}
            </Button>
            <Button size="sm" variant="outline" onClick={onDecline} disabled={busy} className={scss.actionButton}>
              {t.applications.decline}
            </Button>
          </>
        ) : (
          <StatusBadge status={a.status} />
        )}
        <button type="button" onClick={onMessage} disabled={busy} className={scss.textLink}>
          {t.applications.message}
        </button>
        <Link href={`/profile/${a.applicant.id}`} className={scss.textLink}>
          {t.common.viewProfile}
        </Link>
      </div>
    </article>
  );
};

export default ReceivedApplicationCard;
