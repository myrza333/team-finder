"use client";
import { Languages } from "lucide-react";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BellIcon, PaletteIcon, SettingsIcon, UserIcon } from "@/components/ui/Icons";
import { useI18n } from "@/i18n/client";
import scss from "./Settings.module.scss";

const ShieldIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
    <path d="M8 1.5l5 2v4c0 3.2-2.1 5.9-5 7-2.9-1.1-5-3.8-5-7v-4l5-2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);

const sections = [
  { href: "/settings/profile", key: "profile", icon: <UserIcon /> },
  { href: "/settings/account", key: "account", icon: <SettingsIcon /> },
  { href: "/settings/notifications", key: "notifications", icon: <BellIcon size={16} /> },
  { href: "/settings/privacy", key: "privacy", icon: <ShieldIcon /> },
  { href: "/settings/appearance", key: "appearance", icon: <PaletteIcon /> },
  { href: "/settings/language", key: "language", icon: <Languages size={16} strokeWidth={1.5} aria-hidden /> },
] as const;

// Меню разделов: столбик слева на десктопе, горизонтальная лента на телефоне
const SettingsNav = () => {
  const pathname = usePathname();
  const { t } = useI18n();
  const navRef = useRef<HTMLElement>(null);

  // На телефоне меню — горизонтальная лента: прокручиваем её к текущему разделу
  useEffect(() => {
    navRef.current?.querySelector('[aria-current="page"]')?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [pathname]);

  return (
    <nav ref={navRef} className={scss.nav} aria-label={t.settings.sections}>
      {sections.map((s) => (
        <Link
          key={s.href}
          href={s.href}
          className={`${scss.navLink} ${pathname === s.href ? scss.navActive : ""}`}
          aria-current={pathname === s.href ? "page" : undefined}
        >
          {s.icon}
          {t.settings.nav[s.key]}
        </Link>
      ))}
    </nav>
  );
};

export default SettingsNav;
