"use client";
import { useState } from "react";
import Link from "next/link";
import Avatar from "@/components/ui/Avatar/Avatar";
import ProjectIcon from "@/components/ui/ProjectIcon/ProjectIcon";
import SearchInput from "@/components/ui/SearchInput/SearchInput";
import { clockTime, dayLabel } from "@/lib/format";
import type { ChatMessage, ChatSummary, DirectChat } from "@/types";
import scss from "./Chat.module.scss";

type ChatListProps = {
  teams: ChatSummary[];
  directs: DirectChat[];
  loading: boolean;
  activeHref: string | null; // "/chat/<projectId>" или "/chat/d/<chatId>"
  currentUserId: string;
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

type ItemProps = {
  href: string;
  active: boolean;
  icon: React.ReactNode;
  title: string;
  project?: string; // у личного чата — о каком проекте
  last: ChatMessage | null;
  unread: number;
  currentUserId: string;
};

const Item = ({ href, active, icon, title, project, last, unread, currentUserId }: ItemProps) => (
  <li>
    <Link
      href={href}
      className={`${scss.listItem} ${active ? scss.listItemActive : ""}`}
      aria-current={active ? "page" : undefined}
    >
      {icon}
      <div className={scss.listItemText}>
        <div className={scss.listItemTop}>
          <p className={scss.listItemTitle}>{title}</p>
          {last && <span className={scss.listItemTime}>{when(last)}</span>}
        </div>
        {project && <p className={scss.listItemProject}>{project}</p>}
        <div className={scss.listItemBottom}>
          <p className={`${scss.listItemPreview} ${unread ? scss.previewUnread : ""}`}>{preview(last, currentUserId)}</p>
          {unread > 0 && <span className={scss.unread}>{unread}</span>}
        </div>
      </div>
    </Link>
  </li>
);

// Левая колонка: чаты команд и личные чаты по поводу проектов
const ChatList = ({ teams, directs, loading, activeHref, currentUserId }: ChatListProps) => {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const has = (...texts: string[]) => !q || texts.some((t) => t.toLowerCase().includes(q));
  const visibleTeams = teams.filter((c) => has(c.project.title));
  const visibleDirects = directs.filter((c) => has(c.other.name, c.project.title));
  // Открытый чат не показывает счётчик непрочитанных
  const unread = (href: string, count: number) => (href === activeHref ? 0 : count);

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
        {visibleTeams.length > 0 && (
          <li>
            <p className={scss.listSection}>Teams</p>
          </li>
        )}
        {visibleTeams.map(({ project: p, lastMessage, unread: count }) => {
          const href = `/chat/${p.id}`;
          return (
            <Item
              key={href}
              href={href}
              active={href === activeHref}
              icon={
                <span className={scss.chatIcon}>
                  <ProjectIcon icon={p.icon} size={20} />
                </span>
              }
              title={p.title}
              last={lastMessage}
              unread={unread(href, count)}
              currentUserId={currentUserId}
            />
          );
        })}

        {visibleDirects.length > 0 && (
          <li>
            <p className={scss.listSection}>Direct messages</p>
          </li>
        )}
        {visibleDirects.map((c) => {
          const href = `/chat/d/${c.id}`;
          return (
            <Item
              key={href}
              href={href}
              active={href === activeHref}
              icon={<Avatar src={c.other.avatarUrl} alt={c.other.name} size={40} />}
              title={c.other.name}
              project={`About ${c.project.title}`}
              last={c.lastMessage}
              unread={unread(href, c.unread)}
              currentUserId={currentUserId}
            />
          );
        })}

        {loading && <li className={scss.listEmpty}>Loading…</li>}
        {!loading && visibleTeams.length + visibleDirects.length === 0 && (
          <li className={scss.listEmpty}>
            {teams.length + directs.length ? "No chats found" : "Join a project or message an owner to start chatting"}
          </li>
        )}
      </ul>
    </aside>
  );
};

export default ChatList;
