import Link from "next/link";
import { LogoMarkIcon } from "../Icons";
import scss from "./Logo.module.scss";

// sm — футер, md — хедер, lg — страницы входа
type LogoProps = { size?: "sm" | "md" | "lg" };

const Logo = ({ size = "md" }: LogoProps) => (
  <Link href="/" className={`${scss.logo} ${scss[size]}`} aria-label="TeamFinder — home">
    <span className={scss.mark}>
      <LogoMarkIcon size={size === "sm" ? 14 : 18} />
    </span>
    <span className={scss.text}>TeamFinder</span>
  </Link>
);

export default Logo;
