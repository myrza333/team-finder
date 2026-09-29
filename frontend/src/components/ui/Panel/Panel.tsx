import scss from "./Panel.module.scss";

type PanelProps = {
  title?: string;
  // md — основные блоки (p 24px), sm — боковые колонки (p 20px, мелкий заголовок)
  size?: "sm" | "md";
  className?: string;
  children: React.ReactNode;
};

// Белый блок с заголовком: "About project", "Tech stack", "Skills"...
const Panel = ({ title, size = "md", className, children }: PanelProps) => (
  <section className={`${scss.panel} ${scss[size]} ${className ?? ""}`}>
    {title && <h2 className={scss.title}>{title}</h2>}
    {children}
  </section>
);

export default Panel;
