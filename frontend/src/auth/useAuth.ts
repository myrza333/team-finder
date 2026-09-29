"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import type { User } from "@/types";

export type AuthStatus = "loading" | "guest" | "authenticated";

// Текущий пользователь по cookie-сессии; 401 от API = гость
const fetchMe = async (): Promise<User | null> => {
  try {
    return await api.auth.me();
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) return null;
    throw e;
  }
};

export const useAuth = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { data: user, isPending } = useQuery({ queryKey: ["me"], queryFn: fetchMe, retry: false });

  const status: AuthStatus = isPending ? "loading" : user ? "authenticated" : "guest";

  // После входа/выхода обновляем и клиентский кэш, и серверные страницы (router.refresh)
  const setUser = (next: User | null) => {
    queryClient.setQueryData(["me"], next);
    router.refresh();
  };

  return {
    status,
    user: user ?? null,
    setUser,
    logout: async () => {
      await api.auth.logout();
      queryClient.clear();
      setUser(null);
    },
  };
};
