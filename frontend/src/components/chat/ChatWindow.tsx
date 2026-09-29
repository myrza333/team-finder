"use client";
import Link from "next/link";
import { ArrowLeftIcon, UsersIcon } from "@/components/ui/Icons";
import { onlineUserIds } from "@/data/chat";
import type { ChatMessage, Project } from "@/types";
import MessageList from "./MessageList";
import Composer from "./Composer";
import scss from "./Chat.module.scss";

type ChatWindowProps = {
  project: Project;
  messages: ChatMessage[];
  onSend: (text: string) => void;
  onOpenMembers: () => void;
};

// Центральная часть: шапка чата, лента сообщений, поле ввода
const ChatWindow = ({ project, messages, onSend, onOpenMembers }: ChatWindowProps) => {
  const online = project.members.filter((m) => onlineUserIds.has(m.id)).length;

  return (
    <div className={scss.window}>
      <header className={scss.windowHead}>
        {/* На телефоне — назад к списку чатов */}
        <Link href="/chat" className={scss.back} aria-label="Back to chats">
          <ArrowLeftIcon />
        </Link>
        <span className={scss.chatIcon}>{project.icon}</span>
        <div className={scss.windowTitleBox}>
          <Link href={`/projects/${project.id}`} className={scss.windowTitle}>
            {project.title}
          </Link>
          <p className={scss.windowSubtitle}>
            {project.members.length} members · <span className={scss.onlineText}>{online} online</span>
          </p>
        </div>
        {/* Кнопка участников нужна только когда панель не помещается справа */}
        <button className={scss.membersButton} onClick={onOpenMembers} aria-label="Show members">
          <UsersIcon />
          <span>{project.members.length}</span>
        </button>
      </header>

      <MessageList messages={messages} ownerId={project.owner.id} />
      <Composer onSend={onSend} placeholder={`Message ${project.title}`} />
    </div>
  );
};

export default ChatWindow;
