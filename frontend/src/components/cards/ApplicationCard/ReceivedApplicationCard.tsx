import Link from "next/link";
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
};

// Входящая заявка: кто, на какую роль, сообщение, навыки, Accept / Decline
const ReceivedApplicationCard = ({ application: a, showProject = true, busy, onAccept, onDecline }: ReceivedApplicationCardProps) => (
  <article className={scss.card}>
    <div className={scss.top}>
      <Link href={`/profile/${a.applicant.id}`} className={scss.person}>
        <Avatar src={a.applicant.avatarUrl} alt={a.applicant.name} size={44} />
        <div className={scss.personText}>
          <p className={scss.name}>{a.applicant.name}</p>
          <p className={scss.meta}>{a.applicant.title}</p>
        </div>
      </Link>
      <span className={scss.time}>{timeAgo(a.createdAt)}</span>
    </div>

    <p className={scss.appliedFor}>
      Applied for <strong>{a.vacancy?.title ?? "any role"}</strong>
      {showProject && (
        <>
          {" "}
          in <Link href={`/projects/${a.project.id}`}>{a.project.title}</Link>
        </>
      )}
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
            Accept
          </Button>
          <Button size="sm" variant="outline" onClick={onDecline} disabled={busy} className={scss.actionButton}>
            Decline
          </Button>
        </>
      ) : (
        <StatusBadge status={a.status} />
      )}
      <Link href={`/profile/${a.applicant.id}`} className={scss.textLink}>
        View profile
      </Link>
    </div>
  </article>
);

export default ReceivedApplicationCard;
