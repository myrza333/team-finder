"use client";
import { ArrowRight, MessageCircle } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@/i18n/client";
import { api } from "@/lib/api";
import scss from "./ProjectDetailPage.module.scss";

type AskOwnerButtonProps = { projectId: string; vacancyId: string; vacancyTitle: string };

// Свободная позиция: открыть личный чат с владельцем. ?position= — в чате появятся готовые вопросы о ней.
// Кнопка растянута на всю карточку позиции (stretched-link), поэтому нажимается вся карточка
const AskOwnerButton = ({ projectId, vacancyId, vacancyTitle }: AskOwnerButtonProps) => {
  const { t } = useI18n();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const open = async () => {
    setBusy(true);
    setError(null);
    try {
      const { id } = await api.direct.openWithOwner(projectId);
      queryClient.invalidateQueries({ queryKey: ["direct-chats"] });
      router.push(`/chat/d/${id}?position=${vacancyId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : t.common.somethingWrong);
      setBusy(false);
    }
  };

  return (
    <div className={scss.askRow}>
      <button
        type="button"
        className={scss.ask}
        onClick={open}
        disabled={busy}
        aria-label={t.project.askOwnerAbout(vacancyTitle)}
      >
        <MessageCircle size={15} strokeWidth={1.75} aria-hidden />
        {busy ? t.project.opening : t.project.askOwner}
        <ArrowRight size={14} strokeWidth={1.75} className={scss.askArrow} aria-hidden />
      </button>
      {error && <p className={scss.askError}>{error}</p>}
    </div>
  );
};

export default AskOwnerButton;
