import AnnouncementCard from "@/components/cards/AnnouncementCard/AnnouncementCard";
import SectionHeader from "@/components/ui/SectionHeader/SectionHeader";
import type { Announcement } from "@/types";
import { getI18n } from "@/i18n/server";
import scss from "./Announcements.module.scss";

// Главная: 3 ближайших запуска. Все — на странице /announcements
const Announcements = async ({ items }: { items: Announcement[] }) => {
  const { t } = await getI18n();
  return (
    <section className={scss.section}>
      <SectionHeader
        title={t.home.announcementsTitle}
        subtitle={t.home.announcementsSubtitle}
        link={{ label: t.common.viewAll, href: "/announcements" }}
      />
      <div className={scss.grid}>
        {items.map((a) => (
          <AnnouncementCard key={a.id} announcement={a} />
        ))}
      </div>
    </section>
  );
};

export default Announcements;
