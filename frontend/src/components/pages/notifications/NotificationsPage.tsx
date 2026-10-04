"use client";
import { Bell, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import PageHeader from "@/components/ui/PageHeader/PageHeader";
import Avatar from "@/components/ui/Avatar/Avatar";
import EmptyState from "@/components/ui/EmptyState/EmptyState";
import { api } from "@/lib/api";
import { timeAgo } from "@/lib/format";
import type { AppNotification } from "@/types";
import { useI18n } from "@/i18n/client";
import scss from "./NotificationsPage.module.scss";

// Новые уведомления приходят через WebSocket (lib/realtime.ts) — список обновится сам
const NotificationsPage = () => {
  const queryClient = useQueryClient();
  const { t, locale } = useI18n();
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
        title={t.notifications.title}
        action={
          <button className={scss.markAll} onClick={markAllRead} disabled={!hasUnread}>
            {t.notifications.markAll}
          </button>
        }
      />

      {isError ? (
        <EmptyState icon={TriangleAlert} text={t.notifications.loadError} />
      ) : isPending ? (
        <p className={scss.state}>{t.common.loading}</p>
      ) : items.length > 0 ? (
        <ul className={scss.list}>
          {items.map((n) => (
            <li key={n.id}>
              <Link
                href={n.href}
                onClick={() => markRead(n)}
                className={`${scss.item} ${n.read ? "" : scss.unread}`}
              >
                <Avatar src={n.actor.avatarUrl} alt={n.actor.id ? n.actor.name : t.common.deletedUser} size={40} />
                <div className={scss.body}>
                  <p className={scss.text}>
                    <span className={scss.actor}>{n.actor.id ? n.actor.name : t.common.deletedUser}</span>{" "}
                    {(n.type && n.projectTitle !== undefined && t.notifications.text[n.type]?.(n.projectTitle)) || n.text}
                  </p>
                  <p className={scss.time}>{timeAgo(n.createdAt, locale)}</p>
                </div>
                {!n.read && <span className={scss.dot} aria-label={t.notifications.unread} />}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState icon={Bell} text={t.notifications.empty} />
      )}
    </div>
  );
};

export default NotificationsPage;
