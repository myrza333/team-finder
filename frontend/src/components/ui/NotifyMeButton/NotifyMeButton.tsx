"use client";
import { Bell, BellRing } from "lucide-react";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/auth/useAuth";
import Button from "@/components/ui/Button/Button";
import { api } from "@/lib/api";
import { useI18n } from "@/i18n/client";
import type { LaunchSubscription } from "@/types";
import scss from "./NotifyMeButton.module.scss";

type NotifyMeButtonProps = {
  projectId: string;
  initial: LaunchSubscription;
  size?: "sm" | "md" | "lg";
  showCount?: boolean; // "· 3 waiting" рядом с кнопкой
};

// "Notify me": в день запуска придёт уведомление. Гостя сначала отправляем войти
const NotifyMeButton = ({ projectId, initial, size = "sm", showCount = true }: NotifyMeButtonProps) => {
  const { status } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState(initial);
  const [busy, setBusy] = useState(false);

  const toggle = async () => {
    if (status === "guest") return router.push(`/login?next=${encodeURIComponent(pathname)}`);
    setBusy(true);
    // Сразу показываем результат, а если сервер ответит ошибкой — вернём как было
    const previous = state;
    setState({ subscribed: !state.subscribed, subscribers: state.subscribers + (state.subscribed ? -1 : 1) });
    try {
      setState(state.subscribed ? await api.launch.unsubscribe(projectId) : await api.launch.subscribe(projectId));
    } catch {
      setState(previous);
    } finally {
      setBusy(false);
    }
  };

  return (
    <span className={scss.wrap}>
      <Button
        size={size}
        variant={state.subscribed ? "outline" : "primary"}
        onClick={toggle}
        disabled={busy}
        aria-pressed={state.subscribed}
      >
        {state.subscribed ? (
          <>
            <BellRing size={15} strokeWidth={1.75} aria-hidden /> {t.announcements.notified}
          </>
        ) : (
          <>
            <Bell size={15} strokeWidth={1.75} aria-hidden /> {t.announcements.notifyMe}
          </>
        )}
      </Button>
      {showCount && state.subscribers > 0 && (
<span className={scss.count}>{t.announcements.waiting(state.subscribers)}</span>
      )}
    </span>
  );
};

export default NotifyMeButton;
