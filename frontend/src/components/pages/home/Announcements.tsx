import AnnouncementCard from "@/components/cards/AnnouncementCard/AnnouncementCard";
import SectionHeader from "@/components/ui/SectionHeader/SectionHeader";
import type { Announcement } from "@/types";
import scss from "./Announcements.module.scss";

// Главная: 3 ближайших запуска. Все — на странице /announcements
const Announcements = ({ items }: { items: Announcement[] }) => (
  <section className={scss.section}>
    <SectionHeader
      title="Project announcements"
      subtitle="Projects launching soon. Team and stack are revealed on launch day."
      link={{ label: "View all →", href: "/announcements" }}
    />
    <div className={scss.grid}>
      {items.map((a) => (
        <AnnouncementCard key={a.id} announcement={a} />
      ))}
    </div>
  </section>
);

export default Announcements;
