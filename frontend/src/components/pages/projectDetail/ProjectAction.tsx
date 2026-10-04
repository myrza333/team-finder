"use client";
import { MessageCircle } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import Button from "@/components/ui/Button/Button";
import Modal from "@/components/ui/Modal/Modal";
import { Field, Hint, Select, Textarea } from "@/components/ui/Form/Form";
import { api } from "@/lib/api";
import NotifyMeButton from "@/components/ui/NotifyMeButton/NotifyMeButton";
import type { Application, LaunchSubscription, Project } from "@/types";
import { useI18n } from "@/i18n/client";
import scss from "./ProjectDetailPage.module.scss";

const MESSAGE_MAX = 1000;

type ProjectActionProps = {
  project: Project;
  currentUserId: string;
  myApplication: Application | null; // моя заявка в этот проект, если есть
  launch: LaunchSubscription | null; // подписка "Notify me" — если проект пока анонс
};

// Главная кнопка зависит от того, кто смотрит: владелец, участник, уже подавший заявку или новый человек
const ProjectAction = ({ project, currentUserId, myApplication, launch }: ProjectActionProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);

  // После любого действия перечитываем страницу с сервера и сбрасываем кэш заявок/чатов
  const run = async (action: () => Promise<unknown>) => {
    setBusy(true);
    setError(null);
    try {
      await action();
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      router.refresh();
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : t.common.somethingWrong);
      return false;
    } finally {
      setBusy(false);
    }
  };

  const errorText = error && <p className={scss.actionError}>{error}</p>;

  if (project.owner.id === currentUserId) {
    return (
      <Button href={`/my-projects/${project.id}`} size="lg">
        {t.project.manage}
      </Button>
    );
  }

  if (project.members.some((m) => m.id === currentUserId)) {
    return (
      <div className={scss.actions}>
        <div className={scss.actionButtons}>
          <Button href={`/chat/${project.id}`} size="lg">
            {t.common.teamChat}
          </Button>
          {confirmLeave ? (
            <>
              <Button variant="danger" size="lg" disabled={busy} onClick={() => run(() => api.projects.leave(project.id))}>
                {busy ? t.project.leaving : t.project.confirmLeave}
              </Button>
              <Button variant="outline" size="lg" onClick={() => setConfirmLeave(false)}>
                {t.common.cancel}
              </Button>
            </>
          ) : (
            <Button variant="outline" size="lg" onClick={() => setConfirmLeave(true)}>
              {t.project.leave}
            </Button>
          )}
        </div>
        {errorText}
      </div>
    );
  }

  // Не в команде: заявка (в зависимости от её состояния) + "Message owner" — можно сначала всё обсудить
  // Анонс: заявок ещё нет — можно подписаться на запуск
  const main =
    project.announced && launch ? (
      <NotifyMeButton projectId={project.id} initial={launch} size="lg" />
    ) : myApplication?.status === "pending" ? (
      <>
        <Button variant="outline" size="lg" disabled>
          {t.project.applicationSent}
        </Button>
        <Button
          variant="outline"
          size="lg"
          disabled={busy}
          onClick={() => run(() => api.applications.withdraw(myApplication.id))}
        >
          {busy ? t.project.withdrawing : t.project.withdraw}
        </Button>
      </>
    ) : myApplication?.status === "rejected" ? (
      <Button variant="outline" size="lg" disabled>
        {t.project.declined}
      </Button>
    ) : project.status === "closed" ? (
      <Button variant="outline" size="lg" disabled>
        {t.project.notRecruiting}
      </Button>
    ) : (
      <Button size="lg" onClick={() => setApplyOpen(true)}>
        {t.project.requestToJoin}
      </Button>
    );

  // Открываем (или создаём) личный чат с владельцем и переходим в него
  const messageOwner = async () => {
    setBusy(true);
    setError(null);
    try {
      const { id } = await api.direct.openWithOwner(project.id);
      queryClient.invalidateQueries({ queryKey: ["direct-chats"] });
      router.push(`/chat/d/${id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : t.common.somethingWrong);
      setBusy(false);
    }
  };

  return (
    <div className={scss.actions}>
      <div className={scss.actionButtons}>
        {main}
        <Button variant="outline" size="lg" disabled={busy} onClick={messageOwner}>
          <MessageCircle size={18} strokeWidth={1.75} aria-hidden /> {t.project.messageOwner}
        </Button>
      </div>
      {!applyOpen && errorText}
      <Modal open={applyOpen} onClose={() => setApplyOpen(false)} title={t.project.joinTitle(project.title)}>
        <ApplyForm
          project={project}
          busy={busy}
          error={error}
          onSubmit={async (data) => {
            if (await run(() => api.applications.apply(project.id, data))) setApplyOpen(false);
          }}
        />
      </Modal>
    </div>
  );
};

type ApplyFormProps = {
  project: Project;
  busy: boolean;
  error: string | null;
  onSubmit: (data: { vacancyId?: string; message?: string }) => void;
};

const ApplyForm = ({ project, busy, error, onSubmit }: ApplyFormProps) => {
  const { t } = useI18n();
  const openVacancies = project.vacancies.filter((v) => v.isOpen !== false);
  const [vacancyId, setVacancyId] = useState(openVacancies[0]?.id ?? "");
  const [message, setMessage] = useState("");

  return (
    <form
      className={scss.applyForm}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ vacancyId: vacancyId || undefined, message: message.trim() || undefined });
      }}
    >
      <Field label={t.project.position} htmlFor="vacancy">
        <Select id="vacancy" value={vacancyId} onChange={(e) => setVacancyId(e.target.value)}>
          {openVacancies.map((v) => (
            <option key={v.id} value={v.id}>
              {v.title}
            </option>
          ))}
          <option value="">{t.project.anyRole}</option>
        </Select>
      </Field>

      <Field
        label={t.project.message}
        htmlFor="message"
        hint={
          <span className={scss.counter}>
            {message.length}/{MESSAGE_MAX}
          </span>
        }
      >
        <Textarea
          id="message"
          rows={5}
          maxLength={MESSAGE_MAX}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t.project.messagePlaceholder}
        />
      </Field>

      {error && <Hint error>{error}</Hint>}

      <Button type="submit" size="lg" fullWidth disabled={busy}>
        {busy ? t.project.sending : t.project.sendApplication}
      </Button>
    </form>
  );
};

export default ProjectAction;
