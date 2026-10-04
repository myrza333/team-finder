"use client";
import { Inbox, Rocket, TriangleAlert } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import PageHeader from "@/components/ui/PageHeader/PageHeader";
import Tabs from "@/components/ui/Tabs/Tabs";
import Chip, { ChipList } from "@/components/ui/Chip/Chip";
import EmptyState from "@/components/ui/EmptyState/EmptyState";
import ReceivedApplicationCard from "@/components/cards/ApplicationCard/ReceivedApplicationCard";
import SentApplicationRow from "@/components/cards/ApplicationCard/SentApplicationRow";
import { api } from "@/lib/api";
import { useApplicationActions } from "@/lib/useApplicationActions";
import type { ApplicationStatus } from "@/types";
import { useI18n } from "@/i18n/client";
import scss from "./ApplicationsPage.module.scss";

export type ApplicationsTab = "received" | "sent";
type Filter = ApplicationStatus | "all";

const filters = [
  { value: "pending", key: "pending" },
  { value: "accepted", key: "accepted" },
  { value: "rejected", key: "declined" },
  { value: "all", key: "all" },
] as const satisfies readonly { value: Filter; key: string }[];

const ApplicationsPage = ({ initialTab }: { initialTab: ApplicationsTab }) => {
  const { t } = useI18n();
  const [tab, setTab] = useState<ApplicationsTab>(initialTab);
  const [filter, setFilter] = useState<Filter>("pending");
  const received = useQuery({ queryKey: ["applications", "received"], queryFn: () => api.applications.received() });
  const sent = useQuery({ queryKey: ["applications", "sent"], queryFn: () => api.applications.sent() });
  const actions = useApplicationActions();

  const all = received.data ?? [];
  const count = (f: Filter) => (f === "all" ? all.length : all.filter((a) => a.status === f).length);
  const visibleReceived = filter === "all" ? all : all.filter((a) => a.status === filter);

  const loadingOrError = (q: { isPending: boolean; isError: boolean }) =>
    q.isError ? (
      <EmptyState icon={TriangleAlert} text={t.applications.loadError} />
    ) : q.isPending ? (
      <p className={scss.state}>{t.common.loading}</p>
    ) : null;

  return (
    <div className={scss.page}>
      <PageHeader title={t.applications.title} subtitle={t.applications.subtitle} />

      <Tabs
        tabs={[
          { value: "received", label: t.applications.received, count: count("pending") },
          { value: "sent", label: t.applications.sent },
        ]}
        value={tab}
        onChange={setTab}
      />

      {actions.error && <p className={scss.error}>{actions.error}</p>}

      {tab === "received" &&
        (loadingOrError(received) ?? (
          <>
            <div className={scss.filters}>
              <ChipList>
                {filters.map((f) => (
                  <Chip key={f.value} size="sm" active={filter === f.value} onClick={() => setFilter(f.value)}>
                    {t.applications[f.key]} · {count(f.value)}
                  </Chip>
                ))}
              </ChipList>
            </div>

            {visibleReceived.length > 0 ? (
              <div className={scss.grid}>
                {visibleReceived.map((a) => (
                  <ReceivedApplicationCard
                    key={a.id}
                    application={a}
                    busy={actions.busyId === a.id}
                    onAccept={() => actions.decide(a.id, "accepted")}
                    onDecline={() => actions.decide(a.id, "rejected")}
                    onMessage={() => actions.message(a.id)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Inbox}
                text={filter === "pending" ? t.applications.caughtUp : t.applications.nothing}
              />
            )}
          </>
        ))}

      {tab === "sent" &&
        (loadingOrError(sent) ?? (
          <div className={scss.list}>
            {sent.data && sent.data.length > 0 ? (
              sent.data.map((a) => (
                <SentApplicationRow
                  key={a.id}
                  application={a}
                  busy={actions.busyId === a.id}
                  onWithdraw={() => actions.withdraw(a.id)}
                />
              ))
            ) : (
              <EmptyState icon={Rocket} text={t.applications.noneSent} />
            )}
          </div>
        ))}
    </div>
  );
};

export default ApplicationsPage;
