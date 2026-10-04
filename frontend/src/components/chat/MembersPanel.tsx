"use client";
import { useEffect } from "react";
import Link from "next/link";
import Avatar from "@/components/ui/Avatar/Avatar";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";
import { CloseIcon } from "@/components/ui/Icons";
import { useOnlineUsers } from "@/lib/realtime";
import type { Project } from "@/types";
import { useI18n } from "@/i18n/client";
import scss from "./Chat.module.scss";

type MembersPanelProps = {
  project: Project;
  currentUserId: string;
  open: boolean; // для шторки на узких экранах; на широких панель видна всегда
  onClose: () => void;
};

// Правая колонка: участники команды, владелец первым, онлайн — выше офлайн
const MembersPanel = ({ project, currentUserId, open, onClose }: MembersPanelProps) => {
  const onlineUserIds = useOnlineUsers();
  const { t } = useI18n();
  const isOwner = project.owner.id === currentUserId;
  const members = [...project.members].sort((a, b) => {
    if (a.id === project.owner.id) return -1;
    if (b.id === project.owner.id) return 1;
    return Number(onlineUserIds.has(b.id)) - Number(onlineUserIds.has(a.id));
  });

  // Шторка закрывается по Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      {open && <div className={scss.overlay} onClick={onClose} aria-hidden />}
      <aside className={`${scss.members} ${open ? scss.membersOpen : ""}`} aria-label={t.chat.teamMembers}>
        <div className={scss.membersHead}>
          <h2 className={scss.membersTitle}>{t.chat.membersCount(project.members.length)}</h2>
          <button className={scss.closeMembers} onClick={onClose} aria-label={t.chat.closeMembers}>
            <CloseIcon />
          </button>
        </div>

        <ul className={scss.memberList}>
          {members.map((m) => {
            const online = onlineUserIds.has(m.id);
            return (
              <li key={m.id}>
                <Link href={`/profile/${m.id}`} className={scss.member}>
                  <span className={scss.memberAvatar}>
                    <Avatar src={m.avatarUrl} alt={m.name} size={36} />
                    <span className={`${scss.presence} ${online ? scss.presenceOnline : ""}`} />
                  </span>
                  <div className={scss.memberText}>
                    <p className={scss.memberName}>{m.name}</p>
                    <p className={scss.memberTitle}>
                      {[m.id === currentUserId && t.chat.you, online ? t.chat.onlineStatus : m.title].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  {m.id === project.owner.id && <StatusBadge status="owner" />}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className={scss.membersFooter}>
          {isOwner ? (
            <Link href={`/my-projects/${project.id}`} className={scss.membersLink}>
              {t.chat.manageTeam}
            </Link>
          ) : (
            <Link href={`/projects/${project.id}`} className={scss.membersLink}>
              {t.chat.viewProject}
            </Link>
          )}
        </div>
      </aside>
    </>
  );
};

export default MembersPanel;
