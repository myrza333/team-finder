"use client";
import { SearchX, TriangleAlert } from "lucide-react";
import { useState } from "react";
import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import PageHeader from "@/components/ui/PageHeader/PageHeader";
import SearchInput from "@/components/ui/SearchInput/SearchInput";
import Button from "@/components/ui/Button/Button";
import EmptyState from "@/components/ui/EmptyState/EmptyState";
import ProjectCard from "@/components/cards/ProjectCard/ProjectCard";
import { projectCategories } from "@/data/options";
import { api, type ProjectSort } from "@/lib/api";
import { useDebounce } from "@/lib/useDebounce";
import { useI18n } from "@/i18n/client";
import type { ProjectCategory } from "@/types";
import scss from "./ProjectsPage.module.scss";

const PAGE_SIZE = 24;

const ProjectsPage = ({ initialQuery = "" }: { initialQuery?: string }) => {
  const { t } = useI18n();
  const [search, setSearch] = useState(initialQuery);
  const [category, setCategory] = useState<ProjectCategory | null>(null);
  const [sort, setSort] = useState<ProjectSort>("newest");
  const q = useDebounce(search.trim());

  // По PAGE_SIZE проектов; "Показать ещё" догружает следующую страницу. Сортирует сервер
  const list = useInfiniteQuery({
    queryKey: ["projects", { q, category, sort }],
    queryFn: ({ pageParam }) => api.projects.page({ q, category, sort, limit: PAGE_SIZE, offset: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (last, pages) => {
      const loaded = pages.reduce((n, page) => n + page.items.length, 0);
      return loaded < last.total ? loaded : undefined;
    },
    placeholderData: keepPreviousData,
  });
  const { isPending, isError } = list;
  // Пока листали, могли появиться новые проекты и сдвинуть страницы — повторы убираем
  const projects = (list.data?.pages.flatMap((page) => page.items) ?? []).filter(
    (p, i, all) => all.findIndex((x) => x.id === p.id) === i,
  );
  const total = list.data?.pages[0]?.total ?? 0;

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
            <p className={scss.count}>{isPending ? t.common.loading : t.projects.found(total)}</p>
            <select
              className={scss.sort}
              aria-label={t.projects.sortLabel}
              value={sort}
              onChange={(e) => setSort(e.target.value as ProjectSort)}
            >
              <option value="newest">{t.projects.sortNewest}</option>
              <option value="positions">{t.projects.sortPositions}</option>
              <option value="members">{t.projects.sortMembers}</option>
            </select>
          </div>

          {isError ? (
            <EmptyState icon={TriangleAlert} text={t.projects.loadError} />
          ) : isPending ? null : projects.length > 0 ? (
            <>
              <div className={scss.grid}>
                {projects.map((p) => (
                  <ProjectCard key={p.id} project={p} />
                ))}
              </div>
              {list.hasNextPage && (
                <div className={scss.more}>
                  <Button variant="outline" onClick={() => list.fetchNextPage()} disabled={list.isFetchingNextPage}>
                    {list.isFetchingNextPage ? t.common.loading : t.common.showMore}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <EmptyState icon={SearchX} text={t.projects.empty} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectsPage;
