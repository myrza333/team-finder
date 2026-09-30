import { CalendarClock, Lock } from "lucide-react";
import ProjectIcon from "@/components/ui/ProjectIcon/ProjectIcon";
import SectionHeader from "@/components/ui/SectionHeader/SectionHeader";
import { plural } from "@/lib/format";
import type { Announcement } from "@/types";
import scss from "./Announcements.module.scss";

const DAY = 24 * 60 * 60 * 1000;

// "2026-10-14" → "Starts in 14 days" / "Starts tomorrow" / "Starts today"
const countdown = (startsAt: string) => {
  const today = new Date();
  const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const [y, m, d] = startsAt.split("-").map(Number);
  const days = Math.round((Date.UTC(y, m - 1, d) - todayUtc) / DAY);
  if (days <= 0) return "Starts today";
  if (days === 1) return "Starts tomorrow";
  return `Starts in ${plural(days, "day")}`;
};

const startDate = (startsAt: string) =>
  new Date(`${startsAt}T00:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric" });

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

// Анонсы будущих проектов: только название, пара слов о проекте и когда старт. Команда и стек — секрет до запуска
const Announcements = ({ items }: { items: Announcement[] }) => (
  <section className={scss.section}>
    <SectionHeader
      title="Project announcements"
      subtitle="New projects are about to launch. Team and stack are revealed on launch day."
    />
    <div className={scss.grid}>
      {items.map((a) => (
        <article key={a.id} className={scss.card}>
          <div className={scss.top}>
            <span className={scss.icon}>
              <ProjectIcon icon={a.icon} size={22} />
            </span>
            <span className={scss.countdown}>
              <CalendarClock size={14} strokeWidth={1.75} aria-hidden />
              {countdown(a.startsAt)}
            </span>
          </div>

          <h3 className={scss.title}>{a.title}</h3>
          <p className={scss.bio}>{a.bio}</p>

          <div className={scss.secrets}>
            <Classified label="Team" bars={[64, 88, 48]} />
            <Classified label="Stack" bars={[40, 72, 56]} />
          </div>

          <p className={scss.date}>Launch · {startDate(a.startsAt)}</p>
        </article>
      ))}
    </div>
  </section>
);

export default Announcements;
