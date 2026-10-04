"use client";
import { SearchX, TriangleAlert } from "lucide-react";
import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import PageHeader from "@/components/ui/PageHeader/PageHeader";
import SearchInput from "@/components/ui/SearchInput/SearchInput";
import Button from "@/components/ui/Button/Button";
import EmptyState from "@/components/ui/EmptyState/EmptyState";
import ProjectCard from "@/components/cards/ProjectCard/ProjectCard";
import { projectCategories } from "@/data/options";
import { api } from "@/lib/api";
import { useDebounce } from "@/lib/useDebounce";
import { useI18n } from "@/i18n/client";
import type { Project, ProjectCategory } from "@/types";
import scss from "./ProjectsPage.module.scss";

const sorters = {
  positions: (p: Project) => p.vacancies.filter((v) => v.isOpen !== false).length,
  members: (p: Project) => p.members.length,
};

type Sort = "newest" | keyof typeof sorters;

const ProjectsPage = ({ initialQuery = "" }: { initialQuery?: string }) => {
  const { t } = useI18n();
  const [search, setSearch] = useState(initialQuery);
  const [category, setCategory] = useState<ProjectCategory | null>(null);
  const [sort, setSort] = useState<Sort>("newest");
  const q = useDebounce(search.trim());

  const { data = [], isPending, isError } = useQuery({
    queryKey: ["projects", { q, category }],
    queryFn: () => api.projects.list({ q, category }),
    placeholderData: keepPreviousData,
  });

  // Сервер отдаёт новые первыми, остальные варианты сортируем здесь
  const projects = sort === "newest" ? data : [...data].sort((a, b) => sorters[sort](b) - sorters[sort](a));

  return (
    <div className={scss.page}>
      <PageHeader
        title={t.projects.title}
        subtitle={t.projects.subtitle}
        action={<Button href="/projects/create">{t.common.addProject}</Button>}
      />

      <div className={scss.search}>
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t.projects.searchPlaceholder}
          aria-label={t.projects.searchLabel}
        />
      </div>

      <div className={scss.layout}>
        <aside className={scss.sidebar}>
          <p className={scss.sidebarTitle}>{t.projects.category}</p>
          <div className={scss.categories}>
            <button
              className={`${scss.category} ${!category ? scss.active : ""}`}
              onClick={() => setCategory(null)}
            >
              {t.projects.all}
            </button>
            {projectCategories.map((cat) => (
              <button
                key={cat}
                className={`${scss.category} ${category === cat ? scss.active : ""}`}
                onClick={() => setCategory(cat === category ? null : cat)}
              >
                {t.categories[cat]}
              </button>
            ))}
          </div>
        </aside>

        <div className={scss.content}>
          <div className={scss.toolbar}>
            <p className={scss.count}>{isPending ? t.common.loading : t.projects.found(projects.length)}</p>
            <select
              className={scss.sort}
              aria-label={t.projects.sortLabel}
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
            >
              <option value="newest">{t.projects.sortNewest}</option>
              <option value="positions">{t.projects.sortPositions}</option>
              <option value="members">{t.projects.sortMembers}</option>
            </select>
          </div>

          {isError ? (
            <EmptyState icon={TriangleAlert} text={t.projects.loadError} />
          ) : isPending ? null : projects.length > 0 ? (
            <div className={scss.grid}>
              {projects.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          ) : (
            <EmptyState icon={SearchX} text={t.projects.empty} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectsPage;
