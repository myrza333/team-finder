"use client";
import Toggle from "@/components/ui/Toggle/Toggle";
import type { UserSettings } from "@/types";
import { SaveBar, SettingRow, SettingsSection, useSettingsForm } from "./SettingsParts";
import { useSaveSettings, useUserSettings } from "./useUserSettings";
import { useI18n } from "@/i18n/client";
import scss from "./Settings.module.scss";

// Уведомления на сайте (колокольчик). Писем TeamFinder пока не отправляет
const keys = ["notifyApplications", "notifyApplicationUpdates", "notifyTeam", "notifyDirect"] as const;

type NotifyKey = (typeof keys)[number];

const NotificationSettings = () => {
  const { data, isError } = useUserSettings();
  const { t } = useI18n();
  if (isError) return <p className={scss.state}>{t.settings.loadError}</p>;
  if (!data) return <p className={scss.state}>{t.common.loading}</p>;
  return <NotificationForm settings={data} />;
};

const NotificationForm = ({ settings }: { settings: UserSettings }) => {
  const save = useSaveSettings();
  const { t } = useI18n();
  const items = t.settings.notifications.items;
  const form = useSettingsForm<Record<NotifyKey, boolean>>(
    {
      notifyApplications: settings.notifyApplications,
      notifyApplicationUpdates: settings.notifyApplicationUpdates,
      notifyTeam: settings.notifyTeam,
      notifyDirect: settings.notifyDirect,
    },
    save,
  );

  return (
    <SettingsSection
      title={t.settings.notifications.title}
      description={t.settings.notifications.text}
    >
      {keys.map((key) => (
        <SettingRow key={key} title={items[key].title} description={items[key].description}>
          <Toggle
            checked={form.value[key]}
            onChange={(v) => form.setValue({ ...form.value, [key]: v })}
            label={items[key].title}
          />
        </SettingRow>
      ))}

      <SaveBar
        isDirty={form.isDirty}
        justSaved={form.justSaved}
        saving={form.saving}
        error={form.error}
        onSave={form.save}
        onReset={form.reset}
      />
    </SettingsSection>
  );
};

export default NotificationSettings;
