"use client";
import { MonitorIcon, MoonIcon, SunIcon } from "@/components/ui/Icons";
import { useTheme, type ThemePreference } from "@/lib/useTheme";
import { SettingsSection } from "./SettingsParts";
import { useI18n } from "@/i18n/client";
import scss from "./AppearanceSettings.module.scss";

const options: { value: ThemePreference; icon: React.ReactNode }[] = [
  { value: "light", icon: <SunIcon size={16} /> },
  { value: "dark", icon: <MoonIcon size={16} /> },
  { value: "system", icon: <MonitorIcon size={16} /> },
];

// Мини-копия интерфейса: хедер, боковая колонка и карточка с кнопкой
const Preview = ({ variant }: { variant: "light" | "dark" }) => (
  <div className={`${scss.preview} ${scss[variant]}`} aria-hidden>
    <div className={scss.previewHeader}>
      <span className={scss.previewLogo} />
      <span className={scss.previewLine} style={{ width: "22%" }} />
      <span className={scss.previewAvatar} />
    </div>
    <div className={scss.previewBody}>
      <div className={scss.previewSidebar}>
        <span className={`${scss.previewLine} ${scss.previewActive}`} />
        <span className={scss.previewLine} />
        <span className={scss.previewLine} style={{ width: "70%" }} />
      </div>
      <div className={scss.previewCard}>
        <span className={scss.previewTitle} />
        <span className={scss.previewLine} />
        <span className={scss.previewLine} style={{ width: "60%" }} />
        <span className={scss.previewButton} />
      </div>
    </div>
  </div>
);

const AppearanceSettings = () => {
  const { preference, setPreference } = useTheme();
  const { t } = useI18n();
  const a = t.settings.appearance;

  return (
    <SettingsSection title={a.title} description={a.text}>
      <div className={scss.options} role="radiogroup" aria-label={a.title}>
        {options.map((o) => {
          const selected = preference === o.value;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={selected}
              className={`${scss.option} ${selected ? scss.selected : ""}`}
              onClick={() => setPreference(o.value)}
            >
              {o.value === "system" ? (
                <div className={scss.split}>
                  <Preview variant="light" />
                  <Preview variant="dark" />
                </div>
              ) : (
                <Preview variant={o.value} />
              )}

              <div className={scss.optionFooter}>
                <span className={scss.optionIcon}>{o.icon}</span>
                <div className={scss.optionText}>
                  <p className={scss.optionLabel}>{a[o.value]}</p>
                  <p className={scss.optionHint}>{a[`${o.value}Hint`]}</p>
                </div>
                <span className={scss.radio} />
              </div>
            </button>
          );
        })}
      </div>
    </SettingsSection>
  );
};

export default AppearanceSettings;
