"use client";
import { useRef, useState } from "react";
import { SendIcon } from "@/components/ui/Icons";
import { useI18n } from "@/i18n/client";
import scss from "./Chat.module.scss";

type ComposerProps = {
  onSend: (text: string) => Promise<boolean>; // false — не отправилось, текст остаётся в поле
  placeholder: string;
};

const MAX_HEIGHT = 140; // ~5 строк, дальше поле прокручивается

// Поле ввода: Enter — отправить, Shift+Enter — новая строка, высота растёт с текстом
const Composer = ({ onSend, placeholder }: ComposerProps) => {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);
  const { t } = useI18n();

  const resize = () => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT)}px`;
  };

  const submit = async () => {
    const value = text.trim();
    if (!value || sending) return;
    setSending(true);
    const ok = await onSend(value);
    setSending(false);
    setFailed(!ok);
    if (ok) {
      setText("");
      requestAnimationFrame(resize);
    }
    ref.current?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <form
      className={scss.composer}
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <textarea
        ref={ref}
        rows={1}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          resize();
        }}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        // Не отправилось — красная рамка, текст остаётся в поле
        aria-invalid={failed || undefined}
        title={failed ? t.chat.notSent : undefined}
        className={scss.composerInput}
        aria-label={t.chat.messageLabel}
      />
      <button type="submit" className={scss.sendButton} disabled={!text.trim() || sending} aria-label={t.chat.send}>
        <SendIcon />
      </button>
    </form>
  );
};

export default Composer;
