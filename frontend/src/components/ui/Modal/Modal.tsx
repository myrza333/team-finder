"use client";
import { useEffect, useRef } from "react";
import { CloseIcon } from "@/components/ui/Icons";
import { useI18n } from "@/i18n/client";
import scss from "./Modal.module.scss";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
};

// Окно поверх страницы на встроенном <dialog>: браузер сам закрывает его по Escape,
// держит фокус внутри и не даёт кликать по странице под ним
const Modal = ({ open, onClose, title, children }: ModalProps) => {
  const ref = useRef<HTMLDialogElement>(null);
  const { t } = useI18n();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={scss.dialog}
      onClose={onClose}
      // Клик по затемнению вокруг окна — закрыть
      onClick={(e) => e.target === e.currentTarget && onClose()}
      aria-labelledby="modal-title"
    >
      <div className={scss.body}>
        <div className={scss.head}>
          <h2 id="modal-title" className={scss.title}>
            {title}
          </h2>
          <button type="button" className={scss.close} onClick={onClose} aria-label={t.common.close}>
            <CloseIcon />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
};

export default Modal;
