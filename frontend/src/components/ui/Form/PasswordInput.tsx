"use client";
import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "../Icons";
import { useI18n } from "@/i18n/client";
import scss from "./Form.module.scss";

type PasswordInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">;

// Поле пароля с кнопкой "показать / скрыть"
const PasswordInput = (props: PasswordInputProps) => {
  const [visible, setVisible] = useState(false);
  const { t } = useI18n();
  return (
    <div className={scss.passwordWrapper}>
      <input type={visible ? "text" : "password"} className={`${scss.control} ${scss.passwordInput}`} {...props} />
      <button
        type="button"
        className={scss.eye}
        onClick={() => setVisible(!visible)}
        aria-label={visible ? t.auth.hidePassword : t.auth.showPassword}
      >
        {visible ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
};

export default PasswordInput;
