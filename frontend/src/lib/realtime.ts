"use client";
import { useEffect, useSyncExternalStore } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";
import { useAuth } from "@/auth/useAuth";
import { api } from "@/lib/api";
import type { ChatMessage } from "@/types";

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

    socket.on("presence:list", (ids: string[]) => setOnline(new Set(ids)));
    socket.on("presence", ({ userId: id, online: isOnline }: { userId: string; online: boolean }) => {
      const next = new Set(online);
      if (isOnline) next.add(id);
      else next.delete(id);
      setOnline(next);
    });

    return () => {
      socket.close();
      setOnline(new Set());
    };
  }, [userId, queryClient]);
};
