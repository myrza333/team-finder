import scss from "./Form.module.scss";

// Подпись + поле. htmlFor связывает label с полем (клик по подписи ставит фокус)
type FieldProps = {
  label: string;
  htmlFor?: string;
  hint?: React.ReactNode; // доп. элемент справа от подписи
  children: React.ReactNode;
};

export const Field = ({ label, htmlFor, hint, children }: FieldProps) => (
  <div className={scss.field}>
    <div className={scss.labelRow}>
      <label htmlFor={htmlFor} className={scss.label}>
        {label}
      </label>
      {hint}
    </div>
    {children}
  </div>
);

export const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input className={scss.control} {...props} />
);

export const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea className={`${scss.control} ${scss.textarea}`} {...props} />
);

export const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select className={`${scss.control} ${scss.select}`} {...props} />
);

// Поле с неизменяемой приставкой слева: [github.com/][username]
export const PrefixInput = ({
  prefix,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { prefix: string }) => (
  <div className={scss.prefixGroup}>
    <span className={scss.prefix}>{prefix}</span>
    <input className={`${scss.control} ${scss.prefixControl}`} {...props} />
  </div>
);

// Подсказка / ошибка под полем
export const Hint = ({ children, error }: { children: React.ReactNode; error?: boolean }) => (
  <p className={`${scss.hint} ${error ? scss.error : ""}`}>{children}</p>
);
