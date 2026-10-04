"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Avatar from "@/components/ui/Avatar/Avatar";
import Button from "@/components/ui/Button/Button";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";
import Tag, { TagList } from "@/components/ui/Tag/Tag";
import Toggle from "@/components/ui/Toggle/Toggle";
import ReceivedApplicationCard from "@/components/cards/ApplicationCard/ReceivedApplicationCard";
import { api } from "@/lib/api";
import { useI18n } from "@/i18n/client";
import { useApplicationActions } from "@/lib/useApplicationActions";
import type { Project } from "@/types";
import scss from "./ManageProjectPage.module.scss";
import ProjectIcon from "@/components/ui/ProjectIcon/ProjectIcon";

// Команда и позиции приходят с сервера (project), заявки — отдельным запросом.
// После изменений router.refresh() перечитывает project, а заявки обновляет useApplicationActions
const ManageProjectPage = ({ project }: { project: Project }) => {
  const router = useRouter();
  const { t } = useI18n();
  const applications = useQuery({
    queryKey: ["applications", "received", { projectId: project.id }],
    queryFn: () => api.applications.received({ projectId: project.id }),
  });
  const actions = useApplicationActions();

  // Переключатель позиции меняется сразу, а если сервер ответил ошибкой — возвращается обратно
  const [openOverrides, setOpenOverrides] = useState<Record<string, boolean>>({});
  const isOpen = (id: string) => openOverrides[id] ?? project.vacancies.find((v) => v.id === id)?.isOpen !== false;

  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const all = applications.data ?? [];
  const pending = all.filter((a) => a.status === "pending");
  const isRecruiting = project.status === "open" && project.vacancies.some((v) => isOpen(v.id));

  const applicantsFor = (vacancyId: string) => pending.filter((a) => a.vacancy?.id === vacancyId).length;

  const toggleVacancy = async (id: string, open: boolean) => {
    setError(null);
    setOpenOverrides((o) => ({ ...o, [id]: open }));
    try {
      await api.projects.setVacancyOpen(project.id, id, open);
      router.refresh();
    } catch (e) {
      setOpenOverrides((o) => ({ ...o, [id]: !open }));
      setError(e instanceof Error ? e.message : t.manage.positionError);
    }
  };

  const removeMember = async (userId: string) => {
    setError(null);
    setRemoving(userId);
    try {
      await api.projects.removeMember(project.id, userId);
      setConfirmRemove(null);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : t.manage.removeError);
    } finally {
      setRemoving(null);
    }
  };

  const shownError = error ?? actions.error;

  return (
    <div className={scss.page}>
      <nav className={scss.breadcrumbs} aria-label={t.common.breadcrumb}>
        <Link href="/my-projects">{t.myProjects.title}</Link>
        <span>/</span>
        <span className={scss.current}>{project.title}</span>
      </nav>

      <section className={scss.hero}>
        <span className={scss.icon}><ProjectIcon icon={project.icon} size={26} /></span>
        <div className={scss.heroInfo}>
          <div className={scss.titleLine}>
            <h1 className={scss.title}>{project.title}</h1>
            <StatusBadge status={project.announced ? "announced" : isRecruiting ? "recruiting" : "closed"} />
          </div>
          <p className={scss.description}>{project.description}</p>
        </div>
        <div className={scss.heroActions}>
          <Button href={`/projects/${project.id}`} variant="outline">
            {t.manage.viewPage}
          </Button>
          <Button href={`/projects/${project.id}/edit`} variant="outline">
            {t.manage.edit}
          </Button>
          <Button href={`/chat/${project.id}`}>{t.common.teamChat}</Button>
        </div>
      </section>

      {shownError && <p className={scss.error}>{shownError}</p>}

      <div className={scss.grid}>
        <div className={scss.main}>
          {/* ===== Заявки ===== */}
          <section>
            <div className={scss.blockHead}>
              <h2 className={scss.blockTitle}>
                {t.manage.applications} {pending.length > 0 && <span className={scss.counter}>{pending.length}</span>}
              </h2>
              <Link href="/applications" className={scss.blockLink}>
                {t.manage.allApplications}
              </Link>
            </div>
            {applications.isPending ? (
              <p className={scss.emptyBox}>{t.common.loading}</p>
            ) : all.length > 0 ? (
              <div className={scss.applications}>
                {/* Сначала ожидающие, потом уже рассмотренные */}
                {[...pending, ...all.filter((a) => a.status !== "pending")].map((a) => (
                  <ReceivedApplicationCard
                    key={a.id}
                    application={a}
                    showProject={false}
                    busy={actions.busyId === a.id}
                    onAccept={() => actions.decide(a.id, "accepted")}
                    onDecline={() => actions.decide(a.id, "rejected")}
                    onMessage={() => actions.message(a.id)}
                  />
                ))}
              </div>
            ) : (
              <p className={scss.emptyBox}>{t.manage.noApplications}</p>
            )}
          </section>

          {/* ===== Вакансии ===== */}
          <section className={scss.box}>
            <div className={scss.blockHead}>
              <h2 className={scss.blockTitle}>{t.manage.positions}</h2>
              <Link href={`/projects/${project.id}/edit`} className={scss.blockLink}>
                {t.manage.addPosition}
              </Link>
            </div>
            {project.vacancies.length > 0 ? (
              <ul className={scss.vacancies}>
                {project.vacancies.map((v) => {
                  const open = isOpen(v.id);
                  const applicants = applicantsFor(v.id);
                  return (
                    <li key={v.id} className={`${scss.vacancy} ${open ? "" : scss.vacancyClosed}`}>
                      <div className={scss.vacancyInfo}>
                        <p className={scss.vacancyTitle}>{v.title}</p>
                        <TagList>
                          {v.skills.map((s) => (
                            <Tag key={s} variant="primary">
                              {s}
                            </Tag>
                          ))}
                        </TagList>
                      </div>
                      <span className={scss.applicants}>{t.manage.applicants(applicants)}</span>
                      <label className={scss.vacancyToggle}>
                        <span>{open ? t.manage.open : t.manage.closed}</span>
                        <Toggle checked={open} onChange={(val) => toggleVacancy(v.id, val)} label={t.manage.toggleLabel(v.title)} />
                      </label>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className={scss.emptyBox}>{t.manage.noPositions}</p>
            )}
          </section>
        </div>

        {/* ===== Команда ===== */}
        <aside className={`${scss.box} ${scss.team}`}>
          <div className={scss.blockHead}>
            <h2 className={scss.blockTitle}>{t.manage.team(project.members.length)}</h2>
          </div>
          <ul className={scss.members}>
            {project.members.map((m) => {
              const isOwner = m.id === project.owner.id;
              return (
                <li key={m.id} className={scss.member}>
                  <Link href={`/profile/${m.id}`} className={scss.memberLink}>
                    <Avatar src={m.avatarUrl} alt={m.name} size={36} />
                    <div className={scss.memberText}>
                      <p className={scss.memberName}>{m.name}</p>
                      <p className={scss.memberTitle}>{m.title}</p>
                    </div>
                  </Link>
                  {isOwner ? (
                    <StatusBadge status="owner" />
                  ) : confirmRemove === m.id ? (
                    <div className={scss.confirm}>
                      <button className={scss.confirmYes} disabled={removing === m.id} onClick={() => removeMember(m.id)}>
                        {removing === m.id ? t.manage.removing : t.manage.remove}
                      </button>
                      <button className={scss.confirmNo} onClick={() => setConfirmRemove(null)}>
                        {t.common.cancel}
                      </button>
                    </div>
                  ) : (
                    <button
                      className={scss.remove}
                      onClick={() => setConfirmRemove(m.id)}
                      aria-label={t.manage.removeLabel(m.name)}
                    >
                      {t.manage.remove}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </aside>
      </div>
    </div>
  );
};

export default ManageProjectPage;
