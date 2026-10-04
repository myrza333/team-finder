import { siCodewars, siGithub, siInstagram, siLeetcode, siTelegram } from "simple-icons";
import type { SocialKey } from "@/lib/socials";
import scss from "./SocialIcon.module.scss";

// Логотипы — из набора Simple Icons (лицензия CC0). LinkedIn из набора убрали, его значок нарисован тут
const paths: Record<Exclude<SocialKey, "linkedinUrl">, string> = {
  githubUrl: siGithub.path,
  telegramUrl: siTelegram.path,
  instagramUrl: siInstagram.path,
  codewarsUrl: siCodewars.path,
  leetcodeUrl: siLeetcode.path,
};

// Квадрат со скруглёнными углами и прорезанными буквами "in" (одним контуром, как остальные логотипы)
const linkedinPath =
  "M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z";

type SocialIconProps = {
  social: SocialKey;
  size?: number;
  branded?: boolean; // фирменный цвет; без него — цвет текста вокруг (currentColor)
  className?: string;
};

const SocialIcon = ({ social, size = 18, branded = true, className }: SocialIconProps) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="currentColor"
    className={[branded && scss[social], className].filter(Boolean).join(" ")}
    aria-hidden
  >
    <path d={social === "linkedinUrl" ? linkedinPath : paths[social]} />
  </svg>
);

export default SocialIcon;
