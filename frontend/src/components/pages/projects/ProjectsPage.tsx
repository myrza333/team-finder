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
import type { ProjectCategory } from "@/types";
import scss from "./ProjectsPage.module.scss";

const ProjectsPage = ({ initialQuery = "" }: { initialQuery?: string }) => {
  const [search, setSearch] = useState(initialQuery);
  const [category, setCategory] = useState<ProjectCategory | null>(null);
  const [sort, setSort] = useState("recommended");
  const q = useDebounce(search.trim());

  const { data = [], isPending, isError } = useQuery({
    queryKey: ["projects", { q, category }],
    queryFn: () => api.projects.list({ q, category }),
    placeholderData: keepPreviousData,
  });

  const projects = sort === "members" ? [...data].sort((a, b) => b.members.length - a.members.length) : data;

  return (
    <div className={scss.page}>
      <PageHeader
        title="Projects"
        subtitle="Find your next team."
        action={<Button href="/projects/create">+ Create project</Button>}
      />

      <div className={scss.search}>
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search projects..."
          aria-label="Search projects"
        />
      </div>

      <div className={scss.layout}>
        <aside className={scss.sidebar}>
          <p className={scss.sidebarTitle}>Category</p>
          <div className={scss.categories}>
            <button
              className={`${scss.category} ${!category ? scss.active : ""}`}
              onClick={() => setCategory(null)}
            >
              All
            </button>
            {projectCategories.map((cat) => (
              <button
                key={cat}
                className={`${scss.category} ${category === cat ? scss.active : ""}`}
                onClick={() => setCategory(cat === category ? null : cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </aside>

        <div className={scss.content}>
          <div className={scss.toolbar}>
            <p className={scss.count}>{isPending ? "Loading…" : `${projects.length} projects found`}</p>
            <select
              className={scss.sort}
              aria-label="Sort projects"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="recommended">Recommended</option>
              <option value="newest">Newest</option>
              <option value="members">Most members</option>
            </select>
          </div>

          {isError ? (
            <EmptyState icon={TriangleAlert} text="Couldn't load projects. Is the server running?" />
          ) : isPending ? null : projects.length > 0 ? (
            <div className={scss.grid}>
              {projects.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          ) : (
            <EmptyState icon={SearchX} text="No projects found. Try a different search." />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectsPage;
