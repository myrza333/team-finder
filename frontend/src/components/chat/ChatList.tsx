"use client";
import { useState } from "react";
import Link from "next/link";
import SearchInput from "@/components/ui/SearchInput/SearchInput";
import { clockTime, dayLabel } from "@/lib/format";
import type { ChatMessage, ChatSummary } from "@/types";
import scss from "./Chat.module.scss";
import ProjectIcon from "@/components/ui/ProjectIcon/ProjectIcon";

type ChatListProps = {
  chats: ChatSummary[];
  loading: boolean;
  activeId: string | null;
  currentUserId: string;
  unread: (id: string) => number;
};

// Превью последнего сообщения: "You: ...", "Aida: ..." или системное
const preview = (m: ChatMessage | null, currentUserId: string) => {
  if (!m) return "No messages yet";
  if (!m.author) return m.text;
  const name = m.author.id === currentUserId ? "You" : m.author.name.split(" ")[0];
  return `${name}: ${m.text}`;
};

// Сегодня — время, раньше — день ("Yesterday", "Sep 20")
const when = (m: ChatMessage) => (dayLabel(m.createdAt) === "Today" ? clockTime(m.createdAt) : dayLabel(m.createdAt));

// Левая колонка: все чаты команд пользователя
const ChatList = ({ chats, loading, activeId, currentUserId, unread }: ChatListProps) => {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const visible = chats.filter((c) => !q || c.project.title.toLowerCase().includes(q));

  return (
    <aside className={scss.list}>
      <div className={scss.listHead}>
        <h1 className={scss.listTitle}>Messages</h1>
        <SearchInput
          size="md"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search chats..."
          aria-label="Search chats"
        />
      </div>

      <ul className={scss.listItems}>
        {visible.map(({ project: c, lastMessage: last }) => {
          const count = unread(c.id);
          return (
            <li key={c.id}>
              <Link
                href={`/chat/${c.id}`}
                className={`${scss.listItem} ${c.id === activeId ? scss.listItemActive : ""}`}
                aria-current={c.id === activeId ? "page" : undefined}
              >
                <span className={scss.chatIcon}><ProjectIcon icon={c.icon} size={20} /></span>
                <div className={scss.listItemText}>
                  <div className={scss.listItemTop}>
                    <p className={scss.listItemTitle}>{c.title}</p>
                    {last && <span className={scss.listItemTime}>{when(last)}</span>}
                  </div>
                  <div className={scss.listItemBottom}>
                    <p className={`${scss.listItemPreview} ${count ? scss.previewUnread : ""}`}>
                      {preview(last, currentUserId)}
                    </p>
                    {count > 0 && <span className={scss.unread}>{count}</span>}
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
        {loading && <li className={scss.listEmpty}>Loading…</li>}
        {!loading && visible.length === 0 && (
          <li className={scss.listEmpty}>{chats.length ? "No chats found" : "Join or create a project to get a team chat"}</li>
        )}
      </ul>
    </aside>
  );
};

export default ChatList;
