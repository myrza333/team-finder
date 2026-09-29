import Link from "next/link";
import Logo from "@/components/ui/Logo/Logo";
import scss from "./Footer.module.scss";

const columns = [
  {
    title: "Platform",
    links: [
      { label: "Projects", href: "/projects" },
      { label: "People", href: "/people" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Help", href: "#" },
      { label: "Community", href: "#" },
    ],
  },
  {
    title: "Connect",
    links: [
      { label: "GitHub", href: "#" },
      { label: "Telegram", href: "#" },
      { label: "Discord", href: "#" },
    ],
  },
];

const Footer = () => (
  <footer className={scss.footer}>
    <div className={scss.inner}>
      <div className={scss.top}>
        <div className={scss.brand}>
          <Logo size="sm" />
          <p className={scss.tagline}>Find people. Build projects.</p>
        </div>

        <div className={scss.columns}>
          {columns.map((col) => (
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
        <span>© 2026 TeamFinder. All rights reserved.</span>
        <div className={scss.legal}>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
