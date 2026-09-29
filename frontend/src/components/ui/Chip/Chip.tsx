import scss from "./Chip.module.scss";

type ChipProps = {
  active?: boolean;
  // solid — активный залит основным цветом, soft — светлая подсветка
  variant?: "solid" | "soft";
  size?: "sm" | "md";
  onClick?: () => void;
  children: React.ReactNode;
};

// Переключаемая "таблетка": фильтры, выбор технологий и ролей
const Chip = ({ active, variant = "solid", size = "md", onClick, children }: ChipProps) => (
  <button
    type="button"
    aria-pressed={active}
    onClick={onClick}
    className={`${scss.chip} ${scss[variant]} ${scss[size]} ${active ? scss.active : ""}`}
  >
    {children}
  </button>
);

export const ChipList = ({ children }: { children: React.ReactNode }) => (
  <div className={scss.list}>{children}</div>
);

export default Chip;
