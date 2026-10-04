import { CalendarClock, Lock, Megaphone } from "lucide-react";
import Link from "next/link";
import Avatar from "@/components/ui/Avatar/Avatar";
import Button from "@/components/ui/Button/Button";
import Panel from "@/components/ui/Panel/Panel";
import ProjectIcon from "@/components/ui/ProjectIcon/ProjectIcon";
import Tag, { TagList } from "@/components/ui/Tag/Tag";
import { launchCountdown, launchDate } from "@/lib/format";
import type { Application, LaunchSubscription, Project } from "@/types";
import { getI18n } from "@/i18n/server";
import { rich } from "@/i18n/rich";
import AskOwnerButton from "./AskOwnerButton";
import ProjectAction from "./ProjectAction";
import ProjectLinks from "./ProjectLinks";
import scss from "./ProjectDetailPage.module.scss";

type ProjectDetailPageProps = {
  project: Project;
  currentUserId: string;
  myApplication: Application | null;
  launch: LaunchSubscription | null; // "Notify me" — для чужого анонса
};

const ProjectDetailPage = async ({ project, currentUserId, myApplication, launch }: ProjectDetailPageProps) => {
  const { t, locale } = await getI18n();
  const isOwner = project.owner.id === currentUserId;
  // Анонс (запуск впереди): чужим не показываем команду, стек и вакансии — их и нет в ответе API
  const announced = Boolean(project.announced && project.launchAt);
  const hidden = announced && !isOwner;
  // Спросить владельца о свободной позиции может тот, кто ещё не в команде (у команды есть общий чат)
  const canAsk = !isOwner && !project.members.some((m) => m.id === currentUserId);

  return (
    <div className={scss.page}>
      <nav className={scss.breadcrumbs} aria-label={t.common.breadcrumb}>
        {announced ? (
          <Link href="/announcements">{t.header.announcements}</Link>
        ) : (
          <Link href="/projects">{t.header.projects}</Link>
        )}
        <span>/</span>
        <span className={scss.current}>{project.title}</span>
      </nav>

      {announced && isOwner && (
        <p className={scss.announcedNote}>
          <Megaphone size={16} strokeWidth={1.75} aria-hidden />
          <span>{rich(t.project.announcedNote, { date: <strong>{launchDate(project.launchAt!, locale)}</strong> })}</span>
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
              {launchCountdown(project.launchAt!, locale)} · {launchDate(project.launchAt!, locale)}
            </p>
          )}
          <div className={scss.createdBy}>
            <Avatar src={project.owner.avatarUrl} alt="" size={20} />
            <span>
              {rich(t.project.createdBy, {
                name: <Link href={`/profile/${project.owner.id}`}>{project.owner.name}</Link>,
              })}
            </span>
          </div>
          <ProjectLinks project={project} />
        </div>
        <ProjectAction project={project} currentUserId={currentUserId} myApplication={myApplication} launch={launch} />
      </section>

      <div className={scss.grid}>
        <div className={scss.main}>
          {hidden ? (
            <Panel title={t.project.revealed}>
              <div className={scss.classified}>
                <Lock size={20} strokeWidth={1.75} aria-hidden />
                <p>{rich(t.project.classified, { date: <strong>{launchDate(project.launchAt!, locale)}</strong> })}</p>
              </div>
            </Panel>
          ) : (
            <>
              <Panel title={t.project.about}>
                <p className={scss.text}>{project.fullDescription}</p>
              </Panel>

              <Panel title={t.project.stack}>
                <TagList>
                  {project.stack.map((tech) => (
                    <Tag key={tech} size="md">
                      {tech}
                    </Tag>
                  ))}
                </TagList>
              </Panel>

              <Panel title={t.project.lookingFor}>
                <div className={scss.vacancies}>
                  {project.vacancies.map((v) => {
                    const askable = canAsk && v.isOpen !== false;
                    return (
                      <div key={v.id} className={`${scss.vacancy} ${askable ? scss.vacancyAskable : ""}`}>
                        <div className={scss.vacancyHead}>
                          <h3 className={scss.vacancyTitle}>{v.title}</h3>
                          <span className={`${scss.positions} ${v.isOpen === false ? scss.filled : ""}`}>
                            {v.isOpen === false ? t.project.filled : t.project.onePosition}
                          </span>
                        </div>
                        <TagList>
                          {v.skills.map((skill) => (
                            <Tag key={skill} variant="primary">
                              {skill}
                            </Tag>
                          ))}
                        </TagList>
                        {askable && <AskOwnerButton projectId={project.id} vacancyId={v.id} vacancyTitle={v.title} />}
                      </div>
                    );
                  })}
                </div>
              </Panel>
            </>
          )}
        </div>

        <aside className={scss.side}>
          <Panel title={t.project.owner} size="sm">
            <div className={scss.person}>
              <Avatar src={project.owner.avatarUrl} alt={project.owner.name} size={40} />
              <div>
                <p className={scss.personName}>{project.owner.name}</p>
              </div>
            </div>
            <Button href={`/profile/${project.owner.id}`} variant="outline" fullWidth className={scss.ownerButton}>
              {t.common.viewProfile}
            </Button>
          </Panel>

          {!hidden && (
            <Panel title={t.project.team} size="sm">
              <ul className={scss.team}>
                {project.members.map((m) => (
                  <li key={m.id}>
                    <Link href={`/profile/${m.id}`} className={scss.person}>
                      <Avatar src={m.avatarUrl} alt={m.name} size={32} />
                      <div>
                        <p className={scss.personName}>{m.name}</p>
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
