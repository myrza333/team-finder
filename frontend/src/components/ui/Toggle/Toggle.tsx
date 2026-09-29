import scss from "./Toggle.module.scss";

type ToggleProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string; // для screen reader, визуально не показывается
  disabled?: boolean;
};

// Переключатель вкл/выкл (switch)
const Toggle = ({ checked, onChange, label, disabled }: ToggleProps) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    disabled={disabled}
    onClick={() => onChange(!checked)}
    className={`${scss.toggle} ${checked ? scss.on : ""}`}
  >
    <span className={scss.thumb} />
  </button>
);

export default Toggle;
