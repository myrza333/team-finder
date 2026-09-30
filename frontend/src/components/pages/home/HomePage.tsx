import { Sparkles } from "lucide-react";
import Button from "@/components/ui/Button/Button";
import SectionHeader from "@/components/ui/SectionHeader/SectionHeader";
import ProjectCard from "@/components/cards/ProjectCard/ProjectCard";
import PersonCard from "@/components/cards/PersonCard/PersonCard";
import { serverApi as api } from "@/lib/api.server";
import scss from "./HomePage.module.scss";

const HomePage = async () => {
  const [projects, users] = await Promise.all([
    api.projects.list({ limit: 3 }),
    api.users.list({ limit: 4 }),
  ]);

  return (
    <>
      <section className={scss.hero}>
        <div className={scss.heroInner}>
          <div className={scss.badge}>
            <Sparkles size={14} strokeWidth={1.75} aria-hidden /> Your next great project starts here
          </div>
          <h1 className={scss.heroTitle}>Find your team</h1>
          <p className={scss.heroText}>Find developers, designers and creators for your next project.</p>
          {/* Два главных сценария: найти проект или собрать команду. Поиск — в хедере */}
          <div className={scss.heroActions}>
            <Button href="/projects" variant="outline" size="lg" className={scss.heroButton}>
              Browse projects
            </Button>
            <Button href="/projects/create" size="lg" className={scss.heroButton}>
              Create project
            </Button>
          </div>
        </div>
      </section>

      <section className={scss.section}>
        <SectionHeader
          title="Projects looking for teammates"
          subtitle="Join exciting projects and build something great together."
          link={{ label: "View all →", href: "/projects" }}
        />
        <div className={scss.projectsGrid}>
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      </section>

      <section className={scss.section}>
        <SectionHeader
          title="People looking for projects"
          subtitle="Talented people ready to join your team."
          link={{ label: "View all →", href: "/people" }}
        />
        <div className={scss.peopleGrid}>
          {users.map((u) => (
            <PersonCard key={u.id} user={u} />
          ))}
        </div>
      </section>

      <section className={scss.ctaSection}>
        <div className={scss.cta}>
          <h2 className={scss.ctaTitle}>Have an idea? Build your team.</h2>
          <p className={scss.ctaText}>
            Post your project and find the right people to bring your vision to life.
          </p>
          <Button href="/projects/create" size="lg" className={scss.ctaButton}>
            Create project
          </Button>
        </div>
      </section>
    </>
  );
};

export default HomePage;
