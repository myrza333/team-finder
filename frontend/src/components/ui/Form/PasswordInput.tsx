"use client";
import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "../Icons";
import scss from "./Form.module.scss";

type PasswordInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">;

// Поле пароля с кнопкой "показать / скрыть"
const PasswordInput = (props: PasswordInputProps) => {
  const [visible, setVisible] = useState(false);
  return (
    <div className={scss.passwordWrapper}>
      <input type={visible ? "text" : "password"} className={`${scss.control} ${scss.passwordInput}`} {...props} />
      <button
        type="button"
        className={scss.eye}
        onClick={() => setVisible(!visible)}
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
};

export default PasswordInput;
