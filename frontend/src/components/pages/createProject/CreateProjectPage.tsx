"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import PageHeader from "@/components/ui/PageHeader/PageHeader";
import Button from "@/components/ui/Button/Button";
import Chip, { ChipList } from "@/components/ui/Chip/Chip";
import { Field, Hint, Input, Select, Textarea } from "@/components/ui/Form/Form";
import TagInput from "@/components/ui/TagInput/TagInput";
import { allRoles, popularRoles, popularTech, projectCategories } from "@/data/options";
import { api, type ProjectInput } from "@/lib/api";
import type { Project, ProjectCategory } from "@/types";
import ProjectIcon, { projectIconKeys } from "@/components/ui/ProjectIcon/ProjectIcon";
import { useI18n } from "@/i18n/client";
import scss from "./CreateProjectPage.module.scss";

// "plants.com" → "https://plants.com": так ссылку проще вписать. Пустое поле остаётся пустым (= ссылки нет)
// Самая ранняя дата запуска в календаре — завтра ("2026-10-02")
const tomorrow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const withProtocol = (url: string) => {
  const value = url.trim();
  return !value || /^https?:\/\//i.test(value) ? value : `https://${value}`;
};

const toggle = (list: string[], value: string) =>
  list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

// Одна форма для создания и редактирования: если передан project — режим редактирования
const CreateProjectPage = ({ project }: { project?: Project }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const isEdit = Boolean(project);
  const backHref = project ? `/my-projects/${project.id}` : "/projects";

  const [form, setForm] = useState({
    title: project?.title ?? "",
    description: project?.description ?? "",
    fullDescription: project?.fullDescription ?? "",
    category: project?.category ?? "",
    icon: project?.icon ?? "rocket",
    websiteUrl: project?.websiteUrl ?? "",
    repoUrl: project?.repoUrl ?? "",
    // Уже запущенный проект (дата в прошлом) — поле пустое; будущая дата — проект пока анонс
    launchAt: project?.announced ? (project.launchAt ?? "") : "",
  });
  const [stack, setStack] = useState<string[]>(project?.stack ?? []);
  const [roles, setRoles] = useState<string[]>(project?.vacancies.map((v) => v.title) ?? ["Frontend Developer"]);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data: allSkills = popularTech } = useQuery({ queryKey: ["skills"], queryFn: api.skills });

  const update =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm({ ...form, [key]: e.target.value });

  const save = useMutation({
    mutationFn: (data: ProjectInput) => (project ? api.projects.update(project.id, data) : api.projects.create(data)),
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      router.push(`/projects/${saved.id}`);
      router.refresh();
    },
  });

  const remove = useMutation({
    mutationFn: () => api.projects.remove(project!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      router.push("/my-projects");
      router.refresh();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // У существующих вакансий сохраняем id (заявки на них не теряют роль), навыки и статус
    const vacancies = roles.map((title) => {
      const existing = project?.vacancies.find((v) => v.title === title);
      return { id: existing?.id, title, skills: existing?.skills ?? [], isOpen: existing?.isOpen ?? true };
    });
    save.mutate({
      ...form,
      websiteUrl: withProtocol(form.websiteUrl),
      repoUrl: withProtocol(form.repoUrl),
      category: form.category as ProjectCategory,
      stack,
      vacancies,
    });
  };

  return (
    <div className={scss.page}>
      <PageHeader
        title={isEdit ? t.projectForm.editTitle : t.projectForm.createTitle}
        subtitle={isEdit ? t.projectForm.editSubtitle : t.projectForm.createSubtitle}
      />

      <form onSubmit={handleSubmit}>
        <div className={scss.card}>
          <Field label={t.projectForm.icon}>
            <div className={scss.icons}>
              {projectIconKeys.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  aria-label={t.projectForm.iconLabel(t.projectIcons[icon])}
                  title={t.projectIcons[icon]}
                  aria-pressed={form.icon === icon}
                  className={`${scss.icon} ${form.icon === icon ? scss.iconActive : ""}`}
                  onClick={() => setForm({ ...form, icon })}
                >
                  <ProjectIcon icon={icon} size={20} />
                </button>
              ))}
            </div>
          </Field>

          <Field label={t.projectForm.name} htmlFor="title">
            <Input
              id="title"
              required
              minLength={3}
              maxLength={80}
              value={form.title}
              onChange={update("title")}
              placeholder={t.projectForm.namePlaceholder}
            />
          </Field>

          <Field label={t.projectForm.short} htmlFor="description">
            <Input
              id="description"
              required
              maxLength={160}
              value={form.description}
              onChange={update("description")}
              placeholder={t.projectForm.shortPlaceholder}
            />
          </Field>

          <Field label={t.projectForm.description} htmlFor="fullDescription">
            <Textarea
              id="fullDescription"
              rows={4}
              maxLength={3000}
              value={form.fullDescription}
              onChange={update("fullDescription")}
              placeholder={t.projectForm.descriptionPlaceholder}
            />
          </Field>

          {/* Необязательные ссылки: сам сайт/приложение и исходный код. Пустые — на странице проекта их нет */}
          <div className={scss.links}>
          <div className={scss.twoColumns}>
            <Field label={t.projectForm.website} htmlFor="websiteUrl" hint={<span className={scss.optional}>{t.common.optional}</span>}>
              <Input
                id="websiteUrl"
                inputMode="url"
                maxLength={300}
                value={form.websiteUrl}
                onChange={update("websiteUrl")}
                placeholder="plants.example.com"
              />
            </Field>
            <Field label={t.projectForm.sourceCode} htmlFor="repoUrl" hint={<span className={scss.optional}>{t.common.optional}</span>}>
              <Input
                id="repoUrl"
                inputMode="url"
                maxLength={300}
                value={form.repoUrl}
                onChange={update("repoUrl")}
                placeholder="github.com/you/project"
              />
            </Field>
          </div>
          <Hint>{t.projectForm.linksHint}</Hint>
          </div>

          <Field label={t.projectForm.category} htmlFor="category">
            <Select id="category" required value={form.category} onChange={update("category")}>
              <option value="">{t.projectForm.selectCategory}</option>
              {projectCategories.map((c) => (
                <option key={c} value={c}>
                  {t.categories[c]}
                </option>
              ))}
            </Select>
          </Field>

          {/* Дата запуска в будущем — проект сначала анонс (страница Announcements) */}
          <div className={scss.links}>
            <Field label={t.projectForm.launchDate} htmlFor="launchAt" hint={<span className={scss.optional}>{t.common.optional}</span>}>
              <div className={scss.dateInput}>
                <Input id="launchAt" type="date" min={tomorrow()} value={form.launchAt} onChange={update("launchAt")} />
              </div>
            </Field>
            <Hint>{t.projectForm.launchHint}</Hint>
          </div>

          <Field label={t.projectForm.stack}>
            <TagInput
              value={stack}
              onChange={setStack}
              suggestions={allSkills}
              placeholder={t.projectForm.addTech}
              label={t.projectForm.techLabel}
            />
            <p className={scss.popularLabel}>{t.projectForm.popular}</p>
            <ChipList>
              {popularTech.map((t) => (
                <Chip key={t} size="sm" active={stack.includes(t)} onClick={() => setStack((s) => toggle(s, t))}>
                  {t}
                </Chip>
              ))}
            </ChipList>
          </Field>

          <Field label={t.projectForm.lookingFor}>
            <TagInput
              value={roles}
              onChange={setRoles}
              suggestions={allRoles}
              max={10}
              placeholder={t.projectForm.addRole}
              label={t.projectForm.rolesLabel}
            />
            <p className={scss.popularLabel}>{t.projectForm.popular}</p>
            <ChipList>
              {popularRoles.map((r) => (
                <Chip
                  key={r}
                  size="sm"
                  variant="soft"
                  active={roles.includes(r)}
                  onClick={() => setRoles((list) => toggle(list, r))}
                >
                  {r}
                </Chip>
              ))}
            </ChipList>
          </Field>
        </div>

        {save.isError && (
          <div className={scss.error}>
            <Hint error>{t.projectForm.saveError(save.error.message)}</Hint>
          </div>
        )}

        <div className={scss.actions}>
          <Button href={backHref} variant="outline" size="lg" className={scss.cancel}>
            {t.common.cancel}
          </Button>
          <Button type="submit" size="lg" disabled={save.isPending}>
            {save.isPending ? t.common.saving : isEdit ? t.common.saveChanges : t.projectForm.create}
          </Button>
        </div>
      </form>

      {isEdit && (
        <section className={scss.danger}>
          <div>
            <h2 className={scss.dangerTitle}>{t.projectForm.deleteTitle}</h2>
            <p className={scss.dangerText}>{t.projectForm.deleteText}</p>
            {remove.isError && <Hint error>{t.projectForm.deleteError(remove.error.message)}</Hint>}
          </div>
          {confirmDelete ? (
            <div className={scss.dangerActions}>
              <Button variant="outline" onClick={() => setConfirmDelete(false)}>
                {t.common.cancel}
              </Button>
              <Button variant="danger" onClick={() => remove.mutate()} disabled={remove.isPending}>
                {remove.isPending ? t.projectForm.deleting : t.projectForm.confirmDelete}
              </Button>
            </div>
          ) : (
            <Button variant="danger" onClick={() => setConfirmDelete(true)}>
              {t.projectForm.deleteTitle}
            </Button>
          )}
        </section>
      )}
    </div>
  );
};

export default CreateProjectPage;
