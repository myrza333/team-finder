import { Sparkles } from "lucide-react";
import Button from "@/components/ui/Button/Button";
import SectionHeader from "@/components/ui/SectionHeader/SectionHeader";
import ProjectCard from "@/components/cards/ProjectCard/ProjectCard";
import PersonCard from "@/components/cards/PersonCard/PersonCard";
import Announcements from "./Announcements";
import { serverApi as api } from "@/lib/api.server";
import { getI18n } from "@/i18n/server";
import scss from "./HomePage.module.scss";

const HomePage = async () => {
  const { t } = await getI18n();
  const [projects, users, announcements] = await Promise.all([
    api.projects.list({ limit: 3 }),
    api.users.list({ limit: 4 }),
    api.announcements(3).catch(() => []), // анонсы — не главное: если не загрузились, страница всё равно откроется
  ]);

  return (
    <>
      <section className={scss.hero}>
        <div className={scss.heroInner}>
          <div className={scss.badge}>
            <Sparkles size={14} strokeWidth={1.75} aria-hidden /> {t.home.badge}
          </div>
          <h1 className={scss.heroTitle}>{t.home.title}</h1>
          <p className={scss.heroText}>{t.home.text}</p>
          {/* Два главных сценария: найти проект или собрать команду. Поиск — в хедере */}
          <div className={scss.heroActions}>
            <Button href="/projects" variant="outline" size="lg" className={scss.heroButton}>
              {t.home.browse}
            </Button>
            <Button href="/projects/create" size="lg" className={scss.heroButton}>
              {t.common.createProject}
            </Button>
          </div>
        </div>
      </section>

      <section className={scss.section}>
        <SectionHeader
          title={t.home.projectsTitle}
          subtitle={t.home.projectsSubtitle}
          link={{ label: t.common.viewAll, href: "/projects" }}
        />
        <div className={scss.projectsGrid}>
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      </section>

      <section className={scss.section}>
        <SectionHeader
          title={t.home.peopleTitle}
          subtitle={t.home.peopleSubtitle}
          link={{ label: t.common.viewAll, href: "/people" }}
        />
        <div className={scss.peopleGrid}>
          {users.map((u) => (
            <PersonCard key={u.id} user={u} />
          ))}
        </div>
      </section>

      <section className={scss.ctaSection}>
        <div className={scss.cta}>
          <h2 className={scss.ctaTitle}>{t.home.ctaTitle}</h2>
          <p className={scss.ctaText}>{t.home.ctaText}</p>
          <Button href="/projects/create" size="lg" className={scss.ctaButton}>
            {t.common.createProject}
          </Button>
        </div>
      </section>

      {announcements.length > 0 && <Announcements items={announcements} />}
    </>
  );
};

export default HomePage;
