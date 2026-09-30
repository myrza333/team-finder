import Link from "next/link";
import Avatar, { AvatarStack } from "@/components/ui/Avatar/Avatar";
import Tag, { TagList } from "@/components/ui/Tag/Tag";
import { MoreIcon } from "@/components/ui/Icons";
import type { Project } from "@/types";
import scss from "./ProjectCard.module.scss";
import ProjectIcon from "@/components/ui/ProjectIcon/ProjectIcon";

const ProjectCard = ({ project }: { project: Project }) => (
  <article className={scss.card}>
    <div className={scss.top}>
      <div className={scss.icon}><ProjectIcon icon={project.icon} size={20} /></div>
      <button className={scss.more} aria-label="More actions">
        <MoreIcon />
      </button>
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

    <p className={scss.label}>Looking for</p>
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
        <span>{project.members.length} members</span>
      </div>
      <Link href={`/projects/${project.id}`} className={scss.link}>
        View project →
      </Link>
    </div>
  </article>
);

export default ProjectCard;
