import type { LucideIcon } from "lucide-react";
import scss from "./EmptyState.module.scss";

type EmptyStateProps = { icon: LucideIcon; text: string };

// Пустой список: иконка в кружке + пояснение
const EmptyState = ({ icon: Icon, text }: EmptyStateProps) => (
  <div className={scss.empty}>
    <div className={scss.icon}>
      <Icon size={24} strokeWidth={1.75} aria-hidden />
    </div>
    <p className={scss.text}>{text}</p>
  </div>
);

export default EmptyState;
