"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Avatar from "@/components/ui/Avatar/Avatar";
import Button from "@/components/ui/Button/Button";
import { Field, Hint, Input, PrefixInput, Textarea } from "@/components/ui/Form/Form";
import { api } from "@/lib/api";
import type { User } from "@/types";
import TagInput from "@/components/ui/TagInput/TagInput";
import { SaveBar, SettingsSection, useSettingsForm } from "./SettingsParts";
import scss from "./Settings.module.scss";
import local from "./ProfileSettings.module.scss";

const BIO_MAX = 300;

// Из "https://github.com/timur" достаём "timur" для поля с приставкой
const handle = (url?: string | null) => url?.replace(/^https?:\/\/(www\.)?(github\.com|t\.me)\/?/, "") ?? "";

const ProfileSettings = () => {
  const { data: user, isError } = useQuery({ queryKey: ["me"], queryFn: api.users.me });
  if (isError) return <p className={local.state}>Couldn&apos;t load your profile. Is the server running?</p>;
  if (!user) return <p className={local.state}>Loading…</p>;
  return <ProfileForm user={user} />;
};

const ProfileForm = ({ user }: { user: User }) => {
  const queryClient = useQueryClient();
  const { data: allSkills = [] } = useQuery({ queryKey: ["skills"], queryFn: api.skills });

  const form = useSettingsForm(
    {
      avatarUrl: user.avatarUrl,
      name: user.name,
      title: user.title,
      location: user.location ?? "",
      bio: user.bio ?? "",
      skills: user.skills,
      github: handle(user.githubUrl),
      telegram: handle(user.telegramUrl),
    },
    async (v) => {
      const updated = await api.users.updateMe({
        name: v.name,
        title: v.title,
        location: v.location,
        bio: v.bio,
        skills: v.skills,
        githubUrl: v.github ? `https://github.com/${v.github}` : "",
        telegramUrl: v.telegram ? `https://t.me/${v.telegram}` : "",
      });
      queryClient.setQueryData(["me"], updated);
    },
  );
  const v = form.value;
  const set = <K extends keyof typeof v>(key: K, value: (typeof v)[K]) => form.setValue({ ...v, [key]: value });

  return (
    <>
      <SettingsSection title="Public profile" description="This is how other people see you on TeamFinder.">
        <div className={scss.fields}>
          <div className={local.avatarRow}>
            <Avatar src={v.avatarUrl} alt={v.name} size={72} />
            <div>
              <div className={local.avatarButtons}>
                <Button variant="outline" disabled>
                  Change photo
                </Button>
              </div>
              <Hint>Photo upload will be available soon.</Hint>
            </div>
          </div>

          <div className={scss.twoColumns}>
            <Field label="Name" htmlFor="name">
              <Input id="name" value={v.name} onChange={(e) => set("name", e.target.value)} placeholder="Your name" />
            </Field>
            <Field label="Title" htmlFor="title">
              <Input
                id="title"
                value={v.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="e.g. Frontend Developer"
              />
            </Field>
          </div>

          <Field label="Location" htmlFor="location">
            <Input
              id="location"
              value={v.location}
              onChange={(e) => set("location", e.target.value)}
              placeholder="e.g. Bishkek, Kyrgyzstan"
            />
          </Field>

          <Field
            label="Bio"
            htmlFor="bio"
            hint={
              <span className={`${local.counter} ${v.bio.length > BIO_MAX ? local.counterOver : ""}`}>
                {v.bio.length}/{BIO_MAX}
              </span>
            }
          >
            <Textarea
              id="bio"
              rows={4}
              maxLength={BIO_MAX}
              value={v.bio}
              onChange={(e) => set("bio", e.target.value)}
              placeholder="A few words about you, your experience and what you want to build."
            />
          </Field>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Skills"
        description="Used in search, so people can find you by skill. Add the technologies you actually work with."
      >
        <TagInput
          value={v.skills}
          onChange={(skills) => set("skills", skills)}
          suggestions={allSkills}
          placeholder="Type a skill, e.g. React"
          label="skills"
        />
      </SettingsSection>

      <SettingsSection title="Links" description="Shown on your profile so teammates can contact you.">
        <div className={scss.twoColumns}>
          <Field label="GitHub" htmlFor="github">
            <PrefixInput
              id="github"
              prefix="github.com/"
              value={v.github}
              onChange={(e) => set("github", e.target.value)}
              placeholder="username"
            />
          </Field>
          <Field label="Telegram" htmlFor="telegram">
            <PrefixInput
              id="telegram"
              prefix="t.me/"
              value={v.telegram}
              onChange={(e) => set("telegram", e.target.value)}
              placeholder="username"
            />
          </Field>
        </div>

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

export default ProfileSettings;
