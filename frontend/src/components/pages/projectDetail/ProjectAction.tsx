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
      setError(e instanceof Error ? e.message : "Something went wrong");
      return false;
    } finally {
      setBusy(false);
    }
  };

  const errorText = error && <p className={scss.actionError}>{error}</p>;

  if (project.owner.id === currentUserId) {
    return (
      <Button href={`/my-projects/${project.id}`} size="lg">
        Manage project
      </Button>
    );
  }

  if (project.members.some((m) => m.id === currentUserId)) {
    return (
      <div className={scss.actions}>
        <div className={scss.actionButtons}>
          <Button href={`/chat/${project.id}`} size="lg">
            Team chat
          </Button>
          {confirmLeave ? (
            <>
              <Button variant="danger" size="lg" disabled={busy} onClick={() => run(() => api.projects.leave(project.id))}>
                {busy ? "Leaving…" : "Yes, leave"}
              </Button>
              <Button variant="outline" size="lg" onClick={() => setConfirmLeave(false)}>
                Cancel
              </Button>
            </>
          ) : (
            <Button variant="outline" size="lg" onClick={() => setConfirmLeave(true)}>
              Leave team
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
          Application sent
        </Button>
        <Button
          variant="outline"
          size="lg"
          disabled={busy}
          onClick={() => run(() => api.applications.withdraw(myApplication.id))}
        >
          {busy ? "Withdrawing…" : "Withdraw"}
        </Button>
      </>
    ) : myApplication?.status === "rejected" ? (
      <Button variant="outline" size="lg" disabled>
        Application declined
      </Button>
    ) : project.status === "closed" ? (
      <Button variant="outline" size="lg" disabled>
        Not recruiting
      </Button>
    ) : (
      <Button size="lg" onClick={() => setApplyOpen(true)}>
        Request to join
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
      setError(e instanceof Error ? e.message : "Something went wrong");
      setBusy(false);
    }
  };

  return (
    <div className={scss.actions}>
      <div className={scss.actionButtons}>
        {main}
        <Button variant="outline" size="lg" disabled={busy} onClick={messageOwner}>
          <MessageCircle size={18} strokeWidth={1.75} aria-hidden /> Message owner
        </Button>
      </div>
      {!applyOpen && errorText}
      <Modal open={applyOpen} onClose={() => setApplyOpen(false)} title={`Join ${project.title}`}>
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
      <Field label="Position" htmlFor="vacancy">
        <Select id="vacancy" value={vacancyId} onChange={(e) => setVacancyId(e.target.value)}>
          {openVacancies.map((v) => (
            <option key={v.id} value={v.id}>
              {v.title}
            </option>
          ))}
          <option value="">Any role</option>
        </Select>
      </Field>

      <Field
        label="Message"
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
          placeholder="Your experience and why you want to join"
        />
      </Field>

      {error && <Hint error>{error}</Hint>}

      <Button type="submit" size="lg" fullWidth disabled={busy}>
        {busy ? "Sending…" : "Send application"}
      </Button>
    </form>
  );
};

export default ProjectAction;
