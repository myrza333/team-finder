import Link from "next/link";
import scss from "./Button.module.scss";

type BaseProps = {
  variant?: "primary" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  className?: string;
  children: React.ReactNode;
};

// Если передан href — рендерится ссылка, иначе обычная кнопка
type ButtonProps = BaseProps &
  (
    | ({ href: string } & Omit<React.ComponentProps<typeof Link>, "className" | "children">)
    | ({ href?: undefined } & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">)
  );

const Button = ({
  variant = "primary",
  size = "md",
  fullWidth,
  className,
  children,
  ...rest
}: ButtonProps) => {
  const classes = [scss.button, scss[variant], scss[size], fullWidth && scss.fullWidth, className]
    .filter(Boolean)
    .join(" ");

  if (rest.href !== undefined) {
    return (
      <Link className={classes} {...(rest as React.ComponentProps<typeof Link>)}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={classes}
      {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  );
};

export default Button;
