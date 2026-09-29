import scss from "./PageHeader.module.scss";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  action?: React.ReactNode; // кнопка справа, например "+ Create project"
};

const PageHeader = ({ title, subtitle, action }: PageHeaderProps) => (
  <div className={scss.header}>
    <div>
      <h1 className={scss.title}>{title}</h1>
      {subtitle && <p className={scss.subtitle}>{subtitle}</p>}
    </div>
    {action}
  </div>
);

export default PageHeader;
