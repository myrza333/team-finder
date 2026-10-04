"use client";
import Link from "next/link";
import { useI18n } from "@/i18n/client";
import { LogoMarkIcon } from "../Icons";
import scss from "./Logo.module.scss";

// sm — футер, md — хедер, lg — страницы входа
type LogoProps = { size?: "sm" | "md" | "lg" };

const Logo = ({ size = "md" }: LogoProps) => {
  const { t } = useI18n();
  return (
    <Link href="/" className={`${scss.logo} ${scss[size]}`} aria-label={t.header.home}>
      <span className={scss.mark}>
        <LogoMarkIcon size={size === "sm" ? 14 : 18} />
      </span>
      <span className={scss.text}>TeamFinder</span>
    </Link>
  );
};

export default Logo;
