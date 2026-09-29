import Link from "next/link";
import scss from "./SectionHeader.module.scss";

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  link?: { label: string; href: string }; // "View all →" справа
};

// Заголовок секции со ссылкой справа (главная, поиск)
const SectionHeader = ({ title, subtitle, link }: SectionHeaderProps) => (
  <div className={scss.header}>
    <div>
      <h2 className={scss.title}>{title}</h2>
      {subtitle && <p className={scss.subtitle}>{subtitle}</p>}
    </div>
    {link && (
      <Link href={link.href} className={scss.link}>
        {link.label}
      </Link>
    )}
  </div>
);

export default SectionHeader;
