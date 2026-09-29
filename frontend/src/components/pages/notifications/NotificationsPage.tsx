"use client";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import PageHeader from "@/components/ui/PageHeader/PageHeader";
import Avatar from "@/components/ui/Avatar/Avatar";
import EmptyState from "@/components/ui/EmptyState/EmptyState";
import { api } from "@/lib/api";
import { timeAgo } from "@/lib/format";
import type { AppNotification } from "@/types";
import scss from "./NotificationsPage.module.scss";

// Новые уведомления приходят через WebSocket (lib/realtime.ts) — список обновится сам
const NotificationsPage = () => {
  const queryClient = useQueryClient();
  const { data: items = [], isPending, isError } = useQuery({
    queryKey: ["notifications", "list"],
    queryFn: api.notifications.list,
  });
  const hasUnread = items.some((n) => !n.read);

  // Сразу показываем как прочитанные, запрос уходит в фоне; счётчик в шапке перечитается
  const markLocally = (read: (n: AppNotification) => boolean) => {
    queryClient.setQueryData<AppNotification[]>(["notifications", "list"], (old) =>
      old?.map((n) => (read(n) ? { ...n, read: true } : n)),
    );
  };
  const refreshCount = () => queryClient.invalidateQueries({ queryKey: ["notifications", "unread"] });

  const markAllRead = () => {
    markLocally(() => true);
    api.notifications.markAllRead().then(refreshCount);
  };
  const markRead = (n: AppNotification) => {
    if (n.read) return;
    markLocally((x) => x.id === n.id);
    api.notifications.markRead(n.id).then(refreshCount);
  };

  return (
    <div className={scss.page}>
      <PageHeader
        title="Notifications"
        action={
          <button className={scss.markAll} onClick={markAllRead} disabled={!hasUnread}>
            Mark all as read
          </button>
        }
      />

      {isError ? (
        <EmptyState icon="⚠️" text="Couldn't load notifications. Try again later." />
      ) : isPending ? (
        <p className={scss.state}>Loading…</p>
      ) : items.length > 0 ? (
        <ul className={scss.list}>
          {items.map((n) => (
            <li key={n.id}>
              <Link
                href={n.href}
                onClick={() => markRead(n)}
                className={`${scss.item} ${n.read ? "" : scss.unread}`}
              >
                <Avatar src={n.actor.avatarUrl} alt={n.actor.name} size={40} />
                <div className={scss.body}>
                  <p className={scss.text}>
                    <span className={scss.actor}>{n.actor.name}</span> {n.text}
                  </p>
                  <p className={scss.time}>{timeAgo(n.createdAt)}</p>
                </div>
                {!n.read && <span className={scss.dot} aria-label="Unread" />}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState icon="🔔" text="No notifications yet." />
      )}
    </div>
  );
};

export default NotificationsPage;
