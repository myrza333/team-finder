"use client";
import Toggle from "@/components/ui/Toggle/Toggle";
import type { UserSettings } from "@/types";
import { SaveBar, SettingRow, SettingsSection, useSettingsForm } from "./SettingsParts";
import { useSaveSettings, useUserSettings } from "./useUserSettings";
import scss from "./Settings.module.scss";

// Уведомления на сайте (колокольчик). Писем TeamFinder пока не отправляет
const items = [
  {
    key: "notifyApplications",
    title: "New applications to my projects",
    description: "Someone wants to join your team",
  },
  {
    key: "notifyApplicationUpdates",
    title: "Updates on my applications",
    description: "Your application was accepted or declined",
  },
  {
    key: "notifyTeam",
    title: "Team changes",
    description: "You were removed from a team, or someone left your project",
  },
  {
    key: "notifyDirect",
    title: "New direct messages",
    description: "Someone starts a conversation with you about a project",
  },
] as const;

type NotifyKey = (typeof items)[number]["key"];

const NotificationSettings = () => {
  const { data, isError } = useUserSettings();
  if (isError) return <p className={scss.state}>Couldn&apos;t load your settings. Try again later.</p>;
  if (!data) return <p className={scss.state}>Loading…</p>;
  return <NotificationForm settings={data} />;
};

const NotificationForm = ({ settings }: { settings: UserSettings }) => {
  const save = useSaveSettings();
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
      title="Notifications"
      description="Choose what shows up in your notifications on TeamFinder. All chat messages always show up in Messages."
    >
      {items.map((item) => (
        <SettingRow key={item.key} title={item.title} description={item.description}>
          <Toggle
            checked={form.value[item.key]}
            onChange={(v) => form.setValue({ ...form.value, [item.key]: v })}
            label={item.title}
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
