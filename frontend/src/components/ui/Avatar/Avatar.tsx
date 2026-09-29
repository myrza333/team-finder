import scss from "./Avatar.module.scss";

type AvatarProps = {
  src: string;
  alt?: string;
  size?: number; // px
  bordered?: boolean; // белая обводка — для стопки аватаров
};

const Avatar = ({ src, alt = "", size = 32, bordered }: AvatarProps) => (
  // eslint-disable-next-line @next/next/no-img-element -- внешние SVG-аватарки, next/image тут не нужен
  <img
    src={src}
    alt={alt}
    width={size}
    height={size}
    className={`${scss.avatar} ${bordered ? scss.bordered : ""}`}
    style={{ width: size, height: size }}
  />
);

export const AvatarStack = ({ children }: { children: React.ReactNode }) => (
  <div className={scss.stack}>{children}</div>
);

export default Avatar;
