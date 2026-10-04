"use client";
import { TriangleAlert, Users } from "lucide-react";
import { useState } from "react";
import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import Button from "@/components/ui/Button/Button";
import PageHeader from "@/components/ui/PageHeader/PageHeader";
import SearchInput from "@/components/ui/SearchInput/SearchInput";
import EmptyState from "@/components/ui/EmptyState/EmptyState";
import Chip, { ChipList } from "@/components/ui/Chip/Chip";
import PersonCard from "@/components/cards/PersonCard/PersonCard";
import { api } from "@/lib/api";
import { useDebounce } from "@/lib/useDebounce";
import { useI18n } from "@/i18n/client";
import scss from "./PeoplePage.module.scss";

// Фильтр — по направлениям из профиля (Settings → Profile → Stack)
const filters = {
  All: undefined,
  Frontend: "Frontend",
  Backend: "Backend",
  Designer: "UI/UX Design",
  Mobile: "Mobile",
  AI: "Machine Learning,Data Science",
  DevOps: "DevOps",
} as const;

type Filter = keyof typeof filters;

const PAGE_SIZE = 24;

// initialQuery приходит из ?q= (например, по "Show all" со страницы поиска)
const PeoplePage = ({ initialQuery = "" }: { initialQuery?: string }) => {
  const { t } = useI18n();
  const [search, setSearch] = useState(initialQuery);
  const [activeFilter, setActiveFilter] = useState<Filter>("All");

  const q = useDebounce(search.trim());
  const stack = filters[activeFilter];

  // По PAGE_SIZE человек; неполная страница — значит, больше никого нет
  const list = useInfiniteQuery({
    queryKey: ["users", { q, stack }],
    queryFn: ({ pageParam }) => api.users.list({ q, stack, limit: PAGE_SIZE, offset: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (last, pages) => (last.length === PAGE_SIZE ? pages.length * PAGE_SIZE : undefined),
    placeholderData: keepPreviousData,
  });
  const { isPending, isError } = list;
  const users = (list.data?.pages.flat() ?? []).filter((u, i, all) => all.findIndex((x) => x.id === u.id) === i);

  return (
    <div className={scss.page}>
      <PageHeader title={t.people.title} subtitle={t.people.subtitle} />

      <div className={scss.search}>
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t.people.searchPlaceholder}
          aria-label={t.people.searchLabel}
        />
      </div>

      <div className={scss.filters}>
        <ChipList>
          {(Object.keys(filters) as Filter[]).map((f) => (
            <Chip key={f} active={activeFilter === f} onClick={() => setActiveFilter(f)}>
              {t.people.filters[f]}
            </Chip>
          ))}
        </ChipList>
      </div>

      {isError ? (
        <EmptyState icon={TriangleAlert} text={t.people.loadError} />
      ) : isPending ? null : users.length > 0 ? (
        <>
          <div className={scss.grid}>
            {users.map((u) => (
              <PersonCard key={u.id} user={u} />
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
        <EmptyState icon={Users} text={t.people.empty} />
      )}
    </div>
  );
};

export default PeoplePage;
