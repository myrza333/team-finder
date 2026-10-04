import { FolderPlus } from "lucide-react";
import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader/PageHeader";
import Button from "@/components/ui/Button/Button";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";
import Avatar, { AvatarStack } from "@/components/ui/Avatar/Avatar";
import SectionHeader from "@/components/ui/SectionHeader/SectionHeader";
import { serverApi } from "@/lib/api.server";
import type { Project } from "@/types";
import { getI18n } from "@/i18n/server";
import type { Dictionary } from "@/i18n/dictionaries";
import scss from "./MyProjectsPage.module.scss";
import ProjectIcon from "@/components/ui/ProjectIcon/ProjectIcon";

const openPositions = (p: Project) => p.vacancies.filter((v) => v.isOpen !== false).length;

// Карточка проекта в списке "моих": инфо слева, действия справа
type ProjectRowProps = { project: Project; owned: boolean; newApplications?: number; t: Dictionary };

const ProjectRow = ({ project: p, owned, newApplications = 0, t }: ProjectRowProps) => {
  return (
    <article className={scss.row}>
      <span className={scss.icon}><ProjectIcon icon={p.icon} size={22} /></span>

      <div className={scss.info}>
        <div className={scss.titleLine}>
          <Link href={owned ? `/my-projects/${p.id}` : `/projects/${p.id}`} className={scss.title}>
            {p.title}
          </Link>
          <StatusBadge status={p.announced ? "announced" : openPositions(p) > 0 ? "recruiting" : "closed"} />
        </div>
        <p className={scss.description}>{p.description}</p>
        <div className={scss.meta}>
          <span className={scss.members}>
            <AvatarStack>
              {p.members.slice(0, 3).map((m) => (
                <Avatar key={m.id} src={m.avatarUrl} alt={m.name} size={20} bordered />
              ))}
            </AvatarStack>
            {t.common.members(p.members.length)}
          </span>
          {owned && <span>{t.myProjects.openPositions(openPositions(p))}</span>}
          {!owned && <span>{t.myProjects.owner(p.owner.name)}</span>}
          {newApplications > 0 && (
            <Link href={`/my-projects/${p.id}`} className={scss.newApps}>
              {t.myProjects.newApplications(newApplications)}
            </Link>
          )}
        </div>
      </div>

      <div className={scss.actions}>
        <Button href={`/chat/${p.id}`} variant="outline" size="sm">
          {t.common.teamChat}
        </Button>
        {owned ? (
          <Button href={`/my-projects/${p.id}`} size="sm">
            {t.myProjects.manage}
          </Button>
        ) : (
          <Button href={`/projects/${p.id}`} variant="outline" size="sm">
            {t.myProjects.view}
          </Button>
        )}
      </div>
    </article>
  );
};

const MyProjectsPage = async ({ userId }: { userId: string }) => {
  const [owned, memberOf, pending] = await Promise.all([
    serverApi.projects.list({ owner: userId }),
    serverApi.projects.list({ member: userId }),
    serverApi.applications.pendingCounts(),
  ]);
  const joined = memberOf.filter((p) => p.owner.id !== userId);
  const { t } = await getI18n();

  return (
    <div className={scss.page}>
      <PageHeader
        title={t.myProjects.title}
        subtitle={t.myProjects.subtitle}
        action={<Button href="/projects/create">{t.common.addProject}</Button>}
      />

      <section className={scss.section}>
        <SectionHeader title={t.myProjects.created(owned.length)} />
        {owned.length > 0 ? (
          <div className={scss.list}>
            {owned.map((p) => (
              <ProjectRow key={p.id} project={p} owned newApplications={pending.byProject[p.id] ?? 0} t={t} />
            ))}
          </div>
        ) : (
          <div className={scss.empty}>
            <div className={scss.emptyIcon}>
              <FolderPlus size={26} strokeWidth={1.75} aria-hidden />
            </div>
            <p className={scss.emptyText}>{t.myProjects.emptyCreated}</p>
            <Button href="/projects/create" size="lg">
              {t.myProjects.createFirst}
            </Button>
          </div>
        )}
      </section>

      <section className={scss.section}>
        <SectionHeader
          title={t.myProjects.joined(joined.length)}
          link={{ label: t.myProjects.findProjects, href: "/projects" }}
        />
        {joined.length > 0 ? (
          <div className={scss.list}>
            {joined.map((p) => (
              <ProjectRow key={p.id} project={p} owned={false} t={t} />
            ))}
          </div>
        ) : (
          <p className={scss.emptyText}>{t.myProjects.emptyJoined}</p>
        )}
      </section>
    </div>
  );
};

export default MyProjectsPage;
