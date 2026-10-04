"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Logo from "@/components/ui/Logo/Logo";
import Button from "@/components/ui/Button/Button";
import SearchInput from "@/components/ui/SearchInput/SearchInput";
import { BellIcon, ChatIcon, CloseIcon, MenuIcon } from "@/components/ui/Icons";
import { useAuth } from "@/auth/useAuth";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useI18n } from "@/i18n/client";
import UserMenu from "./UserMenu";
import scss from "./Header.module.scss";

// На этих страницах есть свой поиск по списку — поле в хедере не дублируем
const pagesWithOwnSearch = ["/projects", "/people"];

type Panel = "menu" | "user" | null;

const navLinks = [
  { href: "/projects", key: "projects" },
  { href: "/people", key: "people" },
  { href: "/announcements", key: "announcements" },
] as const;

const Header = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { status, user, logout } = useAuth();
  const { t } = useI18n();
  const [search, setSearch] = useState("");

  // Открыта может быть только одна панель: мобильное меню или меню профиля
  const [panel, setPanel] = useState<Panel>(null);
  const headerRef = useRef<HTMLElement>(null);
  const togglePanel = (next: Exclude<Panel, null>) => setPanel((current) => (current === next ? null : next));
  const closePanel = () => setPanel(null);

  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setPanel(null);
  }

  useEffect(() => {
    if (!panel) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!headerRef.current?.contains(e.target as Node)) setPanel(null);
    };
    const onKeyDown = (e: KeyboardEvent) => e.key === "Escape" && setPanel(null);
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [panel]);

  const menuOpen = panel === "menu";

  // Точки на иконках. Обновляются сами: при событии из WebSocket эти запросы перечитываются (lib/realtime.ts)
  const loggedIn = status === "authenticated";
  const { data: unreadNotifications } = useQuery({
    queryKey: ["notifications", "unread"],
    queryFn: api.notifications.unreadCount,
    enabled: loggedIn,
  });
  const { data: chats } = useQuery({ queryKey: ["chats"], queryFn: api.chats.list, enabled: loggedIn });
  const { data: directs } = useQuery({ queryKey: ["direct-chats"], queryFn: api.direct.list, enabled: loggedIn });
  const hasUnread = (unreadNotifications?.count ?? 0) > 0;
  const hasUnreadMessages = [...(chats ?? []), ...(directs ?? [])].some((c) => c.unread > 0);

  const showSearch = !pagesWithOwnSearch.includes(pathname);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;
    router.push(`/search?q=${encodeURIComponent(search.trim())}`);
    closePanel();
  };

  const renderNavLink = (href: string, label: string) => (
    <Link
      key={href}
      href={href}
      className={`${scss.navLink} ${isActive(href) ? scss.active : ""}`}
      onClick={closePanel}
    >
      {label}
    </Link>
  );

  return (
    <header className={scss.header} ref={headerRef}>
      <div className={scss.inner}>
        <Logo />

        <nav className={scss.nav}>{navLinks.map((l) => renderNavLink(l.href, t.header[l.key]))}</nav>

        {showSearch && (
          <form onSubmit={handleSearch} className={scss.search}>
            <SearchInput
              size="md"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.header.searchPlaceholder}
              aria-label={t.header.search}
            />
          </form>
        )}

        <div className={scss.actions}>
          {/* Пока статус неизвестен (первый рендер) — пустое место, чтобы хедер не "мигал" */}
          {status === "loading" && <div className={scss.placeholder} />}

          {status === "guest" && (
            <div className={scss.guest}>
              <Button href="/login" variant="outline" className={scss.loginButton}>
                {t.header.logIn}
              </Button>
              <Button href="/register">{t.header.signUp}</Button>
            </div>
          )}

          {status === "authenticated" && user && (
            <>
              <Link href="/chat" className={scss.bell} aria-label={t.header.messages}>
                <ChatIcon />
                {hasUnreadMessages && <span className={scss.dot} />}
              </Link>
              <Link href="/notifications" className={scss.bell} aria-label={t.header.notifications}>
                <BellIcon />
                {hasUnread && <span className={scss.dot} />}
              </Link>
              <UserMenu
                user={user}
                open={panel === "user"}
                onToggle={() => togglePanel("user")}
                onClose={closePanel}
                onLogout={logout}
              />
            </>
          )}

          <button
            className={scss.burger}
            onClick={() => togglePanel("menu")}
            aria-label={menuOpen ? t.header.closeMenu : t.header.openMenu}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <>
          <div className={scss.backdrop} onClick={closePanel} aria-hidden />
          <div className={scss.mobileMenu}>
            {navLinks.map((l) => renderNavLink(l.href, t.header[l.key]))}
            {status === "authenticated" && renderNavLink("/chat", t.header.messages)}
            {status === "guest" && renderNavLink("/login", t.header.logIn)}
            {showSearch && (
              <form onSubmit={handleSearch}>
                <SearchInput
                  size="md"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t.header.searchShort}
                  aria-label={t.header.search}
                />
              </form>
            )}
          </div>
        </>
      )}
    </header>
  );
};

export default Header;
