"use client";
import Link from "next/link";
import { ArrowLeftIcon, UsersIcon } from "@/components/ui/Icons";
import { useOnlineUsers } from "@/lib/realtime";
import type { ChatMessage, Project } from "@/types";
import MessageList from "./MessageList";
import Composer from "./Composer";
import scss from "./Chat.module.scss";
import ProjectIcon from "@/components/ui/ProjectIcon/ProjectIcon";

type ChatWindowProps = {
  project: Project;
  messages: ChatMessage[];
  loading: boolean;
  currentUserId: string;
  onSend: (text: string) => Promise<boolean>;
  onOpenMembers: () => void;
};

// Центральная часть: шапка чата, лента сообщений, поле ввода
const ChatWindow = ({ project, messages, loading, currentUserId, onSend, onOpenMembers }: ChatWindowProps) => {
  const onlineIds = useOnlineUsers();
  const online = project.members.filter((m) => onlineIds.has(m.id)).length;

  return (
    <div className={scss.window}>
      <header className={scss.windowHead}>
        {/* На телефоне — назад к списку чатов */}
        <Link href="/chat" className={scss.back} aria-label="Back to chats">
          <ArrowLeftIcon />
        </Link>
        <span className={scss.chatIcon}><ProjectIcon icon={project.icon} size={20} /></span>
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

      <MessageList messages={messages} loading={loading} ownerId={project.owner.id} currentUserId={currentUserId} />
      <Composer onSend={onSend} placeholder={`Message ${project.title}`} />
    </div>
  );
};

export default ChatWindow;
