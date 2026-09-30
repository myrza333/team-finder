import {
  BookOpen,
  Bot,
  Code,
  Gamepad2,
  GraduationCap,
  HeartPulse,
  Music,
  Palette,
  Rocket,
  ShoppingCart,
  Smartphone,
  Sprout,
  type LucideIcon,
} from "lucide-react";

// Иконки проектов. В базе (projects.icon) хранится ключ, например "education".
// Тот же список разрешает бэкенд — PROJECT_ICONS в backend/src/projects/dto/project.dto.ts
export const projectIcons = {
  rocket: { Icon: Rocket, label: "Rocket" },
  education: { Icon: GraduationCap, label: "Education" },
  code: { Icon: Code, label: "Code" },
  nature: { Icon: Sprout, label: "Nature" },
  health: { Icon: HeartPulse, label: "Health" },
  games: { Icon: Gamepad2, label: "Games" },
  books: { Icon: BookOpen, label: "Books" },
  mobile: { Icon: Smartphone, label: "Mobile" },
  design: { Icon: Palette, label: "Design" },
  ai: { Icon: Bot, label: "AI" },
  music: { Icon: Music, label: "Music" },
  shop: { Icon: ShoppingCart, label: "Shop" },
} satisfies Record<string, { Icon: LucideIcon; label: string }>;

export type ProjectIconKey = keyof typeof projectIcons;

export const projectIconKeys = Object.keys(projectIcons) as ProjectIconKey[];

type ProjectIconProps = { icon: string; size?: number; className?: string };

// Неизвестный ключ (например, старые данные) — ракета
const ProjectIcon = ({ icon, size = 24, className }: ProjectIconProps) => {
  const { Icon } = projectIcons[icon as ProjectIconKey] ?? projectIcons.rocket;
  return <Icon size={size} strokeWidth={1.75} className={className} aria-hidden />;
};

export default ProjectIcon;
