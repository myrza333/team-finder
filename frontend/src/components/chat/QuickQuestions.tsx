"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/i18n/client";
import { api } from "@/lib/api";
import scss from "./Chat.module.scss";

type QuickQuestionsProps = {
  projectId: string;
  asked: string[]; // мои сообщения в этом чате: уже заданный вопрос второй раз не предлагаем
  onSend: (text: string) => Promise<boolean>;
};

// Чат открыт со свободной позиции проекта (/chat/d/<id>?position=<vacancyId>):
// над полем ввода — три готовых вопроса о ней, отправляются одним нажатием
const QuickQuestions = ({ projectId, asked, onSend }: QuickQuestionsProps) => {
  const { t } = useI18n();
  const vacancyId = useSearchParams().get("position");
  const [sending, setSending] = useState(false);

  const { data: project } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => api.projects.get(projectId),
    enabled: Boolean(vacancyId),
  });
  const vacancy = project?.vacancies.find((v) => v.id === vacancyId && v.isOpen !== false);
  if (!vacancy) return null;

  const questions = [
    t.chat.quickSkills(vacancy.title),
    t.chat.quickConditions,
    t.chat.quickMore(vacancy.title),
  ].filter((q) => !asked.includes(q));
  if (!questions.length) return null;

  const ask = async (question: string) => {
    setSending(true);
    await onSend(question);
    setSending(false);
  };

  return (
    <div className={scss.quick}>
      <p className={scss.quickTitle}>{t.chat.quickTitle(vacancy.title)}</p>
      <div className={scss.quickList}>
        {questions.map((q) => (
          <button key={q} type="button" className={scss.quickButton} onClick={() => ask(q)} disabled={sending}>
            {q}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickQuestions;
