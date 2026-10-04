"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import Avatar from "@/components/ui/Avatar/Avatar";
import Button from "@/components/ui/Button/Button";
import { Field, Hint, Input, Textarea } from "@/components/ui/Form/Form";
import SocialIcon from "@/components/ui/SocialIcon/SocialIcon";
import { api } from "@/lib/api";
import { resizeToSquare } from "@/lib/resizeImage";
import { type Social, type SocialKey, socials, toHandle, toUrl } from "@/lib/socials";
import { MAX_STACKS, stacks } from "@/lib/stacks";
import type { User } from "@/types";
import TagInput from "@/components/ui/TagInput/TagInput";
import { SaveBar, SettingsSection, useSettingsForm } from "./SettingsParts";
import { useI18n } from "@/i18n/client";
import { translateError } from "@/i18n/translate";
import scss from "./Settings.module.scss";
import local from "./ProfileSettings.module.scss";

const BIO_MAX = 300;

const MAX_UPLOAD_MB = 10;

// Выбор направлений: плитки с иконками, не больше MAX_STACKS. Порядок — как в общем списке
const StackPicker = ({ value, onChange }: { value: string[]; onChange: (next: string[]) => void }) => {
  const full = value.length >= MAX_STACKS;
  const { t } = useI18n();
  const toggle = (name: string) =>
    onChange(
      value.includes(name) ? value.filter((s) => s !== name) : stacks.map((s) => s.name).filter((n) => n === name || value.includes(n)),
    );

  return (
    <>
      <div className={local.stacks} role="group" aria-label={t.settings.profile.stackTitle}>
        {stacks.map(({ name, Icon }) => {
          const active = value.includes(name);
          return (
            <button
              key={name}
              type="button"
              aria-pressed={active}
              disabled={!active && full}
              onClick={() => toggle(name)}
              className={`${local.stack} ${active ? local.stackActive : ""}`}
            >
              <Icon size={16} strokeWidth={1.75} aria-hidden />
              <span>{t.stacks[name] ?? name}</span>
            </button>
          );
        })}
      </div>
      <p className={local.stackCounter}>
        {t.settings.profile.stackCounter(value.length, MAX_STACKS)}
        {full ? t.settings.profile.stackFull : ""}
      </p>
    </>
  );
};

