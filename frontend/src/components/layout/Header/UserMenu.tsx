"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Avatar from "@/components/ui/Avatar/Avatar";
import { ChevronDownIcon, LogoutIcon, SettingsIcon, UserIcon } from "@/components/ui/Icons";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useI18n } from "@/i18n/client";
import type { User } from "@/types";
import scss from "./Header.module.scss";

type UserMenuProps = {
  user: User;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  onLogout: () => void;
};

const FolderIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
    <path
      d="M1.75 4.25a1 1 0 011-1h3.5l1.5 1.5h5.5a1 1 0 011 1v6.5a1 1 0 01-1 1H2.75a1 1 0 01-1-1v-8z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);

const InboxIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
    <path
      d="M1.75 9.25l1.9-5.1a1 1 0 01.94-.65h6.82a1 1 0 01.94.65l1.9 5.1v3a1 1 0 01-1 1H2.75a1 1 0 01-1-1v-3z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path
      d="M1.75 9.25h3.5l1 1.5h3.5l1-1.5h3.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);

// Аватар в хедере + выпадающее меню (профиль, проекты, заявки, настройки, выход)
const UserMenu = ({ user, open, onToggle, onClose, onLogout }: UserMenuProps) => {
  const router = useRouter();
  const { t } = useI18n();
  const { data: pending } = useQuery({ queryKey: ["applications", "pending-counts"], queryFn: api.applications.pendingCounts });
  const newApplications = pending?.total ?? 0;
  const handleLogout = () => {
    onClose();
    onLogout();
    router.push("/");
  };

  return (
    <div className={scss.userMenu}>
      <button className={scss.user} onClick={onToggle} aria-haspopup="menu" aria-expanded={open}>
        <Avatar src={user.avatarUrl} alt={user.name} size={32} />
        <span className={scss.userName}>{user.name.split(" ")[0]}</span>
        <ChevronDownIcon className={`${scss.chevron} ${open ? scss.chevronOpen : ""}`} />
      </button>

      {open && (
        <div className={scss.dropdown} role="menu">
          <div className={scss.dropdownHead}>
            <p className={scss.dropdownName}>{user.name}</p>
            <p className={scss.dropdownTitle}>{user.title}</p>
          </div>
          <Link href={`/profile/${user.id}`} className={scss.dropdownItem} role="menuitem" onClick={onClose}>
            <UserIcon /> {t.header.myProfile}
          </Link>
          <Link href="/my-projects" className={scss.dropdownItem} role="menuitem" onClick={onClose}>
            <FolderIcon /> {t.header.myProjects}
          </Link>
          <Link href="/applications" className={scss.dropdownItem} role="menuitem" onClick={onClose}>
            <InboxIcon /> {t.header.applications}
            {newApplications > 0 && <span className={scss.dropdownCount}>{newApplications}</span>}
          </Link>
          <Link href="/settings" className={scss.dropdownItem} role="menuitem" onClick={onClose}>
            <SettingsIcon /> {t.header.settings}
          </Link>
          <div className={scss.dropdownDivider} />
          <button className={`${scss.dropdownItem} ${scss.danger}`} role="menuitem" onClick={handleLogout}>
            <LogoutIcon /> {t.header.logOut}
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
