"use client";
import { Check, CheckCheck } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import Avatar from "@/components/ui/Avatar/Avatar";
import { clockTime, dayLabel, isNotAfter } from "@/lib/format";
import type { ChatMessage } from "@/types";
import { useI18n } from "@/i18n/client";
import { translateSystemMessage } from "@/i18n/translate";
import scss from "./Chat.module.scss";

type MessageListProps = {
  messages: ChatMessage[];
  loading: boolean;
  emptyText?: string; // что показать в пустом чате
  ownerId: string;
  currentUserId: string;
  readAt?: string | null; // до какого момента прочитал собеседник (в команде — хоть кто-то): у моих сообщений ✓ / ✓✓; null — никто
  hasOlder?: boolean; // есть сообщения старше загруженных
  onLoadOlder?: () => Promise<void>;
};

// Ближе к низу, чем на столько пикселей, — считаем, что человек внизу и следит за новыми сообщениями
const BOTTOM_ZONE = 80;

// Лента сообщений: разделители по дням, системные строки, группировка подряд идущих сообщений одного автора
const MessageList = ({
  messages,
  loading,
  ownerId,
  currentUserId,
  readAt,
  hasOlder,
  onLoadOlder,
  emptyText,
}: MessageListProps) => {
  const { t, locale } = useI18n();
  const scrollRef = useRef<HTMLDivElement>(null);
  const atBottom = useRef(true);
  const distanceFromBottom = useRef<number | null>(null);
  const [loadingOlder, setLoadingOlder] = useState(false);

  const firstId = messages[0]?.id;
  const last = messages.at(-1);
  const lastIsMine = last?.author?.id === currentUserId;

  // Новое сообщение: прокручиваем вниз, если человек и так внизу или это его сообщение.
  // Если он читает историю выше — не сбиваем
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (el && (atBottom.current || lastIsMine)) el.scrollTop = el.scrollHeight;
  }, [last?.id, lastIsMine]);

  // Подгрузились старые сообщения сверху: оставляем на экране то же место, что было
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el || distanceFromBottom.current === null) return;
    el.scrollTop = el.scrollHeight - distanceFromBottom.current;
    distanceFromBottom.current = null;
  }, [firstId]);

  const loadOlder = async () => {
    const el = scrollRef.current;
    if (!el || !onLoadOlder) return;
    setLoadingOlder(true);
    distanceFromBottom.current = el.scrollHeight - el.scrollTop;
    try {
      await onLoadOlder();
    } catch {
      distanceFromBottom.current = null;
    } finally {
      setLoadingOlder(false);
    }
  };

  if (messages.length === 0) {
    return (
      <div className={scss.messages}>
        <p className={scss.noMessages}>{loading ? t.chat.loadingMessages : (emptyText ?? t.chat.sayHi)}</p>
      </div>
    );
  }

  return (
    <div
      className={scss.messages}
      ref={scrollRef}
      onScroll={(e) => {
        const el = e.currentTarget;
        atBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < BOTTOM_ZONE;
      }}
    >
      {hasOlder && (
        <div className={scss.loadOlder}>
          <button type="button" onClick={loadOlder} disabled={loadingOlder}>
            {loadingOlder ? t.common.loading : t.chat.loadEarlier}
          </button>
        </div>
      )}
      {messages.map((m, i) => {
        const prev = messages[i - 1];
        const day = dayLabel(m.createdAt, locale);
        const time = clockTime(m.createdAt);
        const newDay = !prev || dayLabel(prev.createdAt, locale) !== day;
        // Начало группы: сменился день, автор или перед этим было системное сообщение
        const groupStart = newDay || !prev?.author || prev.author.id !== m.author?.id;

        return (
          <div key={m.id}>
            {newDay && (
              <div className={scss.dayDivider}>
                <span>{day}</span>
              </div>
            )}

            {!m.author ? (
              <p className={scss.systemMessage}>
                {translateSystemMessage(m.text, t)} · {time}
              </p>
            ) : m.author.id === currentUserId ? (
              <div className={`${scss.messageRow} ${scss.own} ${groupStart ? scss.groupStart : ""}`}>
                <div className={`${scss.bubble} ${scss.bubbleOwn}`}>
                  <span className={scss.text}>{m.text}</span>
                  <span className={scss.time}>
                    {time}
                    {readAt !== undefined &&
                      (readAt && isNotAfter(m.createdAt, readAt) ? (
                        <CheckCheck size={14} strokeWidth={2} className={scss.read} aria-label={t.chat.read} />
                      ) : (
                        <Check size={14} strokeWidth={2} aria-label={t.chat.sent} />
                      ))}
                  </span>
                </div>
              </div>
            ) : (
              <div className={`${scss.messageRow} ${groupStart ? scss.groupStart : ""}`}>
                <div className={scss.avatarSlot}>
                  {groupStart && (
                    <Link href={`/profile/${m.author.id}`}>
                      <Avatar src={m.author.avatarUrl} alt={m.author.name} size={32} />
                    </Link>
                  )}
                </div>
                <div className={scss.bubbleBox}>
                  {groupStart && (
                    <p className={scss.author}>
                      {m.author.name}
                      {m.author.id === ownerId && <span className={scss.ownerMark}>{t.chat.ownerMark}</span>}
                    </p>
                  )}
                  <div className={scss.bubble}>
                    <span className={scss.text}>{m.text}</span>
                    <span className={scss.time}>{time}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MessageList;