// Поле ссылки: иконка сети + начало адреса + ник. Можно вставить ссылку целиком — останется только ник
const SocialField = ({ social, value, onChange }: { social: Social; value: string; onChange: (handle: string) => void }) => {
  const id = `social-${social.key}`;
  const { t } = useI18n();
  return (
    <div className={local.social}>
      <label htmlFor={id} className={local.socialLabel}>
        <SocialIcon social={social.key} size={16} />
        {social.label}
      </label>
      <div className={local.socialInput}>
        <span className={local.socialPrefix}>{social.prefix}</span>
        <input
          id={id}
          value={value}
          onChange={(e) => onChange(toHandle(social, e.target.value))}
          placeholder={t.settings.profile.username}
          autoComplete="off"
          spellCheck={false}
        />
      </div>
    </div>
  );
};

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
  const { t, locale } = useI18n();
  const p = t.settings.profile;
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
      setError(e instanceof Error ? translateError(e.message, locale) : t.common.somethingWrong);
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
    if (!file.type.startsWith("image/")) return setError(p.notImage);
    if (file.size > MAX_UPLOAD_MB * 1024 * 1024) return setError(p.tooBig(MAX_UPLOAD_MB));
    setPreview(URL.createObjectURL(file));
    run(async () => api.users.uploadAvatar(await resizeToSquare(file)));
  };

  return (
    <div className={local.avatarRow}>
      <Avatar src={preview ?? user.avatarUrl} alt={user.name} size={72} />
      <div>
        <div className={local.avatarButtons}>
          <Button variant="outline" disabled={busy} onClick={() => inputRef.current?.click()}>
            {busy ? t.common.saving : hasPhoto ? p.changePhoto : p.uploadPhoto}
          </Button>
          {hasPhoto && (
            <Button variant="outline" disabled={busy} onClick={() => run(api.users.removeAvatar)}>
              {p.removePhoto}
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
        <Hint error={Boolean(error)}>{error ?? p.photoHint}</Hint>
      </div>
    </div>
  );
};

const ProfileSettings = () => {
  const { data: user, isError } = useQuery({ queryKey: ["me"], queryFn: api.users.me });
  const { t } = useI18n();
  if (isError) return <p className={local.state}>{t.settings.profile.loadError}</p>;
  if (!user) return <p className={local.state}>{t.common.loading}</p>;
  return <ProfileForm user={user} />;
};

const ProfileForm = ({ user }: { user: User }) => {
  const applyUser = useApplyUser();
  const router = useRouter();
  const { t } = useI18n();
  const p = t.settings.profile;
  const { data: allSkills = [] } = useQuery({ queryKey: ["skills"], queryFn: api.skills });

  const form = useSettingsForm(
    {
      name: user.name,
      location: user.location ?? "",
      bio: user.bio ?? "",
      skills: user.skills,
      stacks: user.stacks ?? [],
      // В форме — только ники; полные ссылки собираются при сохранении
      links: Object.fromEntries(socials.map((s) => [s.key, toHandle(s, user[s.key])])) as Record<SocialKey, string>,
    },
    async (v) => {
      const updated = await api.users.updateMe({
        name: v.name,
        location: v.location,
        bio: v.bio,
        skills: v.skills,
        stacks: v.stacks,
        ...Object.fromEntries(socials.map((s) => [s.key, toUrl(s, v.links[s.key])])),
      });
      applyUser(updated);
      // Сохранили — сразу показываем, как профиль выглядит для других
      router.push(`/profile/${updated.id}`);
    },
  );
  const v = form.value;
  const set = <K extends keyof typeof v>(key: K, value: (typeof v)[K]) => form.setValue({ ...v, [key]: value });
  const nameTooShort = v.name.trim().length < 2;

  return (
    <>
      <SettingsSection title={p.publicTitle} description={p.publicText}>
        <div className={scss.fields}>
          <AvatarPicker user={user} />

          <div className={scss.twoColumns}>
            <Field label={p.name} htmlFor="name">
              <Input
                id="name"
                value={v.name}
                maxLength={60}
                aria-invalid={nameTooShort || undefined}
                onChange={(e) => set("name", e.target.value)}
                placeholder={p.namePlaceholder}
              />
              {nameTooShort && <Hint error>{p.nameTooShort}</Hint>}
            </Field>
            <Field label={p.location} htmlFor="location">
              <Input
                id="location"
                value={v.location}
                onChange={(e) => set("location", e.target.value)}
                placeholder={p.locationPlaceholder}
              />
            </Field>
          </div>

          <Field
            label={p.bio}
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
              placeholder={p.bioPlaceholder}
            />
          </Field>
        </div>
      </SettingsSection>

      <SettingsSection
        title={p.skillsTitle}
        description={p.skillsText}
      >
        <TagInput
          value={v.skills}
          onChange={(skills) => set("skills", skills)}
          suggestions={allSkills}
          placeholder={p.addSkill}
          label={p.skillsLabel}
        />
      </SettingsSection>

      <SettingsSection
        title={p.stackTitle}
        description={p.stackText(MAX_STACKS)}
      >
        <StackPicker value={v.stacks} onChange={(next) => set("stacks", next)} />
      </SettingsSection>

      <SettingsSection title={p.linksTitle} description={p.linksText}>
        <div className={local.links}>
          {socials.map((s) => (
            <SocialField
              key={s.key}
              social={s}
              value={v.links[s.key]}
              onChange={(handle) => set("links", { ...v.links, [s.key]: handle })}
            />
          ))}
        </div>

        <SaveBar
          isDirty={form.isDirty}
          justSaved={form.justSaved}
          saving={form.saving}
          error={form.error}
          invalid={nameTooShort}
          onSave={form.save}
          onReset={form.reset}
        />
      </SettingsSection>
    </>
  );
};

export default ProfileSettings;
