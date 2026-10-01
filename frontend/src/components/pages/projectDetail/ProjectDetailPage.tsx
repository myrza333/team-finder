import { CalendarClock, Lock, Megaphone } from "lucide-react";
import Link from "next/link";
import Avatar from "@/components/ui/Avatar/Avatar";
import Button from "@/components/ui/Button/Button";
import Panel from "@/components/ui/Panel/Panel";
import ProjectIcon from "@/components/ui/ProjectIcon/ProjectIcon";
import Tag, { TagList } from "@/components/ui/Tag/Tag";
import { launchCountdown, launchDate } from "@/lib/format";
import type { Application, LaunchSubscription, Project } from "@/types";
import ProjectAction from "./ProjectAction";
import ProjectLinks from "./ProjectLinks";
import scss from "./ProjectDetailPage.module.scss";

type ProjectDetailPageProps = {
  project: Project;
  currentUserId: string;
  myApplication: Application | null;
  launch: LaunchSubscription | null; // "Notify me" — для чужого анонса
};

const ProjectDetailPage = ({ project, currentUserId, myApplication, launch }: ProjectDetailPageProps) => {
  const isOwner = project.owner.id === currentUserId;
  // Анонс (запуск впереди): чужим не показываем команду, стек и вакансии — их и нет в ответе API
  const announced = Boolean(project.announced && project.launchAt);
  const hidden = announced && !isOwner;

  return (
    <div className={scss.page}>
      <nav className={scss.breadcrumbs} aria-label="Breadcrumb">
        {announced ? <Link href="/announcements">Announcements</Link> : <Link href="/projects">Projects</Link>}
        <span>/</span>
        <span className={scss.current}>{project.title}</span>
      </nav>

      {announced && isOwner && (
        <p className={scss.announcedNote}>
          <Megaphone size={16} strokeWidth={1.75} aria-hidden />
          <span>
            This project is announced and launches on <strong>{launchDate(project.launchAt!)}</strong>. Until then
            others see only its name and short description, and applications are closed.
          </span>
        </p>
      )}

      <section className={scss.hero}>
        <div className={scss.heroIcon}>
          <ProjectIcon icon={project.icon} size={28} />
        </div>
        <div className={scss.heroInfo}>
          <h1 className={scss.heroTitle}>{project.title}</h1>
          <p className={scss.heroDescription}>{project.description}</p>
          {announced && (
            <p className={scss.launch}>
              <CalendarClock size={14} strokeWidth={1.75} aria-hidden />
              {launchCountdown(project.launchAt!)} · {launchDate(project.launchAt!)}
            </p>
          )}
          <div className={scss.createdBy}>
            <Avatar src={project.owner.avatarUrl} alt="" size={20} />
            <span>
              Created by <Link href={`/profile/${project.owner.id}`}>{project.owner.name}</Link>
            </span>
          </div>
          <ProjectLinks project={project} />
        </div>
        <ProjectAction project={project} currentUserId={currentUserId} myApplication={myApplication} launch={launch} />
      </section>

      <div className={scss.grid}>
        <div className={scss.main}>
          {hidden ? (
            <Panel title="Revealed on launch day">
              <div className={scss.classified}>
                <Lock size={20} strokeWidth={1.75} aria-hidden />
                <p>
                  The team, tech stack and open positions stay secret until{" "}
                  <strong>{launchDate(project.launchAt!)}</strong>. Press “Notify me” and you&apos;ll get a notification
                  the moment applications open. Questions before that? Message the owner.
                </p>
              </div>
            </Panel>
          ) : (
            <>
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
                        <span className={`${scss.positions} ${v.isOpen === false ? scss.filled : ""}`}>
                          {v.isOpen === false ? "Filled" : "1 position"}
                        </span>
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
            </>
          )}
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

          {!hidden && (
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
          )}
        </aside>
      </div>
    </div>
  );
};

export default ProjectDetailPage;
