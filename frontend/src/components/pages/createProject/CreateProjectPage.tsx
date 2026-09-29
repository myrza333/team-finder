"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import PageHeader from "@/components/ui/PageHeader/PageHeader";
import Button from "@/components/ui/Button/Button";
import Chip, { ChipList } from "@/components/ui/Chip/Chip";
import { Field, Hint, Input, Select, Textarea } from "@/components/ui/Form/Form";
import TagInput from "@/components/ui/TagInput/TagInput";
import { projectCategories } from "@/data/mock";
import { allRoles, popularRoles, popularTech } from "@/data/options";
import { api, type ProjectInput } from "@/lib/api";
import type { Project, ProjectCategory } from "@/types";
import scss from "./CreateProjectPage.module.scss";

const icons = ["🚀", "🎓", "💻", "🌱", "❤️", "🎮", "📚", "📱", "🎨", "🤖", "🎵", "🛒"];

const toggle = (list: string[], value: string) =>
  list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

// Одна форма для создания и редактирования: если передан project — режим редактирования
const CreateProjectPage = ({ project }: { project?: Project }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEdit = Boolean(project);
  const backHref = project ? `/my-projects/${project.id}` : "/projects";

  const [form, setForm] = useState({
    title: project?.title ?? "",
    description: project?.description ?? "",
    fullDescription: project?.fullDescription ?? "",
    category: project?.category ?? "",
    icon: project?.icon ?? "🚀",
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
    // У существующих вакансий сохраняем их навыки и статус
    const vacancies = roles.map((title) => {
      const existing = project?.vacancies.find((v) => v.title === title);
      return { title, skills: existing?.skills ?? [], isOpen: existing?.isOpen ?? true };
    });
    save.mutate({ ...form, category: form.category as ProjectCategory, stack, vacancies });
  };

  return (
    <div className={scss.page}>
      <PageHeader
        title={isEdit ? "Edit project" : "Create a new project"}
        subtitle={
          isEdit
            ? "Update the details and open positions of your project."
            : "Tell people about your idea and find teammates."
        }
      />

      <form onSubmit={handleSubmit}>
        <div className={scss.card}>
          <Field label="Icon">
            <div className={scss.icons}>
              {icons.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  aria-label={`Icon ${icon}`}
                  aria-pressed={form.icon === icon}
                  className={`${scss.icon} ${form.icon === icon ? scss.iconActive : ""}`}
                  onClick={() => setForm({ ...form, icon })}
                >
                  {icon}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Project name" htmlFor="title">
            <Input
              id="title"
              required
              minLength={3}
              maxLength={80}
              value={form.title}
              onChange={update("title")}
              placeholder="e.g. AI Study Platform"
            />
          </Field>

          <Field label="Short description" htmlFor="description">
            <Input
              id="description"
              required
              maxLength={160}
              value={form.description}
              onChange={update("description")}
              placeholder="One sentence about your project"
            />
          </Field>

          <Field label="Description" htmlFor="fullDescription">
            <Textarea
              id="fullDescription"
              rows={4}
              maxLength={3000}
              value={form.fullDescription}
              onChange={update("fullDescription")}
              placeholder="Tell potential teammates about the project, your vision, and what you're building..."
            />
          </Field>

          <Field label="Category" htmlFor="category">
            <Select id="category" required value={form.category} onChange={update("category")}>
              <option value="">Select a category</option>
              {projectCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Tech stack">
            <TagInput
              value={stack}
              onChange={setStack}
              suggestions={allSkills}
              placeholder="Search technologies, e.g. NestJS"
              label="technologies"
            />
            <p className={scss.popularLabel}>Popular</p>
            <ChipList>
              {popularTech.map((t) => (
                <Chip key={t} size="sm" active={stack.includes(t)} onClick={() => setStack((s) => toggle(s, t))}>
                  {t}
                </Chip>
              ))}
            </ChipList>
          </Field>

          <Field label="Looking for">
            <TagInput
              value={roles}
              onChange={setRoles}
              suggestions={allRoles}
              max={10}
              placeholder="Search roles or type your own"
              label="roles"
            />
            <p className={scss.popularLabel}>Popular</p>
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
            <Hint error>Couldn&apos;t save the project: {save.error.message}</Hint>
          </div>
        )}

        <div className={scss.actions}>
          <Button href={backHref} variant="outline" size="lg" className={scss.cancel}>
            Cancel
          </Button>
          <Button type="submit" size="lg" disabled={save.isPending}>
            {save.isPending ? "Saving…" : isEdit ? "Save changes" : "Create project"}
          </Button>
        </div>
      </form>

      {isEdit && (
        <section className={scss.danger}>
          <div>
            <h2 className={scss.dangerTitle}>Delete project</h2>
            <p className={scss.dangerText}>
              The project, its team chat, vacancies and applications will be deleted. This cannot be undone.
            </p>
            {remove.isError && <Hint error>Couldn&apos;t delete: {remove.error.message}</Hint>}
          </div>
          {confirmDelete ? (
            <div className={scss.dangerActions}>
              <Button variant="outline" onClick={() => setConfirmDelete(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={() => remove.mutate()} disabled={remove.isPending}>
                {remove.isPending ? "Deleting…" : "Yes, delete"}
              </Button>
            </div>
          ) : (
            <Button variant="danger" onClick={() => setConfirmDelete(true)}>
              Delete project
            </Button>
          )}
        </section>
      )}
    </div>
  );
};

export default CreateProjectPage;
