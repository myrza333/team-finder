"use client";
import { useEffect, useSyncExternalStore } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";
import { useAuth } from "@/auth/useAuth";
import { api } from "@/lib/api";
import type { ChatMessage, ChatSummary, DirectChat } from "@/types";
import { isNotAfter } from "@/lib/format";

// WebSocket идёт на бэкенд напрямую: Vercel не умеет проксировать WebSocket через /api.
// Адрес подставляет next.config.ts (тот же BACKEND_URL, что и для /api)
const SOCKET_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5000";

// ===== Кто в сети =====
// Маленькое хранилище вне React: сокет пишет, компоненты читают через useOnlineUsers()
let online = new Set<string>();
const listeners = new Set<() => void>();
const setOnline = (next: Set<string>) => {
  online = next;
  listeners.forEach((l) => l());
};
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
const empty = new Set<string>();

export const useOnlineUsers = () => useSyncExternalStore(subscribe, () => online, () => empty);

// ===== Когда был в сети =====
// Начальные значения приходят с чатами (API), а свежие — из события "presence", когда человек уходит
let lastSeen = new Map<string, string>();
const emptySeen = new Map<string, string>();
const useLastSeenUpdates = () => useSyncExternalStore(subscribe, () => lastSeen, () => emptySeen);

// fromApi — значение из списка чатов; если человек ушёл уже после загрузки, берём свежее из WebSocket
export const useLastSeen = () => {
  const updates = useLastSeenUpdates();
  return (userId: string, fromApi?: string | null) => updates.get(userId) ?? fromApi ?? null;
};

// ===== Подключение =====
// Ставится один раз на весь сайт (в providers.tsx). Сам ничего не рисует —
// получает события с сервера и обновляет кэш запросов, а страницы перерисовываются сами
export const useRealtime = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id;

  useEffect(() => {
    if (!userId) return;

    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
      // Свежий токен при каждом (пере)подключении: cookie сессии на бэкенд напрямую не попадает
      auth: (cb) => {
        api.auth
          .socketToken()
          .then(cb)
          .catch(() => cb({}));
      },
    });

    // Новое уведомление (заявка, приняли, отказали...) — обновить колокольчик и заявки
    socket.on("notification", () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    });

    // Меня приняли в команду или убрали из неё — поменялся список чатов
    socket.on("membership", () => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    });

    // Новое сообщение: дописываем в открытую переписку (если она загружена) и обновляем список чатов
    socket.on("chat:message", (message: ChatMessage) => {
      queryClient.setQueryData<ChatMessage[]>(["chat", message.projectId], (old) =>
        old && !old.some((m) => m.id === message.id) ? [...old, message] : old,
      );
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    });

    // То же для личного чата: ["direct", id] — переписка, ["direct-chats"] — список
    socket.on("direct:message", (message: ChatMessage) => {
      queryClient.setQueryData<ChatMessage[]>(["direct", message.chatId], (old) =>
        old && !old.some((m) => m.id === message.id) ? [...old, message] : old,
      );
      queryClient.invalidateQueries({ queryKey: ["direct-chats"] });
    });

    socket.on("presence:list", (ids: string[]) => setOnline(new Set(ids)));
    // Кто-то из команды открыл чат (или написал) — мои сообщения до этого момента становятся ✓✓.
    // Своё собственное прочтение не считаем
    socket.on("chat:read", ({ projectId, userId: readerId, readAt }: { projectId: string; userId: string; readAt: string }) => {
      if (readerId === userId) return;
      queryClient.setQueryData<ChatSummary[]>(["chats"], (old) =>
        old?.map((c) =>
          c.project.id === projectId && (!c.othersReadAt || !isNotAfter(readAt, c.othersReadAt))
            ? { ...c, othersReadAt: readAt }
            : c,
        ),
      );
    });

    // Собеседник открыл личный чат (или ответил) — мои сообщения до этого момента становятся ✓✓
    socket.on("direct:read", ({ chatId, readAt }: { chatId: string; readAt: string }) => {
      queryClient.setQueryData<DirectChat[]>(["direct-chats"], (old) =>
        old?.map((c) => (c.id === chatId && !isNotAfter(readAt, c.otherReadAt) ? { ...c, otherReadAt: readAt } : c)),
      );
    });

    socket.on(
      "presence",
      ({ userId: id, online: isOnline, lastSeenAt }: { userId: string; online: boolean; lastSeenAt?: string }) => {
        if (!isOnline && lastSeenAt) lastSeen = new Map(lastSeen).set(id, lastSeenAt);
        const next = new Set(online);
        if (isOnline) next.add(id);
        else next.delete(id);
        setOnline(next);
      },
    );

    return () => {
      socket.close();
      setOnline(new Set());
    };
  }, [userId, queryClient]);
};
