import {
  Blocks,
  Brain,
  Bug,
  ChartColumn,
  Cloud,
  Cpu,
  Gamepad2,
  Infinity as InfinityIcon,
  Layers,
  type LucideIcon,
  Monitor,
  PenTool,
  Server,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

// Направления человека ("стек"). Тот же список разрешает бэкенд — STACKS в backend/src/users/dto/user.dto.ts.
// Skills — конкретные языки и технологии, stack — чем человек занимается в целом
export const stacks: { name: string; Icon: LucideIcon }[] = [
  { name: "Frontend", Icon: Monitor },
  { name: "Backend", Icon: Server },
  { name: "Fullstack", Icon: Layers },
  { name: "Mobile", Icon: Smartphone },
  { name: "DevOps", Icon: InfinityIcon },
  { name: "Cloud", Icon: Cloud },
  { name: "Data Science", Icon: ChartColumn },
  { name: "Machine Learning", Icon: Brain },
  { name: "Game Development", Icon: Gamepad2 },
  { name: "UI/UX Design", Icon: PenTool },
  { name: "QA / Testing", Icon: Bug },
  { name: "Embedded", Icon: Cpu },
  { name: "Cybersecurity", Icon: ShieldCheck },
  { name: "Blockchain", Icon: Blocks },
];

export const MAX_STACKS = 4;

export const stackIcon = (name: string) => stacks.find((s) => s.name === name)?.Icon ?? Layers;
