"use client";
import Toggle from "@/components/ui/Toggle/Toggle";
import { SaveBar, SettingRow, SettingsSection, useSettingsForm } from "./SettingsParts";

const visibilityItems = [
  {
    key: "openToProjects",
    title: "Open to new projects",
    description: "Show an “Open to projects” badge on your profile and cards.",
  },
  {
    key: "showInPeople",
    title: "Show me in People search",
    description: "If off, your profile is visible only to your teammates.",
  },
] as const;

const contactItems = [
  { key: "showGithub", title: "Show GitHub link", description: "Displayed on your public profile." },
  { key: "showTelegram", title: "Show Telegram link", description: "Displayed on your public profile." },
  { key: "showLocation", title: "Show location", description: "City and country on your profile." },
] as const;

type PrivacyKey = (typeof visibilityItems)[number]["key"] | (typeof contactItems)[number]["key"];

const PrivacySettings = () => {
  const form = useSettingsForm<Record<PrivacyKey, boolean>>({
    openToProjects: true,
    showInPeople: true,
    showGithub: true,
    showTelegram: true,
    showLocation: true,
  });

  const renderRows = (items: readonly { key: PrivacyKey; title: string; description: string }[]) =>
    items.map((item) => (
      <SettingRow key={item.key} title={item.title} description={item.description}>
        <Toggle
          checked={form.value[item.key]}
          onChange={(v) => form.setValue({ ...form.value, [item.key]: v })}
          label={item.title}
        />
      </SettingRow>
    ));

  return (
    <>
      <SettingsSection title="Visibility" description="Control who can find you and how.">
        {renderRows(visibilityItems)}
      </SettingsSection>

      <SettingsSection title="Contact info" description="Your email is never shown publicly.">
        {renderRows(contactItems)}
        <SaveBar isDirty={form.isDirty} justSaved={form.justSaved} onSave={form.save} onReset={form.reset} />
      </SettingsSection>
    </>
  );
};

export default PrivacySettings;
