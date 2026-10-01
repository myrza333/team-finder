import { CalendarClock } from "lucide-react";
import AnnouncementCard from "@/components/cards/AnnouncementCard/AnnouncementCard";
import Button from "@/components/ui/Button/Button";
import EmptyState from "@/components/ui/EmptyState/EmptyState";
import PageHeader from "@/components/ui/PageHeader/PageHeader";
import { serverApi } from "@/lib/api.server";
import scss from "./AnnouncementsPage.module.scss";

// Все анонсы: проекты, которые скоро запустятся. Ближайший запуск — первым
const AnnouncementsPage = async () => {
  const announcements = await serverApi.announcements().catch(() => null);

  return (
    <div className={scss.page}>
      <PageHeader
        title="Announcements"
        subtitle="Projects launching soon. Press “Notify me” and you'll get a notification on launch day, when applications open."
        action={<Button href="/projects/create">+ Announce a project</Button>}
      />

      {announcements === null ? (
        <EmptyState icon={CalendarClock} text="Couldn't load announcements. Try again later." />
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
            text="No upcoming launches yet. Planning a project? Set a launch date when you create it and it will show up here."
          />
        </div>
      )}
    </div>
  );
};

export default AnnouncementsPage;
