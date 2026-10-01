"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import Avatar from "@/components/ui/Avatar/Avatar";
import Button from "@/components/ui/Button/Button";
import { Field, Hint, Input, PrefixInput, Textarea } from "@/components/ui/Form/Form";
import { api } from "@/lib/api";
import { resizeToSquare } from "@/lib/resizeImage";
import type { User } from "@/types";
import TagInput from "@/components/ui/TagInput/TagInput";
import { SaveBar, SettingsSection, useSettingsForm } from "./SettingsParts";
import scss from "./Settings.module.scss";
import local from "./ProfileSettings.module.scss";

const BIO_MAX = 300;

// Из "https://github.com/timur" достаём "timur" для поля с приставкой
const handle = (url?: string | null) => url?.replace(/^https?:\/\/(www\.)?(github\.com|t\.me)\/?/, "") ?? "";

const MAX_UPLOAD_MB = 10;

// Имя и аватарка есть не только в "me", но и в списках людей/проектов и на серверных страницах —
// после изменения профиля обновляем всё, иначе новое было бы видно только после перезагрузки
const useApplyUser = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  return (updated: User) => {
    queryClient.setQueryData(["me"], updated);
    queryClient.invalidateQueries({ predicate: (q) => q.queryKey[0] !== "me" });
    router.refresh();
  };
};

// Ждём, пока браузер скачает картинку, чтобы подменить её без серой вспышки
const preload = (src: string) =>
  new Promise<void>((resolve) => {
    const img = new Image();
    img.referrerPolicy = "no-referrer";
    img.onload = img.onerror = () => resolve();
    img.src = src;
  });

// Фото сохраняется сразу после выбора, отдельно от кнопки "Save changes"
const AvatarPicker = ({ user }: { user: User }) => {
  const applyUser = useApplyUser();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null); // выбранное фото показываем сразу, до ответа сервера
  const hasPhoto = Boolean(user.avatarUrl);

  const run = async (action: () => Promise<User>) => {
    setBusy(true);
    setError(null);
    try {
      const updated = await action();
      if (updated.avatarUrl) await preload(updated.avatarUrl);
      applyUser(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
      setPreview((url) => {
        if (url) URL.revokeObjectURL(url);
        return null;
      });
    }
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // чтобы можно было выбрать тот же файл ещё раз
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("Please choose an image file");
    if (file.size > MAX_UPLOAD_MB * 1024 * 1024) return setError(`The image must be under ${MAX_UPLOAD_MB} MB`);
    setPreview(URL.createObjectURL(file));
    run(async () => api.users.uploadAvatar(await resizeToSquare(file)));
  };

  return (
    <div className={local.avatarRow}>
      <Avatar src={preview ?? user.avatarUrl} alt={user.name} size={72} />
      <div>
        <div className={local.avatarButtons}>
          <Button variant="outline" disabled={busy} onClick={() => inputRef.current?.click()}>
            {busy ? "Saving…" : hasPhoto ? "Change photo" : "Upload photo"}
          </Button>
          {hasPhoto && (
            <Button variant="outline" disabled={busy} onClick={() => run(api.users.removeAvatar)}>
              Remove
            </Button>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          hidden
          onChange={onFile}
        />
        <Hint error={Boolean(error)}>{error ?? "JPG, PNG, WebP or GIF. It will be cropped to a square."}</Hint>
      </div>
    </div>
  );
};

const ProfileSettings = () => {
  const { data: user, isError } = useQuery({ queryKey: ["me"], queryFn: api.users.me });
  if (isError) return <p className={local.state}>Couldn&apos;t load your profile. Is the server running?</p>;
  if (!user) return <p className={local.state}>Loading…</p>;
  return <ProfileForm user={user} />;
};

const ProfileForm = ({ user }: { user: User }) => {
  const applyUser = useApplyUser();
  const { data: allSkills = [] } = useQuery({ queryKey: ["skills"], queryFn: api.skills });

  const form = useSettingsForm(
    {
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
      applyUser(updated);
    },
  );
  const v = form.value;
  const set = <K extends keyof typeof v>(key: K, value: (typeof v)[K]) => form.setValue({ ...v, [key]: value });

  return (
    <>
      <SettingsSection title="Public profile" description="This is how other people see you on TeamFinder.">
        <div className={scss.fields}>
          <AvatarPicker user={user} />

          <div className={scss.twoColumns}>
            <Field label="Name" htmlFor="name">
              <Input id="name" value={v.name} onChange={(e) => set("name", e.target.value)} placeholder="Your name" />
            </Field>
            <Field label="Title" htmlFor="title">
              <Input
                id="title"
                value={v.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="Frontend Developer"
              />
            </Field>
          </div>

          <Field label="Location" htmlFor="location">
            <Input
              id="location"
              value={v.location}
              onChange={(e) => set("location", e.target.value)}
              placeholder="City, country"
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
              placeholder="About you"
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
          placeholder="Add a skill"
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
