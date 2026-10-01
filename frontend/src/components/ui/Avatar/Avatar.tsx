"use client";

import { User } from "lucide-react";
import { useState } from "react";
import scss from "./Avatar.module.scss";

type AvatarProps = {
  src: string | null; // null — фото нет
  alt?: string;
  size?: number; // px
  bordered?: boolean; // белая обводка — для стопки аватаров
};

// Фото человека. Нет фото (или оно не загрузилось) — нейтральный силуэт в сером кружке,
// нарисованный иконкой: подстраивается под светлую и тёмную тему
const Avatar = ({ src, alt = "", size = 32, bordered }: AvatarProps) => {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const className = `${scss.avatar} ${bordered ? scss.bordered : ""}`;

  if (!src || failedSrc === src) {
    return (
      <span
        className={`${className} ${scss.placeholder}`}
        style={{ width: size, height: size }}
        role={alt ? "img" : undefined}
        aria-label={alt || undefined}
        aria-hidden={alt ? undefined : true}
      >
        <User size={Math.round(size * 0.55)} strokeWidth={1.75} aria-hidden />
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- внешние и загруженные аватарки, next/image тут не нужен
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      // Google не отдаёт фото профиля, если в запросе есть Referer чужого сайта
      referrerPolicy="no-referrer"
      onError={() => setFailedSrc(src)}
      className={className}
      style={{ width: size, height: size }}
    />
  );
};

export const AvatarStack = ({ children }: { children: React.ReactNode }) => (
  <div className={scss.stack}>{children}</div>
);

export default Avatar;
