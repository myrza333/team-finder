"use client";
import { useState } from "react";
import Link from "next/link";
import SearchInput from "@/components/ui/SearchInput/SearchInput";
import { currentUser } from "@/data/mock";
import type { ChatMessage, Project } from "@/types";
import scss from "./Chat.module.scss";

type ChatListProps = {
  chats: Project[];
  activeId: string | null;
  messages: Record<string, ChatMessage[]>;
  unread: (id: string) => number;
};

// Превью последнего сообщения: "You: ...", "Aida: ..." или системное
const preview = (m?: ChatMessage) => {
  if (!m) return "No messages yet";
  if (!m.author) return m.text;
  const name = m.author.id === currentUser.id ? "You" : m.author.name.split(" ")[0];
  return `${name}: ${m.text}`;
};

// Левая колонка: все чаты команд пользователя
const ChatList = ({ chats, activeId, messages, unread }: ChatListProps) => {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const visible = chats.filter((c) => !q || c.title.toLowerCase().includes(q));

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
        {visible.map((c) => {
          const last = messages[c.id]?.at(-1);
          const count = unread(c.id);
          return (
            <li key={c.id}>
              <Link
                href={`/chat/${c.id}`}
                className={`${scss.listItem} ${c.id === activeId ? scss.listItemActive : ""}`}
                aria-current={c.id === activeId ? "page" : undefined}
              >
                <span className={scss.chatIcon}>{c.icon}</span>
                <div className={scss.listItemText}>
                  <div className={scss.listItemTop}>
                    <p className={scss.listItemTitle}>{c.title}</p>
                    {last && <span className={scss.listItemTime}>{last.day === "Today" ? last.time : last.day}</span>}
                  </div>
                  <div className={scss.listItemBottom}>
                    <p className={`${scss.listItemPreview} ${count ? scss.previewUnread : ""}`}>{preview(last)}</p>
                    {count > 0 && <span className={scss.unread}>{count}</span>}
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
        {visible.length === 0 && <li className={scss.listEmpty}>No chats found</li>}
      </ul>
    </aside>
  );
};

export default ChatList;
