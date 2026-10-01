import { CalendarClock, Lock } from "lucide-react";
import Link from "next/link";
import Avatar from "@/components/ui/Avatar/Avatar";
import NotifyMeButton from "@/components/ui/NotifyMeButton/NotifyMeButton";
import ProjectIcon from "@/components/ui/ProjectIcon/ProjectIcon";
import { launchCountdown, launchDate } from "@/lib/format";
import type { Announcement } from "@/types";
import scss from "./AnnouncementCard.module.scss";

// Строка "Team" / "Stack": вместо значений — серые полоски, как вымаранный текст
const Classified = ({ label, bars }: { label: string; bars: number[] }) => (
  <div className={scss.classified}>
    <span className={scss.classifiedLabel}>{label}</span>
    <span className={scss.redacted} aria-hidden>
      {bars.map((width, i) => (
        <span key={i} className={scss.bar} style={{ width }} />
      ))}
    </span>
    <span className={scss.secret}>
      <Lock size={12} strokeWidth={2} aria-hidden /> Classified
    </span>
  </div>
);

// Анонс проекта: название, пара слов о нём, автор и когда запуск. Команда и стек — секрет до запуска
const AnnouncementCard = ({ announcement: a }: { announcement: Announcement }) => (
  <article className={scss.card}>
    <div className={scss.top}>
      <span className={scss.icon}>
        <ProjectIcon icon={a.icon} size={22} />
      </span>
      <span className={scss.countdown}>
        <CalendarClock size={14} strokeWidth={1.75} aria-hidden />
        {launchCountdown(a.launchAt)}
      </span>
    </div>

    <h3 className={scss.title}>
      <Link href={`/projects/${a.id}`}>{a.title}</Link>
    </h3>
    <p className={scss.bio}>{a.description}</p>
    <p className={scss.owner}>
      <Avatar src={a.owner.avatarUrl} alt="" size={20} />
      by {a.owner.name} · {a.category}
    </p>

    <div className={scss.secrets}>
      <Classified label="Team" bars={[64, 88, 48]} />
      <Classified label="Stack" bars={[40, 72, 56]} />
    </div>

    <div className={scss.footer}>
      <span className={scss.date}>Launch · {launchDate(a.launchAt)}</span>
      <NotifyMeButton projectId={a.id} initial={{ subscribed: a.subscribed, subscribers: a.subscribers }} />
    </div>
  </article>
);

export default AnnouncementCard;
