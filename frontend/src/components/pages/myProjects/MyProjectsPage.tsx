import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader/PageHeader";
import Button from "@/components/ui/Button/Button";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";
import Avatar, { AvatarStack } from "@/components/ui/Avatar/Avatar";
import SectionHeader from "@/components/ui/SectionHeader/SectionHeader";
import { pendingCount } from "@/data/mock";
import { serverApi } from "@/lib/api.server";
import type { Project } from "@/types";
import scss from "./MyProjectsPage.module.scss";

const openPositions = (p: Project) => p.vacancies.filter((v) => v.isOpen !== false).length;

// Карточка проекта в списке "моих": инфо слева, действия справа
const ProjectRow = ({ project: p, owned }: { project: Project; owned: boolean }) => {
  const newApplications = owned ? pendingCount(p.id) : 0;
  return (
    <article className={scss.row}>
      <span className={scss.icon}>{p.icon}</span>

      <div className={scss.info}>
        <div className={scss.titleLine}>
          <Link href={owned ? `/my-projects/${p.id}` : `/projects/${p.id}`} className={scss.title}>
            {p.title}
          </Link>
          <StatusBadge status={openPositions(p) > 0 ? "recruiting" : "closed"} />
        </div>
        <p className={scss.description}>{p.description}</p>
        <div className={scss.meta}>
          <span className={scss.members}>
            <AvatarStack>
              {p.members.slice(0, 3).map((m) => (
                <Avatar key={m.id} src={m.avatarUrl} alt={m.name} size={20} bordered />
              ))}
            </AvatarStack>
            {p.members.length} members
          </span>
          {owned && <span>{openPositions(p)} open positions</span>}
          {!owned && <span>Owner: {p.owner.name}</span>}
          {newApplications > 0 && (
            <Link href={`/my-projects/${p.id}`} className={scss.newApps}>
              {newApplications} new {newApplications === 1 ? "application" : "applications"}
            </Link>
          )}
        </div>
      </div>

      <div className={scss.actions}>
        <Button href={`/chat/${p.id}`} variant="outline" size="sm">
          Team chat
        </Button>
        {owned ? (
          <Button href={`/my-projects/${p.id}`} size="sm">
            Manage
          </Button>
        ) : (
          <Button href={`/projects/${p.id}`} variant="outline" size="sm">
            View
          </Button>
        )}
      </div>
    </article>
  );
};

const MyProjectsPage = async ({ userId }: { userId: string }) => {
  const [owned, memberOf] = await Promise.all([
    serverApi.projects.list({ owner: userId }),
    serverApi.projects.list({ member: userId }),
  ]);
  const joined = memberOf.filter((p) => p.owner.id !== userId);

  return (
    <div className={scss.page}>
      <PageHeader
        title="My projects"
        subtitle="Projects you created and teams you're part of."
        action={<Button href="/projects/create">+ Create project</Button>}
      />

      <section className={scss.section}>
        <SectionHeader title={`Created by me · ${owned.length}`} />
        {owned.length > 0 ? (
          <div className={scss.list}>
            {owned.map((p) => (
              <ProjectRow key={p.id} project={p} owned />
            ))}
          </div>
        ) : (
          <div className={scss.empty}>
            <p className={scss.emptyIcon}>🚀</p>
            <p className={scss.emptyText}>You haven&apos;t created any projects yet.</p>
            <Button href="/projects/create" size="lg">
              Create your first project
            </Button>
          </div>
        )}
      </section>

      <section className={scss.section}>
        <SectionHeader
          title={`Joined · ${joined.length}`}
          link={{ label: "Find projects →", href: "/projects" }}
        />
        {joined.length > 0 ? (
          <div className={scss.list}>
            {joined.map((p) => (
              <ProjectRow key={p.id} project={p} owned={false} />
            ))}
          </div>
        ) : (
          <p className={scss.emptyText}>You haven&apos;t joined any teams yet.</p>
        )}
      </section>
    </div>
  );
};

export default MyProjectsPage;
