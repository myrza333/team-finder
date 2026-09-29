"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/auth/useAuth";
import { api } from "@/lib/api";
import type { ChatMessage } from "@/types";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";
import MembersPanel from "./MembersPanel";
import scss from "./Chat.module.scss";

// Весь мессенджер: список чатов | переписка | участники. Живёт в layout, при переключении чатов не пересоздаётся.
// Новые сообщения приходят через WebSocket (lib/realtime.ts) и сами дописываются в кэш ["chat", id]
const Chat = () => {
  const params = useParams<{ id?: string }>();
  const activeId = params.id ?? null;
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const chats = useQuery({ queryKey: ["chats"], queryFn: api.chats.list });
  const active = activeId ? (chats.data?.find((c) => c.project.id === activeId) ?? null) : null;

  const messages = useQuery({
    queryKey: ["chat", activeId],
    queryFn: () => api.chats.messages(activeId!),
    enabled: Boolean(active),
  });

  // Шторка участников (на узких экранах) открыта только для того чата, где её открыли
  const [membersOpenFor, setMembersOpenFor] = useState<string | null>(null);

  // Открытый чат = прочитанный. Отмечаем при открытии и при каждом новом чужом сообщении
  const last = messages.data?.at(-1);
  const lastId = last?.id;
  const lastIsMine = last?.author?.id === user?.id;
  useEffect(() => {
    if (!activeId || !lastId || lastIsMine) return;
    api.chats.markRead(activeId).then(() => queryClient.invalidateQueries({ queryKey: ["chats"] }));
  }, [activeId, lastId, lastIsMine, queryClient]);

  const send = async (text: string) => {
    if (!activeId) return false;
    try {
      const message = await api.chats.send(activeId, text);
      // Своё сообщение показываем сразу; то же сообщение из WebSocket не задвоится (проверка по id)
      queryClient.setQueryData<ChatMessage[]>(["chat", activeId], (old) =>
        old && !old.some((m) => m.id === message.id) ? [...old, message] : old,
      );
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      return true;
    } catch {
      return false;
    }
  };

  // Открытый чат не показывает счётчик непрочитанных
  const unread = (id: string) => (id === activeId ? 0 : (chats.data?.find((c) => c.project.id === id)?.unread ?? 0));

  const placeholder = chats.isPending
    ? { title: "Loading chats…", text: "" }
    : chats.isError
      ? { title: "Couldn't load chats", text: "Check your connection and try again." }
      : activeId
        ? { title: "Chat not found", text: "You're not a member of this team, or the project doesn't exist." }
        : { title: "Select a chat", text: "Each project has its own team chat. Pick one from the list." };

  return (
    <div className={`${scss.chat} ${activeId ? scss.hasActive : ""}`}>
      <ChatList
        chats={chats.data ?? []}
        loading={chats.isPending}
        activeId={activeId}
        currentUserId={user?.id ?? ""}
        unread={unread}
      />

      <section className={scss.windowArea}>
        {active && user ? (
          <ChatWindow
            key={active.project.id}
            project={active.project}
            messages={messages.data ?? []}
            loading={messages.isPending}
            currentUserId={user.id}
            onSend={send}
            onOpenMembers={() => setMembersOpenFor(active.project.id)}
          />
        ) : (
          <div className={scss.placeholder}>
            <p className={scss.placeholderIcon}>💬</p>
            <p className={scss.placeholderTitle}>{placeholder.title}</p>
            {placeholder.text && <p className={scss.placeholderText}>{placeholder.text}</p>}
          </div>
        )}
      </section>

      {active && user && (
        <MembersPanel
          project={active.project}
          currentUserId={user.id}
          open={membersOpenFor === active.project.id}
          onClose={() => setMembersOpenFor(null)}
        />
      )}
    </div>
  );
};

export default Chat;
