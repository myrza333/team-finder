"use client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import Avatar from "@/components/ui/Avatar/Avatar";
import Button from "@/components/ui/Button/Button";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";
import Tag, { TagList } from "@/components/ui/Tag/Tag";
import Toggle from "@/components/ui/Toggle/Toggle";
import ReceivedApplicationCard from "@/components/cards/ApplicationCard/ReceivedApplicationCard";
import { receivedApplications } from "@/data/mock";
import { api } from "@/lib/api";
import type { ApplicationStatus, Project } from "@/types";
import scss from "./ManageProjectPage.module.scss";

// Пока мок: всё меняется только в состоянии страницы
const ManageProjectPage = ({ project }: { project: Project }) => {
  const [applications, setApplications] = useState(
    receivedApplications.filter((a) => a.project.id === project.id),
  );
  const [team, setTeam] = useState(project.members);
  const [openVacancies, setOpenVacancies] = useState<string[]>(
    project.vacancies.filter((v) => v.isOpen !== false).map((v) => v.id),
  );

  const saveVacancies = useMutation({
    mutationFn: (openIds: string[]) =>
      api.projects.update(project.id, {
        vacancies: project.vacancies.map((v) => ({ title: v.title, skills: v.skills, isOpen: openIds.includes(v.id) })),
      }),
  });
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);

  const pending = applications.filter((a) => a.status === "pending");
  const isRecruiting = openVacancies.length > 0;

  const decide = (id: string, status: ApplicationStatus) => {
    const application = applications.find((a) => a.id === id);
    setApplications(applications.map((a) => (a.id === id ? { ...a, status } : a)));
    // Принятый кандидат сразу появляется в команде
    if (status === "accepted" && application && !team.some((m) => m.id === application.applicant.id)) {
      setTeam([...team, application.applicant]);
    }
  };

  const applicantsFor = (vacancyId: string) =>
    applications.filter((a) => a.vacancy?.id === vacancyId && a.status === "pending").length;

  const toggleVacancy = (id: string, open: boolean) => {
    const next = open ? [...openVacancies, id] : openVacancies.filter((v) => v !== id);
    setOpenVacancies(next);
    saveVacancies.mutate(next, { onError: () => setOpenVacancies(openVacancies) });
  };

  const removeMember = (id: string) => {
    setTeam(team.filter((m) => m.id !== id));
    setConfirmRemove(null);
  };

  return (
    <div className={scss.page}>
      <nav className={scss.breadcrumbs} aria-label="Breadcrumb">
        <Link href="/my-projects">My projects</Link>
        <span>/</span>
        <span className={scss.current}>{project.title}</span>
      </nav>

      <section className={scss.hero}>
        <span className={scss.icon}>{project.icon}</span>
        <div className={scss.heroInfo}>
          <div className={scss.titleLine}>
            <h1 className={scss.title}>{project.title}</h1>
            <StatusBadge status={isRecruiting ? "recruiting" : "closed"} />
          </div>
          <p className={scss.description}>{project.description}</p>
        </div>
        <div className={scss.heroActions}>
          <Button href={`/projects/${project.id}`} variant="outline">
            View page
          </Button>
          <Button href={`/projects/${project.id}/edit`} variant="outline">
            Edit
          </Button>
          <Button href={`/chat/${project.id}`}>Team chat</Button>
        </div>
      </section>

      <div className={scss.grid}>
        <div className={scss.main}>
          {/* ===== Заявки ===== */}
          <section>
            <div className={scss.blockHead}>
              <h2 className={scss.blockTitle}>
                Applications {pending.length > 0 && <span className={scss.counter}>{pending.length}</span>}
              </h2>
              <Link href="/applications" className={scss.blockLink}>
                All applications →
              </Link>
            </div>
            {applications.length > 0 ? (
              <div className={scss.applications}>
                {/* Сначала ожидающие, потом уже рассмотренные */}
                {[...pending, ...applications.filter((a) => a.status !== "pending")].map((a) => (
                  <ReceivedApplicationCard
                    key={a.id}
                    application={a}
                    showProject={false}
                    onAccept={() => decide(a.id, "accepted")}
                    onDecline={() => decide(a.id, "rejected")}
                  />
                ))}
              </div>
            ) : (
              <p className={scss.emptyBox}>No applications yet. Share your project to get the first ones!</p>
            )}
          </section>

          {/* ===== Вакансии ===== */}
          <section className={scss.box}>
            <div className={scss.blockHead}>
              <h2 className={scss.blockTitle}>Open positions</h2>
              <Link href={`/projects/${project.id}/edit`} className={scss.blockLink}>
                + Add position
              </Link>
            </div>
            <ul className={scss.vacancies}>
              {project.vacancies.map((v) => {
                const open = openVacancies.includes(v.id);
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
                    <span className={scss.applicants}>
                      {applicants} {applicants === 1 ? "applicant" : "applicants"}
                    </span>
                    <label className={scss.vacancyToggle}>
                      <span>{open ? "Open" : "Closed"}</span>
                      <Toggle checked={open} onChange={(val) => toggleVacancy(v.id, val)} label={`${v.title} open`} />
                    </label>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>

        {/* ===== Команда ===== */}
        <aside className={`${scss.box} ${scss.team}`}>
          <div className={scss.blockHead}>
            <h2 className={scss.blockTitle}>Team · {team.length}</h2>
          </div>
          <ul className={scss.members}>
            {team.map((m) => {
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
                      <button className={scss.confirmYes} onClick={() => removeMember(m.id)}>
                        Remove
                      </button>
                      <button className={scss.confirmNo} onClick={() => setConfirmRemove(null)}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      className={scss.remove}
                      onClick={() => setConfirmRemove(m.id)}
                      aria-label={`Remove ${m.name} from team`}
                    >
                      Remove
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
