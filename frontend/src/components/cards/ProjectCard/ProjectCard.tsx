"use client";
import Link from "next/link";
import { useI18n } from "@/i18n/client";
import Avatar, { AvatarStack } from "@/components/ui/Avatar/Avatar";
import Tag, { TagList } from "@/components/ui/Tag/Tag";
import type { Project } from "@/types";
import scss from "./ProjectCard.module.scss";
import ProjectIcon from "@/components/ui/ProjectIcon/ProjectIcon";
import { Globe } from "lucide-react";

const ProjectCard = ({ project }: { project: Project }) => {
  const { t } = useI18n();
  return (
    <article className={scss.card}>
      <div className={scss.top}>
        <div className={scss.icon}>
          <ProjectIcon icon={project.icon} size={20} />
        </div>
        {/* У проекта есть рабочий сайт — его можно открыть прямо из карточки */}
        {project.websiteUrl && (
          <a
            href={project.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={scss.live}
            aria-label={t.projectCard.openWebsite(project.title)}
          >
            <Globe size={13} strokeWidth={2} aria-hidden /> {t.projectCard.live}
          </a>
        )}
      </div>

      <h3 className={scss.title}>{project.title}</h3>
      <p className={scss.description}>{project.description}</p>

      <div className={scss.block}>
        <TagList>
          {project.stack.map((tech) => (
            <Tag key={tech}>{tech}</Tag>
          ))}
        </TagList>
      </div>

      <p className={scss.label}>{t.projectCard.lookingFor}</p>
      <div className={scss.vacancies}>
        <TagList>
          {project.vacancies.map((v) => (
            <Tag key={v.id} variant="primary">
              {v.title}
            </Tag>
          ))}
        </TagList>
      </div>

      <div className={scss.footer}>
        <div className={scss.members}>
          <AvatarStack>
            {project.members.slice(0, 3).map((m) => (
              <Avatar key={m.id} src={m.avatarUrl} alt={m.name} size={24} bordered />
            ))}
          </AvatarStack>
          <span>{t.common.members(project.members.length)}</span>
        </div>
        <Link href={`/projects/${project.id}`} className={scss.link}>
          {t.projectCard.view}
        </Link>
      </div>
    </article>
  );
};

export default ProjectCard;
