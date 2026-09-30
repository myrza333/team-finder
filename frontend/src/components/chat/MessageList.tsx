"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import Avatar from "@/components/ui/Avatar/Avatar";
import { clockTime, dayLabel } from "@/lib/format";
import type { ChatMessage } from "@/types";
import scss from "./Chat.module.scss";

type MessageListProps = {
  messages: ChatMessage[];
  loading: boolean;
  ownerId: string;
  currentUserId: string;
};

// Лента сообщений: разделители по дням, системные строки, группировка подряд идущих сообщений одного автора
const MessageList = ({ messages, loading, ownerId, currentUserId }: MessageListProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Всегда держим ленту прокрученной вниз (при открытии и при новом сообщении)
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  if (messages.length === 0) {
    return (
      <div className={scss.messages}>
        <p className={scss.noMessages}>{loading ? "Loading messages…" : "No messages yet. Say hi to your team"}</p>
      </div>
    );
  }

  return (
    <div className={scss.messages} ref={scrollRef}>
      {messages.map((m, i) => {
        const prev = messages[i - 1];
        const day = dayLabel(m.createdAt);
        const time = clockTime(m.createdAt);
        const newDay = !prev || dayLabel(prev.createdAt) !== day;
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
                {m.text} · {time}
              </p>
            ) : m.author.id === currentUserId ? (
              <div className={`${scss.messageRow} ${scss.own} ${groupStart ? scss.groupStart : ""}`}>
                <div className={`${scss.bubble} ${scss.bubbleOwn}`}>
                  <span className={scss.text}>{m.text}</span>
                  <span className={scss.time}>{time}</span>
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
                      {m.author.id === ownerId && <span className={scss.ownerMark}>Owner</span>}
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
