"use client";
import { useRef, useState } from "react";
import { SendIcon } from "@/components/ui/Icons";
import scss from "./Chat.module.scss";

type ComposerProps = {
  onSend: (text: string) => void;
  placeholder: string;
};

const MAX_HEIGHT = 140; // ~5 строк, дальше поле прокручивается

// Поле ввода: Enter — отправить, Shift+Enter — новая строка, высота растёт с текстом
const Composer = ({ onSend, placeholder }: ComposerProps) => {
  const [text, setText] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  const resize = () => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT)}px`;
  };

  const submit = () => {
    const value = text.trim();
    if (!value) return;
    onSend(value);
    setText("");
    requestAnimationFrame(resize);
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
        className={scss.composerInput}
        aria-label="Message"
      />
      <button type="submit" className={scss.sendButton} disabled={!text.trim()} aria-label="Send message">
        <SendIcon />
      </button>
    </form>
  );
};

export default Composer;
