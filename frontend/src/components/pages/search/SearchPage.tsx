import { Search, SearchX } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader/PageHeader";
import SectionHeader from "@/components/ui/SectionHeader/SectionHeader";
import EmptyState from "@/components/ui/EmptyState/EmptyState";
import ProjectCard from "@/components/cards/ProjectCard/ProjectCard";
import PersonCard from "@/components/cards/PersonCard/PersonCard";
import { serverApi as api } from "@/lib/api.server";
import { getI18n } from "@/i18n/server";
import scss from "./SearchPage.module.scss";

const PROJECTS_LIMIT = 6;
const PEOPLE_LIMIT = 5;

// Общий поиск из хедера: проекты и люди на одной странице
const SearchPage = async ({ query }: { query: string }) => {
  const q = query.trim();
  const { t } = await getI18n();

  if (!q) {
    return (
      <div className={scss.page}>
        <PageHeader title={t.search.title} subtitle={t.search.subtitle} />
        <EmptyState icon={Search} text={t.search.start} />
      </div>
    );
  }

  const [foundProjects, foundPeople] = await Promise.all([api.projects.list({ q }), api.users.list({ q })]);
  const total = foundProjects.length + foundPeople.length;
  const encoded = encodeURIComponent(q);

  return (
    <div className={scss.page}>
      <PageHeader
        title={t.search.results(q)}
        subtitle={t.search.total(total)}
      />

      {total === 0 ? (
        <EmptyState icon={SearchX} text={t.search.nothing} />
      ) : (
        <>
          {foundProjects.length > 0 && (
            <section className={scss.section}>
              <SectionHeader
                title={t.search.projects(foundProjects.length)}
                link={
                  foundProjects.length > PROJECTS_LIMIT
                    ? { label: t.search.showAll, href: `/projects?q=${encoded}` }
                    : undefined
                }
              />
              <div className={scss.projectsGrid}>
                {foundProjects.slice(0, PROJECTS_LIMIT).map((p) => (
                  <ProjectCard key={p.id} project={p} />
                ))}
              </div>
            </section>
          )}

          {foundPeople.length > 0 && (
            <section className={scss.section}>
              <SectionHeader
                title={t.search.people(foundPeople.length)}
                link={
                  foundPeople.length > PEOPLE_LIMIT
                    ? { label: t.search.showAll, href: `/people?q=${encoded}` }
                    : undefined
                }
              />
              <div className={scss.peopleGrid}>
                {foundPeople.slice(0, PEOPLE_LIMIT).map((u) => (
                  <PersonCard key={u.id} user={u} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default SearchPage;
