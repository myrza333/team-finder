"use client";
import { useState } from "react";
import PageHeader from "@/components/ui/PageHeader/PageHeader";
import Tabs from "@/components/ui/Tabs/Tabs";
import Chip, { ChipList } from "@/components/ui/Chip/Chip";
import EmptyState from "@/components/ui/EmptyState/EmptyState";
import ReceivedApplicationCard from "@/components/cards/ApplicationCard/ReceivedApplicationCard";
import SentApplicationRow from "@/components/cards/ApplicationCard/SentApplicationRow";
import { receivedApplications, sentApplications } from "@/data/mock";
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

// Пока мок: изменения живут в состоянии страницы. Потом — PATCH /api/applications/:id
const ApplicationsPage = ({ initialTab }: { initialTab: ApplicationsTab }) => {
  const [tab, setTab] = useState<ApplicationsTab>(initialTab);
  const [filter, setFilter] = useState<Filter>("pending");
  const [received, setReceived] = useState(receivedApplications);
  const [sent, setSent] = useState(sentApplications);

  const setStatus = (id: string, status: ApplicationStatus) =>
    setReceived(received.map((a) => (a.id === id ? { ...a, status } : a)));

  const count = (f: Filter) => (f === "all" ? received.length : received.filter((a) => a.status === f).length);
  const visibleReceived = filter === "all" ? received : received.filter((a) => a.status === filter);

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

      {tab === "received" && (
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
                  onAccept={() => setStatus(a.id, "accepted")}
                  onDecline={() => setStatus(a.id, "rejected")}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon="📭"
              text={filter === "pending" ? "No new applications. You're all caught up!" : "Nothing here yet."}
            />
          )}
        </>
      )}

      {tab === "sent" && (
        <div className={scss.list}>
          {sent.length > 0 ? (
            sent.map((a) => (
              <SentApplicationRow
                key={a.id}
                application={a}
                onWithdraw={() => setSent(sent.filter((x) => x.id !== a.id))}
              />
            ))
          ) : (
            <EmptyState icon="🚀" text="You haven't applied to any projects yet." />
          )}
        </div>
      )}
    </div>
  );
};

export default ApplicationsPage;
