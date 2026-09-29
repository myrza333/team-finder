"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BellIcon, PaletteIcon, SettingsIcon, UserIcon } from "@/components/ui/Icons";
import scss from "./Settings.module.scss";

const ShieldIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
    <path d="M8 1.5l5 2v4c0 3.2-2.1 5.9-5 7-2.9-1.1-5-3.8-5-7v-4l5-2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);

const sections = [
  { href: "/settings/profile", label: "Profile", icon: <UserIcon /> },
  { href: "/settings/account", label: "Account", icon: <SettingsIcon /> },
  { href: "/settings/notifications", label: "Notifications", icon: <BellIcon size={16} /> },
  { href: "/settings/privacy", label: "Privacy", icon: <ShieldIcon /> },
  { href: "/settings/appearance", label: "Appearance", icon: <PaletteIcon /> },
];

// Меню разделов: столбик слева на десктопе, горизонтальная лента на телефоне
const SettingsNav = () => {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);

  // На телефоне меню — горизонтальная лента: прокручиваем её к текущему разделу
  useEffect(() => {
    navRef.current?.querySelector('[aria-current="page"]')?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [pathname]);

  return (
    <nav ref={navRef} className={scss.nav} aria-label="Settings sections">
      {sections.map((s) => (
        <Link
          key={s.href}
          href={s.href}
          className={`${scss.navLink} ${pathname === s.href ? scss.navActive : ""}`}
          aria-current={pathname === s.href ? "page" : undefined}
        >
          {s.icon}
          {s.label}
        </Link>
      ))}
    </nav>
  );
};

export default SettingsNav;
