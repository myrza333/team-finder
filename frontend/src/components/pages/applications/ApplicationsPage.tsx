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
import scss from "./ApplicationsPage.module.scss";

export type ApplicationsTab = "received" | "sent";
type Filter = ApplicationStatus | "all";

const filters: { value: Filter; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Declined" },
  { value: "all", label: "All" },
];

const ApplicationsPage = ({ initialTab }: { initialTab: ApplicationsTab }) => {
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
      <EmptyState icon={TriangleAlert} text="Couldn't load applications. Try again later." />
    ) : q.isPending ? (
      <p className={scss.state}>Loading…</p>
    ) : null;

  return (
    <div className={scss.page}>
      <PageHeader title="Applications" subtitle="People who want to join your projects, and projects you applied to." />

      <Tabs
        tabs={[
          { value: "received", label: "Received", count: count("pending") },
          { value: "sent", label: "Sent" },
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
                    {f.label} · {count(f.value)}
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
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Inbox}
                text={filter === "pending" ? "No new applications. You're all caught up!" : "Nothing here yet."}
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
              <EmptyState icon={Rocket} text="You haven't applied to any projects yet." />
            )}
          </div>
        ))}
    </div>
  );
};

export default ApplicationsPage;
