import Link from "next/link";
import Avatar from "@/components/ui/Avatar/Avatar";
import Button from "@/components/ui/Button/Button";
import Panel from "@/components/ui/Panel/Panel";
import Tag, { TagList } from "@/components/ui/Tag/Tag";
import { sentApplications } from "@/data/mock";
import type { Project } from "@/types";
import scss from "./ProjectDetailPage.module.scss";

// Главная кнопка зависит от того, кто смотрит: владелец, участник или гость/соискатель
const ProjectAction = ({ project, currentUserId }: { project: Project; currentUserId: string }) => {
  if (project.owner.id === currentUserId) {
    return (
      <Button href={`/my-projects/${project.id}`} size="lg">
        Manage project
      </Button>
    );
  }
  if (project.members.some((m) => m.id === currentUserId)) {
    return (
      <Button href={`/chat/${project.id}`} variant="outline" size="lg">
        Team chat
      </Button>
    );
  }
  // Уже подал заявку — повторно отправить нельзя
  const applied = sentApplications.some(
    (a) => a.applicant.id === currentUserId && a.project.id === project.id && a.status === "pending",
  );
  if (applied) {
    return (
      <Button variant="outline" size="lg" disabled>
        Application sent
      </Button>
    );
  }
  return <Button size="lg">Request to join</Button>;
};

const ProjectDetailPage = ({ project, currentUserId }: { project: Project; currentUserId: string }) => (
  <div className={scss.page}>
    <nav className={scss.breadcrumbs} aria-label="Breadcrumb">
      <Link href="/projects">Projects</Link>
      <span>/</span>
      <span className={scss.current}>{project.title}</span>
    </nav>

    <section className={scss.hero}>
      <div className={scss.heroIcon}>{project.icon}</div>
      <div className={scss.heroInfo}>
        <h1 className={scss.heroTitle}>{project.title}</h1>
        <p className={scss.heroDescription}>{project.description}</p>
        <div className={scss.createdBy}>
          <Avatar src={project.owner.avatarUrl} alt="" size={20} />
          <span>
            Created by <Link href={`/profile/${project.owner.id}`}>{project.owner.name}</Link>
          </span>
        </div>
      </div>
      <ProjectAction project={project} currentUserId={currentUserId} />
    </section>

    <div className={scss.grid}>
      <div className={scss.main}>
        <Panel title="About project">
          <p className={scss.text}>{project.fullDescription}</p>
        </Panel>

        <Panel title="Tech stack">
          <TagList>
            {project.stack.map((tech) => (
              <Tag key={tech} size="md">
                {tech}
              </Tag>
            ))}
          </TagList>
        </Panel>

        <Panel title="What we're looking for">
          <div className={scss.vacancies}>
            {project.vacancies.map((v) => (
              <div key={v.id} className={scss.vacancy}>
                <div className={scss.vacancyHead}>
                  <h3 className={scss.vacancyTitle}>{v.title}</h3>
                  <span className={scss.positions}>1 position</span>
                </div>
                <TagList>
                  {v.skills.map((skill) => (
                    <Tag key={skill} variant="primary">
                      {skill}
                    </Tag>
                  ))}
                </TagList>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <aside className={scss.side}>
        <Panel title="Project owner" size="sm">
          <div className={scss.person}>
            <Avatar src={project.owner.avatarUrl} alt={project.owner.name} size={40} />
            <div>
              <p className={scss.personName}>{project.owner.name}</p>
              <p className={scss.personTitle}>{project.owner.title}</p>
            </div>
          </div>
          <Button href={`/profile/${project.owner.id}`} variant="outline" fullWidth className={scss.ownerButton}>
            View profile
          </Button>
        </Panel>

        <Panel title="Team" size="sm">
          <ul className={scss.team}>
            {project.members.map((m) => (
              <li key={m.id}>
                <Link href={`/profile/${m.id}`} className={scss.person}>
                  <Avatar src={m.avatarUrl} alt={m.name} size={32} />
                  <div>
                    <p className={scss.personName}>{m.name}</p>
                    <p className={scss.personTitle}>{m.title}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      </aside>
    </div>
  </div>
);

export default ProjectDetailPage;
