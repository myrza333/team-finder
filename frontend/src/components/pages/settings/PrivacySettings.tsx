"use client";
import Toggle from "@/components/ui/Toggle/Toggle";
import type { UserSettings } from "@/types";
import { SaveBar, SettingRow, SettingsSection, useSettingsForm } from "./SettingsParts";
import { useSaveSettings, useUserSettings } from "./useUserSettings";
import { useI18n } from "@/i18n/client";
import scss from "./Settings.module.scss";

const visibilityKeys = ["openToProjects", "showInPeople"] as const;
const contactKeys = ["showGithub", "showTelegram", "showSocials", "showLocation"] as const;

type PrivacyKey = (typeof visibilityKeys)[number] | (typeof contactKeys)[number];

const PrivacySettings = () => {
  const { data, isError } = useUserSettings();
  const { t } = useI18n();
  if (isError) return <p className={scss.state}>{t.settings.loadError}</p>;
  if (!data) return <p className={scss.state}>{t.common.loading}</p>;
  return <PrivacyForm settings={data} />;
};

const PrivacyForm = ({ settings }: { settings: UserSettings }) => {
  const save = useSaveSettings();
  const { t } = useI18n();
  const items = t.settings.privacy.items;
  const form = useSettingsForm<Record<PrivacyKey, boolean>>(
    {
      openToProjects: settings.openToProjects,
      showInPeople: settings.showInPeople,
      showGithub: settings.showGithub,
      showTelegram: settings.showTelegram,
      showSocials: settings.showSocials,
      showLocation: settings.showLocation,
    },
    save,
  );

  const renderRows = (keys: readonly PrivacyKey[]) =>
    keys.map((key) => (
      <SettingRow key={key} title={items[key].title} description={items[key].description}>
        <Toggle
          checked={form.value[key]}
          onChange={(v) => form.setValue({ ...form.value, [key]: v })}
          label={items[key].title}
        />
      </SettingRow>
    ));

  return (
    <>
      <SettingsSection title={t.settings.privacy.visibilityTitle} description={t.settings.privacy.visibilityText}>
        {renderRows(visibilityKeys)}
      </SettingsSection>

      <SettingsSection title={t.settings.privacy.contactTitle} description={t.settings.privacy.contactText}>
        {renderRows(contactKeys)}
        <SaveBar
          isDirty={form.isDirty}
          justSaved={form.justSaved}
          saving={form.saving}
          error={form.error}
          onSave={form.save}
          onReset={form.reset}
        />
      </SettingsSection>
    </>
  );
};

export default PrivacySettings;
