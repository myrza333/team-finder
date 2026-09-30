"use client";
import Link from "next/link";
import Avatar from "@/components/ui/Avatar/Avatar";
import { ArrowLeftIcon } from "@/components/ui/Icons";
import { useOnlineUsers } from "@/lib/realtime";
import type { ChatMessage, DirectChat } from "@/types";
import MessageList from "./MessageList";
import Composer from "./Composer";
import scss from "./Chat.module.scss";

type DirectWindowProps = {
  chat: DirectChat;
  messages: ChatMessage[];
  loading: boolean;
  currentUserId: string;
  onSend: (text: string) => Promise<boolean>;
};

// Личный чат: собеседник в шапке, под именем — о каком проекте разговор
const DirectWindow = ({ chat, messages, loading, currentUserId, onSend }: DirectWindowProps) => {
  const online = useOnlineUsers().has(chat.other.id);
  const otherIsOwner = chat.other.id === chat.project.ownerId;

  return (
    <div className={scss.window}>
      <header className={scss.windowHead}>
        <Link href="/chat" className={scss.back} aria-label="Back to chats">
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
            {otherIsOwner ? "Owner of " : "About "}
            <Link href={`/projects/${chat.project.id}`} className={scss.subtitleLink}>
              {chat.project.title}
            </Link>
            {online && (
              <>
                {" "}
                · <span className={scss.onlineText}>online</span>
              </>
            )}
          </p>
        </div>
      </header>

      <MessageList
        messages={messages}
        loading={loading}
        ownerId={chat.project.ownerId}
        currentUserId={currentUserId}
        emptyText={otherIsOwner ? "Ask anything about the project before you apply" : "No messages yet"}
      />
      <Composer onSend={onSend} placeholder={`Message ${chat.other.name.split(" ")[0]}`} />
    </div>
  );
};

export default DirectWindow;
