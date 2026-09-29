"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { chatMessages, getMyChats, unreadCounts } from "@/data/chat";
import { currentUser } from "@/data/mock";
import type { ChatMessage } from "@/types";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";
import MembersPanel from "./MembersPanel";
import scss from "./Chat.module.scss";

const nowTime = () =>
  new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

// Весь мессенджер: список чатов | переписка | участники.
// Живёт в layout, поэтому при переключении чатов состояние (отправленные сообщения) сохраняется.
const Chat = () => {
  const params = useParams<{ id?: string }>();
  const activeId = params.id ?? null;

  const chats = getMyChats();
  const active = activeId ? (chats.find((c) => c.id === activeId) ?? null) : null;

  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(chatMessages);
  // Шторка участников (на узких экранах) открыта только для того чата, где её открыли
  const [membersOpenFor, setMembersOpenFor] = useState<string | null>(null);

  // Пока мок: сообщение добавляется локально. Потом — отправка через WebSocket
  const send = (text: string) => {
    if (!active) return;
    const message: ChatMessage = {
      id: `${active.id}-${Date.now()}`,
      author: currentUser,
      text,
      day: "Today",
      time: nowTime(),
    };
    setMessages({ ...messages, [active.id]: [...(messages[active.id] ?? []), message] });
  };

  // Открытый чат считается прочитанным
  const unread = (id: string) => (id === activeId ? 0 : (unreadCounts[id] ?? 0));

  return (
    <div className={`${scss.chat} ${activeId ? scss.hasActive : ""}`}>
      <ChatList chats={chats} activeId={activeId} messages={messages} unread={unread} />

      <section className={scss.windowArea}>
        {active ? (
          <ChatWindow
            key={active.id}
            project={active}
            messages={messages[active.id] ?? []}
            onSend={send}
            onOpenMembers={() => setMembersOpenFor(active.id)}
          />
        ) : (
          <div className={scss.placeholder}>
            <p className={scss.placeholderIcon}>💬</p>
            <p className={scss.placeholderTitle}>{activeId ? "Chat not found" : "Select a chat"}</p>
            <p className={scss.placeholderText}>
              {activeId
                ? "You're not a member of this team, or the project doesn't exist."
                : "Each project has its own team chat. Pick one from the list."}
            </p>
          </div>
        )}
      </section>

      {active && (
        <MembersPanel
          project={active}
          open={membersOpenFor === active.id}
          onClose={() => setMembersOpenFor(null)}
        />
      )}
    </div>
  );
};

export default Chat;
