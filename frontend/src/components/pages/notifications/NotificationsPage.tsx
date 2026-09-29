"use client";
import { useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader/PageHeader";
import Avatar from "@/components/ui/Avatar/Avatar";
import EmptyState from "@/components/ui/EmptyState/EmptyState";
import { notifications as initialNotifications } from "@/data/mock";
import scss from "./NotificationsPage.module.scss";

const NotificationsPage = () => {
  const [items, setItems] = useState(initialNotifications);
  const hasUnread = items.some((n) => !n.read);

  const markAllRead = () => setItems(items.map((n) => ({ ...n, read: true })));
  const markRead = (id: string) => setItems(items.map((n) => (n.id === id ? { ...n, read: true } : n)));

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

      {items.length > 0 ? (
        <ul className={scss.list}>
          {items.map((n) => (
            <li key={n.id}>
              <Link
                href={n.href}
                onClick={() => markRead(n.id)}
                className={`${scss.item} ${n.read ? "" : scss.unread}`}
              >
                <Avatar src={n.actor.avatarUrl} alt={n.actor.name} size={40} />
                <div className={scss.body}>
                  <p className={scss.text}>
                    <span className={scss.actor}>{n.actor.name}</span> {n.text}
                  </p>
                  <p className={scss.time}>{n.time}</p>
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
