"use client";
import Link from "next/link";
import { ArrowLeftIcon, UsersIcon } from "@/components/ui/Icons";
import { useOnlineUsers } from "@/lib/realtime";
import type { ChatMessage, Project } from "@/types";
import MessageList from "./MessageList";
import Composer from "./Composer";
import scss from "./Chat.module.scss";
import ProjectIcon from "@/components/ui/ProjectIcon/ProjectIcon";
import { useI18n } from "@/i18n/client";

type ChatWindowProps = {
  project: Project;
  messages: ChatMessage[];
  loading: boolean;
  currentUserId: string;
  onSend: (text: string) => Promise<boolean>;
  hasOlder: boolean;
  onLoadOlder: () => Promise<void>;
  onOpenMembers: () => void;
};

// Центральная часть: шапка чата, лента сообщений, поле ввода
const ChatWindow = ({
  project,
  messages,
  loading,
  currentUserId,
  onSend,
  hasOlder,
  onLoadOlder,
  onOpenMembers,
}: ChatWindowProps) => {
  const onlineIds = useOnlineUsers();
  const { t } = useI18n();
  const online = project.members.filter((m) => onlineIds.has(m.id)).length;

  return (
    <div className={scss.window}>
      <header className={scss.windowHead}>
        {/* На телефоне — назад к списку чатов */}
        <Link href="/chat" className={scss.back} aria-label={t.chat.back}>
          <ArrowLeftIcon />
        </Link>
        <span className={scss.chatIcon}><ProjectIcon icon={project.icon} size={20} /></span>
        <div className={scss.windowTitleBox}>
          <Link href={`/projects/${project.id}`} className={scss.windowTitle}>
            {project.title}
          </Link>
          <p className={scss.windowSubtitle}>
            {t.common.members(project.members.length)} · <span className={scss.onlineText}>{t.chat.online(online)}</span>
          </p>
        </div>
        {/* Кнопка участников нужна только когда панель не помещается справа */}
        <button className={scss.membersButton} onClick={onOpenMembers} aria-label={t.chat.showMembers}>
          <UsersIcon />
          <span>{project.members.length}</span>
        </button>
      </header>

      <MessageList
        messages={messages}
        loading={loading}
        ownerId={project.owner.id}
        currentUserId={currentUserId}
        hasOlder={hasOlder}
        onLoadOlder={onLoadOlder}
      />
      <Composer onSend={onSend} placeholder={t.chat.messageTo(project.title)} />
    </div>
  );
};

export default ChatWindow;
