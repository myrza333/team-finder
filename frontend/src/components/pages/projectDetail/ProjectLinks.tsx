import { ArrowUpRight, FolderGit2, Globe } from "lucide-react";
import type { Project } from "@/types";
import { getI18n } from "@/i18n/server";
import scss from "./ProjectDetailPage.module.scss";

// "https://www.plants.example.com/app" → "plants.example.com"
const hostname = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

// Ссылки проекта: сам сайт и исходный код. Нет ни одной — блока нет
const ProjectLinks = async ({ project }: { project: Project }) => {
  if (!project.websiteUrl && !project.repoUrl) return null;
  const { t } = await getI18n();

  return (
    <div className={scss.links}>
      {project.websiteUrl && (
        <a href={project.websiteUrl} target="_blank" rel="noopener noreferrer" className={scss.link}>
          <Globe size={15} strokeWidth={1.75} aria-hidden />
          {hostname(project.websiteUrl)}
          <ArrowUpRight size={14} strokeWidth={1.75} className={scss.linkArrow} aria-hidden />
        </a>
      )}
      {project.repoUrl && (
        <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className={scss.link}>
          <FolderGit2 size={15} strokeWidth={1.75} aria-hidden />
          {t.project.sourceCode}
          <ArrowUpRight size={14} strokeWidth={1.75} className={scss.linkArrow} aria-hidden />
        </a>
      )}
    </div>
  );
};

export default ProjectLinks;
