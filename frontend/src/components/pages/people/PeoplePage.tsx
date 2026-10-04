"use client";
import { TriangleAlert, Users } from "lucide-react";
import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import PageHeader from "@/components/ui/PageHeader/PageHeader";
import SearchInput from "@/components/ui/SearchInput/SearchInput";
import EmptyState from "@/components/ui/EmptyState/EmptyState";
import Chip, { ChipList } from "@/components/ui/Chip/Chip";
import PersonCard from "@/components/cards/PersonCard/PersonCard";
import { api } from "@/lib/api";
import { useDebounce } from "@/lib/useDebounce";
import { useI18n } from "@/i18n/client";
import scss from "./PeoplePage.module.scss";

const filters = ["All", "Frontend", "Backend", "Designer", "Mobile", "AI", "DevOps"] as const;

// initialQuery приходит из ?q= (например, по "Show all" со страницы поиска)
const PeoplePage = ({ initialQuery = "" }: { initialQuery?: string }) => {
  const { t } = useI18n();
  const [search, setSearch] = useState(initialQuery);
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]>("All");

  const q = useDebounce(search.trim());
  const role = activeFilter === "All" ? undefined : activeFilter;

  const { data: users = [], isPending, isError } = useQuery({
    queryKey: ["users", { q, role }],
    queryFn: () => api.users.list({ q, role }),
    placeholderData: keepPreviousData,
  });

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
          {filters.map((f) => (
            <Chip key={f} active={activeFilter === f} onClick={() => setActiveFilter(f)}>
              {t.people.filters[f]}
            </Chip>
          ))}
        </ChipList>
      </div>

      {isError ? (
        <EmptyState icon={TriangleAlert} text={t.people.loadError} />
      ) : isPending ? null : users.length > 0 ? (
        <div className={scss.grid}>
          {users.map((u) => (
            <PersonCard key={u.id} user={u} />
          ))}
        </div>
      ) : (
        <EmptyState icon={Users} text={t.people.empty} />
      )}
    </div>
  );
};

export default PeoplePage;
