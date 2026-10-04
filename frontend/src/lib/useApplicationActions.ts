"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useI18n } from "@/i18n/client";

// Принять / отклонить / отозвать заявку — общее для страницы Applications и управления проектом
export const useApplicationActions = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { t } = useI18n();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async (id: string, action: () => Promise<unknown>) => {
    setBusyId(id);
    setError(null);
    try {
      await action();
      // Заявки, счётчики и чаты (принятый попадает в команду) — всё перечитать; серверные страницы тоже
      await queryClient.invalidateQueries({ queryKey: ["applications"] });
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : t.common.somethingWrong);
    } finally {
      setBusyId(null);
    }
  };

  return {
    busyId,
    error,
    decide: (id: string, status: "accepted" | "rejected") => run(id, () => api.applications.decide(id, status)),
    withdraw: (id: string) => run(id, () => api.applications.withdraw(id)),
    // Личный чат с кандидатом: открыть (или создать) и перейти в него
    message: async (id: string) => {
      setBusyId(id);
      setError(null);
      try {
        const chat = await api.direct.openWithApplicant(id);
        queryClient.invalidateQueries({ queryKey: ["direct-chats"] });
        router.push(`/chat/d/${chat.id}`);
      } catch (e) {
        setError(e instanceof Error ? e.message : t.common.somethingWrong);
        setBusyId(null);
      }
    },
  };
};
