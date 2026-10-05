import Link from "next/link";
import { siGithub, siTelegram, siVercel } from "simple-icons";
import Logo from "@/components/ui/Logo/Logo";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher/LanguageSwitcher";
import { getI18n } from "@/i18n/server";
import type { Dictionary } from "@/i18n/dictionaries";
import { contacts } from "@/lib/contacts";
import scss from "./Footer.module.scss";

type FooterLink = { label: string; href: string; icon?: string }; // icon — путь логотипа из Simple Icons, ссылка внешняя

const columns = (t: Dictionary["footer"]): { title: string; links: FooterLink[] }[] => [
  {
    title: t.platform,
    links: [
      { label: t.projects, href: "/projects" },
      { label: t.people, href: "/people" },
    ],
  },
  {
    title: t.company,
    links: [
      { label: t.about, href: "/about" },
      { label: t.help, href: "/help" },
    ],
  },
  {
    title: t.connect,
    links: [
      { label: "GitHub", href: contacts.github, icon: siGithub.path },
      { label: "Telegram", href: contacts.telegram, icon: siTelegram.path },
      { label: "Vercel", href: contacts.vercel, icon: siVercel.path },
    ],
  },
];

const Footer = async () => {
  const { t } = await getI18n();
  return (
    <footer className={scss.footer}>
      <div className={scss.inner}>
        <div className={scss.top}>
          <div className={scss.brand}>
            <Logo size="sm" />
            <p className={scss.tagline}>{t.footer.tagline}</p>
          </div>

          <div className={scss.columns}>
            {columns(t.footer).map((col) => (
              <div key={col.title}>
                <p className={scss.colTitle}>{col.title}</p>
                <ul className={scss.links}>
                  {col.links.map((link) => (
                    <li key={link.label}>
                      {link.icon ? (
                        <a href={link.href} target="_blank" rel="noopener noreferrer" className={scss.link}>
                          <svg viewBox="0 0 24 24" width={14} height={14} fill="currentColor" aria-hidden>
                            <path d={link.icon} />
                          </svg>
                          {link.label}
                        </a>
                      ) : (
                        <Link href={link.href} className={scss.link}>
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className={scss.bottom}>
          <span>{t.footer.rights}</span>
          <LanguageSwitcher />
          <div className={scss.legal}>
            <Link href="/privacy">{t.footer.privacy}</Link>
            <Link href="/terms">{t.footer.terms}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
