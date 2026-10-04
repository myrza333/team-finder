import Link from "next/link";
import Logo from "@/components/ui/Logo/Logo";
import { getI18n } from "@/i18n/server";
import type { Dictionary } from "@/i18n/dictionaries";
import scss from "./Footer.module.scss";

const columns = (t: Dictionary["footer"]) => [
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
      { label: t.about, href: "#" },
      { label: t.help, href: "#" },
      { label: t.community, href: "#" },
    ],
  },
  {
    title: t.connect,
    links: [
      { label: "GitHub", href: "#" },
      { label: "Telegram", href: "#" },
      { label: "Discord", href: "#" },
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
                      <Link href={link.href} className={scss.link}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className={scss.bottom}>
          <span>{t.footer.rights}</span>
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
