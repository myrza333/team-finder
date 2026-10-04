import { CalendarClock } from "lucide-react";
import AnnouncementCard from "@/components/cards/AnnouncementCard/AnnouncementCard";
import Button from "@/components/ui/Button/Button";
import EmptyState from "@/components/ui/EmptyState/EmptyState";
import PageHeader from "@/components/ui/PageHeader/PageHeader";
import { serverApi } from "@/lib/api.server";
import { getI18n } from "@/i18n/server";
import scss from "./AnnouncementsPage.module.scss";

// Все анонсы: проекты, которые скоро запустятся. Ближайший запуск — первым
const AnnouncementsPage = async () => {
  const announcements = await serverApi.announcements().catch(() => null);
  const { t } = await getI18n();

  return (
    <div className={scss.page}>
      <PageHeader
        title={t.announcements.title}
        subtitle={t.announcements.subtitle}
        action={<Button href="/projects/create">{t.announcements.announce}</Button>}
      />

      {announcements === null ? (
        <EmptyState icon={CalendarClock} text={t.announcements.loadError} />
      ) : announcements.length > 0 ? (
        <div className={scss.grid}>
          {announcements.map((a) => (
            <AnnouncementCard key={a.id} announcement={a} />
          ))}
        </div>
      ) : (
        <div className={scss.empty}>
          <EmptyState
            icon={CalendarClock}
            text={t.announcements.empty}
          />
        </div>
      )}
    </div>
  );
};

export default AnnouncementsPage;
