"use client";
import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import Button from "@/components/ui/Button/Button";
import { useI18n } from "@/i18n/client";
import scss from "./Settings.module.scss";

// Блок настроек: заголовок + пояснение + содержимое
export const SettingsSection = ({
  title,
  description,
  danger,
  children,
}: {
  title: string;
  description?: string;
  danger?: boolean;
  children: React.ReactNode;
}) => (
  <section className={`${scss.section} ${danger ? scss.dangerSection : ""}`}>
    <div className={scss.sectionHead}>
      <h2 className={scss.sectionTitle}>{title}</h2>
      {description && <p className={scss.sectionDescription}>{description}</p>}
    </div>
    {children}
  </section>
);

// Строка "название + пояснение ...... переключатель/кнопка"
export const SettingRow = ({
  title,
  description,
  children,
}: {
  title: React.ReactNode;
  description?: string;
  children?: React.ReactNode;
}) => (
  <div className={scss.row}>
    <div className={scss.rowText}>
      <p className={scss.rowTitle}>{title}</p>
      {description && <p className={scss.rowDescription}>{description}</p>}
    </div>
    {children && <div className={scss.rowControl}>{children}</div>}
  </div>
);

// Состояние формы настроек: что было сохранено, что изменено, показать "Saved"
export const useSettingsForm = <T,>(initial: T, onSave?: (value: T) => Promise<unknown>) => {
  const { t } = useI18n();
  const [saved, setSaved] = useState(initial);
  const [value, setValue] = useState(initial);
  const [justSaved, setJustSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDirty = JSON.stringify(saved) !== JSON.stringify(value);

  useEffect(() => {
    if (!justSaved) return;
    const t = setTimeout(() => setJustSaved(false), 2500);
    return () => clearTimeout(t);
  }, [justSaved]);

  return {
    value,
    setValue,
    isDirty,
    justSaved,
    saving,
    error,
    save: async () => {
      setSaving(true);
      setError(null);
      try {
        await onSave?.(value);
        setSaved(value);
        setJustSaved(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : t.common.somethingWrong);
      } finally {
        setSaving(false);
      }
    },
    reset: () => {
      setValue(saved);
      setError(null);
    },
  };
};

// Нижняя панель "Cancel / Save changes"
export const SaveBar = ({
  isDirty,
  justSaved,
  saving = false,
  error = null,
  invalid = false,
  onSave,
  onReset,
}: {
  isDirty: boolean;
  justSaved: boolean;
  saving?: boolean;
  error?: string | null;
  invalid?: boolean; // в форме ошибка (подсвечена у поля) — сохранять нельзя
  onSave: () => void;
  onReset: () => void;
}) => {
  const { t } = useI18n();
  return (
    <div className={scss.saveBar}>
      <span className={`${scss.saveStatus} ${error ? scss.saveError : ""}`} aria-live="polite">
        {error ??
          (justSaved ? (
            <>
              <Check size={14} strokeWidth={2} aria-hidden /> {t.settings.saved}
            </>
          ) : isDirty ? (
            t.settings.unsaved
          ) : (
            ""
          ))}
      </span>
      <div className={scss.saveActions}>
        <Button variant="outline" onClick={onReset} disabled={!isDirty || saving}>
          {t.common.cancel}
        </Button>
        <Button onClick={onSave} disabled={!isDirty || saving || invalid}>
          {saving ? t.common.saving : t.common.saveChanges}
        </Button>
      </div>
    </div>
  );
};
