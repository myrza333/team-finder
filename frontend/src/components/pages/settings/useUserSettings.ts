"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { UserSettings } from "@/types";

// Настройки приватности и уведомлений: общие для страниц Privacy и Notifications
export const useUserSettings = () => useQuery({ queryKey: ["settings"], queryFn: api.users.settings });

// Сохранить часть настроек. Приватность влияет на то, как тебя видят в People и профиле, — обновляем и их
export const useSaveSettings = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  return async (data: Partial<UserSettings>) => {
    const saved = await api.users.updateSettings(data);
    queryClient.setQueryData(["settings"], saved);
    queryClient.invalidateQueries({ predicate: (q) => q.queryKey[0] !== "settings" });
    router.refresh();
  };
};
