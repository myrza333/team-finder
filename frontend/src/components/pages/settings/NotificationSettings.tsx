"use client";
import Toggle from "@/components/ui/Toggle/Toggle";
import { SaveBar, SettingsSection, useSettingsForm } from "./SettingsParts";
import scss from "./Settings.module.scss";
import local from "./NotificationSettings.module.scss";

type Channel = "inApp" | "email";
type Pref = { inApp: boolean | null; email: boolean | null }; // null — канал недоступен для события

// Группы событий. Ключи потом станут колонками таблицы notification_settings
const groups = [
  {
    title: "Applications",
    items: [
      { key: "applicationNew", label: "New applications to my projects", description: "Someone wants to join your team" },
      { key: "applicationStatus", label: "Updates on my applications", description: "Your application was accepted or declined" },
    ],
  },
  {
    title: "Teams",
    items: [
      { key: "memberJoined", label: "New team members", description: "Someone joined a project you're in" },
      { key: "chatMessage", label: "Team chat messages", description: "New messages in your team chats" },
    ],
  },
  {
    title: "Other",
    items: [{ key: "weeklyDigest", label: "Weekly digest", description: "A summary of activity on TeamFinder" }],
  },
] as const;

type PrefKey = (typeof groups)[number]["items"][number]["key"];

const initial: Record<PrefKey, Pref> = {
  applicationNew: { inApp: true, email: true },
  applicationStatus: { inApp: true, email: true },
  memberJoined: { inApp: true, email: false },
  chatMessage: { inApp: true, email: false },
  weeklyDigest: { inApp: null, email: false },
};

const NotificationSettings = () => {
  const form = useSettingsForm(initial);

  const toggle = (key: PrefKey, channel: Channel, value: boolean) =>
    form.setValue({ ...form.value, [key]: { ...form.value[key], [channel]: value } });

  // Быстро выключить/включить все email-уведомления
  const allEmailOff = Object.values(form.value).every((p) => p.email !== true);
  const setAllEmail = (on: boolean) =>
    form.setValue(
      Object.fromEntries(
        Object.entries(form.value).map(([k, p]) => [k, { ...p, email: p.email === null ? null : on }]),
      ) as Record<PrefKey, Pref>,
    );

  const renderCell = (key: PrefKey, channel: Channel, label: string) => {
    const value = form.value[key][channel];
    if (value === null) return <span className={local.na}>—</span>;
    return <Toggle checked={value} onChange={(v) => toggle(key, channel, v)} label={`${label}: ${channel === "inApp" ? "on site" : "email"}`} />;
  };

  return (
    <SettingsSection title="Notifications" description="Choose what you want to hear about and where.">
      <div className={local.table}>
        <div className={local.head}>
          <span />
          <span className={local.channel}>On site</span>
          <span className={local.channel}>Email</span>
        </div>

        {groups.map((group) => (
          <div key={group.title} className={local.group}>
            <p className={local.groupTitle}>{group.title}</p>
            {group.items.map((item) => (
              <div key={item.key} className={local.row}>
                <div>
                  <p className={scss.rowTitle}>{item.label}</p>
                  <p className={scss.rowDescription}>{item.description}</p>
                </div>
                <div className={local.cell}>{renderCell(item.key, "inApp", item.label)}</div>
                <div className={local.cell}>{renderCell(item.key, "email", item.label)}</div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <button type="button" className={local.bulk} onClick={() => setAllEmail(allEmailOff)}>
        {allEmailOff ? "Turn on all email notifications" : "Turn off all email notifications"}
      </button>

      <SaveBar isDirty={form.isDirty} justSaved={form.justSaved} onSave={form.save} onReset={form.reset} />
    </SettingsSection>
  );
};

export default NotificationSettings;
