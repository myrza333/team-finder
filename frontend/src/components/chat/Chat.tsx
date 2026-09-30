"use client";
import { MessagesSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/auth/useAuth";
import { api } from "@/lib/api";
import type { ChatMessage } from "@/types";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";
import DirectWindow from "./DirectWindow";
import MembersPanel from "./MembersPanel";
import scss from "./Chat.module.scss";

// Весь мессенджер: список чатов | переписка | участники. Живёт в layout, при переключении чатов не пересоздаётся.
// Два вида чатов: команды (/chat/<projectId>) и личные по поводу проекта (/chat/d/<chatId>).
// Новые сообщения приходят через WebSocket (lib/realtime.ts) и сами дописываются в кэш
const Chat = () => {
  const params = useParams<{ id?: string }>();
  const pathname = usePathname();
  const activeId = params.id ?? null;
  const isDirect = pathname.startsWith("/chat/d/");
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const teams = useQuery({ queryKey: ["chats"], queryFn: api.chats.list });
  const directs = useQuery({ queryKey: ["direct-chats"], queryFn: api.direct.list });

  const activeTeam = !isDirect && activeId ? (teams.data?.find((c) => c.project.id === activeId) ?? null) : null;
  const activeDirect = isDirect && activeId ? (directs.data?.find((c) => c.id === activeId) ?? null) : null;
  const hasActive = Boolean(activeTeam || activeDirect);

  // Кэш переписки: ["chat", projectId] или ["direct", chatId]
  const messagesKey = [isDirect ? "direct" : "chat", activeId];
  const messages = useQuery({
    queryKey: messagesKey,
    queryFn: () => (isDirect ? api.direct.messages(activeId!) : api.chats.messages(activeId!)),
    enabled: hasActive,
  });

  // Шторка участников (на узких экранах) открыта только для того чата, где её открыли
  const [membersOpenFor, setMembersOpenFor] = useState<string | null>(null);

  // Открытый чат = прочитанный. Отмечаем при открытии и при каждом новом чужом сообщении
  const last = messages.data?.at(-1);
  const lastId = last?.id;
  const lastIsMine = last?.author?.id === user?.id;
  useEffect(() => {
    if (!activeId || !lastId || lastIsMine) return;
    const markRead = isDirect ? api.direct.markRead(activeId) : api.chats.markRead(activeId);
    markRead.then(() => queryClient.invalidateQueries({ queryKey: [isDirect ? "direct-chats" : "chats"] }));
  }, [activeId, isDirect, lastId, lastIsMine, queryClient]);

  const send = async (text: string) => {
    if (!activeId) return false;
    try {
      const message = isDirect ? await api.direct.send(activeId, text) : await api.chats.send(activeId, text);
      // Своё сообщение показываем сразу; то же сообщение из WebSocket не задвоится (проверка по id)
      queryClient.setQueryData<ChatMessage[]>(messagesKey, (old) =>
        old && !old.some((m) => m.id === message.id) ? [...old, message] : old,
      );
      queryClient.invalidateQueries({ queryKey: [isDirect ? "direct-chats" : "chats"] });
      return true;
    } catch {
      return false;
    }
  };

  const loading = teams.isPending || directs.isPending;
  const placeholder = loading
    ? { title: "Loading chats…", text: "" }
    : teams.isError || directs.isError
      ? { title: "Couldn't load chats", text: "Check your connection and try again." }
      : activeId
        ? { title: "Chat not found", text: "You're not in this chat, or it doesn't exist." }
        : { title: "Select a chat", text: "Team chats and your direct messages with project owners are on the left." };

  return (
    <div className={`${scss.chat} ${hasActive ? scss.hasActive : ""} ${activeDirect ? scss.noMembers : ""}`}>
      <ChatList
        teams={teams.data ?? []}
        directs={directs.data ?? []}
        loading={loading}
        activeHref={activeId ? pathname : null}
        currentUserId={user?.id ?? ""}
      />

      <section className={scss.windowArea}>
        {activeTeam && user ? (
          <ChatWindow
            key={activeTeam.project.id}
            project={activeTeam.project}
            messages={messages.data ?? []}
            loading={messages.isPending}
            currentUserId={user.id}
            onSend={send}
            onOpenMembers={() => setMembersOpenFor(activeTeam.project.id)}
          />
        ) : activeDirect && user ? (
          <DirectWindow
            key={activeDirect.id}
            chat={activeDirect}
            messages={messages.data ?? []}
            loading={messages.isPending}
            currentUserId={user.id}
            onSend={send}
          />
        ) : (
          <div className={scss.placeholder}>
            <div className={scss.placeholderIcon}>
              <MessagesSquare size={26} strokeWidth={1.75} aria-hidden />
            </div>
            <p className={scss.placeholderTitle}>{placeholder.title}</p>
            {placeholder.text && <p className={scss.placeholderText}>{placeholder.text}</p>}
          </div>
        )}
      </section>

      {activeTeam && user && (
        <MembersPanel
          project={activeTeam.project}
          currentUserId={user.id}
          open={membersOpenFor === activeTeam.project.id}
          onClose={() => setMembersOpenFor(null)}
        />
      )}
    </div>
  );
};

export default Chat;
