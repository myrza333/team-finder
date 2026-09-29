"use client";

import { useState } from "react";
import scss from "./Avatar.module.scss";

type AvatarProps = {
  src: string;
  alt?: string;
  size?: number; // px
  bordered?: boolean; // белая обводка — для стопки аватаров
};

// Если картинка не загрузилась — нейтральный силуэт вместо сломанной картинки с текстом alt
const FALLBACK_AVATAR = "/avatar-placeholder.svg";

const Avatar = ({ src, alt = "", size = 32, bordered }: AvatarProps) => {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const shown = failedSrc === src ? FALLBACK_AVATAR : src;

  return (
    // eslint-disable-next-line @next/next/no-img-element -- внешние и загруженные аватарки, next/image тут не нужен
    <img
      src={shown}
      alt={alt}
      width={size}
      height={size}
      // Google не отдаёт фото профиля, если в запросе есть Referer чужого сайта
      referrerPolicy="no-referrer"
      onError={() => setFailedSrc(src)}
      className={`${scss.avatar} ${bordered ? scss.bordered : ""}`}
      style={{ width: size, height: size }}
    />
  );
};

export const AvatarStack = ({ children }: { children: React.ReactNode }) => (
  <div className={scss.stack}>{children}</div>
);

export default Avatar;
