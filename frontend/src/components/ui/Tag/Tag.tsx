import scss from "./Tag.module.scss";

type TagProps = {
  // gray — стек/технологии, primary — навыки и вакансии
  variant?: "gray" | "primary";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
};

const Tag = ({ variant = "gray", size = "sm", children }: TagProps) => (
  <span className={`${scss.tag} ${scss[variant]} ${scss[size]}`}>{children}</span>
);

export const TagList = ({
  children,
  center,
}: {
  children: React.ReactNode;
  center?: boolean;
}) => <div className={`${scss.list} ${center ? scss.center : ""}`}>{children}</div>;

export default Tag;
