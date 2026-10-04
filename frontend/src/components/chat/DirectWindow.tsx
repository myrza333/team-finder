"use client";
import { Suspense } from "react";
import Link from "next/link";
import Avatar from "@/components/ui/Avatar/Avatar";
import { ArrowLeftIcon } from "@/components/ui/Icons";
import { lastSeen as formatLastSeen } from "@/lib/format";
import { useLastSeen, useOnlineUsers } from "@/lib/realtime";
import type { ChatMessage, DirectChat } from "@/types";
import MessageList from "./MessageList";
import Composer from "./Composer";
import QuickQuestions from "./QuickQuestions";
import { useI18n } from "@/i18n/client";
import { rich } from "@/i18n/rich";
import scss from "./Chat.module.scss";

type DirectWindowProps = {
  chat: DirectChat;
  messages: ChatMessage[];
  loading: boolean;
  currentUserId: string;
  onSend: (text: string) => Promise<boolean>;
  hasOlder: boolean;
  onLoadOlder: () => Promise<void>;
};

// Личный чат: собеседник в шапке, под именем — о каком проекте разговор
const DirectWindow = ({ chat, messages, loading, currentUserId, onSend, hasOlder, onLoadOlder }: DirectWindowProps) => {
  const online = useOnlineUsers().has(chat.other.id);
  const otherIsOwner = chat.other.id === chat.project.ownerId;
  const { t, locale } = useI18n();
  const seenAt = useLastSeen()(chat.other.id, chat.otherLastSeenAt);

  return (
    <div className={scss.window}>
      <header className={scss.windowHead}>
        <Link href="/chat" className={scss.back} aria-label={t.chat.back}>
          <ArrowLeftIcon />
        </Link>
        <span className={scss.memberAvatar}>
          <Avatar src={chat.other.avatarUrl} alt={chat.other.name} size={40} />
          <span className={`${scss.presence} ${online ? scss.presenceOnline : ""}`} />
        </span>
        <div className={scss.windowTitleBox}>
          <Link href={`/profile/${chat.other.id}`} className={scss.windowTitle}>
            {chat.other.name}
          </Link>
          <p className={scss.windowSubtitle}>
            {rich(otherIsOwner ? t.chat.ownerOf : t.chat.aboutProject, {
              project: (
                <Link href={`/projects/${chat.project.id}`} className={scss.subtitleLink}>
                  {chat.project.title}
                </Link>
              ),
            })}
          </p>
          {/* В сети — зелёным, иначе когда был в сети (нет данных — строки нет) */}
          {online ? (
            <p className={`${scss.windowStatus} ${scss.onlineText}`}>{t.chat.onlineOne}</p>
          ) : (
            seenAt && <p className={scss.windowStatus}>{t.chat.lastSeen(formatLastSeen(seenAt, locale))}</p>
          )}
        </div>
      </header>

      <MessageList
        messages={messages}
        loading={loading}
        ownerId={chat.project.ownerId}
        currentUserId={currentUserId}
        hasOlder={hasOlder}
        onLoadOlder={onLoadOlder}
        readAt={chat.otherReadAt}
        emptyText={otherIsOwner ? t.chat.askOwner : t.chat.noMessages}
      />
      {otherIsOwner && (
        <Suspense fallback={null}>
          <QuickQuestions
            projectId={chat.project.id}
            asked={messages.filter((m) => m.author?.id === currentUserId).map((m) => m.text)}
            onSend={onSend}
          />
        </Suspense>
      )}
      <Composer onSend={onSend} placeholder={t.chat.messageTo(chat.other.name.split(" ")[0])} />
    </div>
  );
};

export default DirectWindow;
