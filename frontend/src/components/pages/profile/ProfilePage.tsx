import { MapPin } from "lucide-react";
import Link from "next/link";
import Avatar from "@/components/ui/Avatar/Avatar";
import Button from "@/components/ui/Button/Button";
import Panel from "@/components/ui/Panel/Panel";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";
import SocialIcon from "@/components/ui/SocialIcon/SocialIcon";
import Tag, { TagList } from "@/components/ui/Tag/Tag";
import { socials } from "@/lib/socials";
import { stackIcon } from "@/lib/stacks";
import type { Project, User } from "@/types";
import scss from "./ProfilePage.module.scss";
import ProjectIcon from "@/components/ui/ProjectIcon/ProjectIcon";

type ProfilePageProps = {
  user: User;
  projects: Project[];
  isOwn: boolean; // свой профиль — показываем "Edit profile"
};

const ProfilePage = ({ user, projects, isOwn }: ProfilePageProps) => {
  const stats = [
    { label: "Projects", value: user.projectsCount },
    { label: "Teams", value: user.teamsCount ?? 0 },
    { label: "Contributions", value: user.contributionsCount ?? 0 },
  ];

  return (
    <div className={scss.page}>
      <section className={scss.card}>
        <Avatar src={user.avatarUrl} alt={user.name} size={80} />

        <div className={scss.info}>
          <h1 className={scss.name}>{user.name}</h1>
          <p className={scss.title}>{user.title}</p>
          {user.openToProjects && (
            <div className={scss.badge}>
              <StatusBadge status="open" />
            </div>
          )}
          {user.bio && <p className={scss.bio}>{user.bio}</p>}
          {user.location && (
            <p className={scss.location}>
              <MapPin size={14} strokeWidth={1.75} aria-hidden /> {user.location}
            </p>
          )}

          {/* Ссылки: только заполненные (и не скрытые в Settings → Privacy) */}
          {socials.some((s) => user[s.key]) && (
            <ul className={scss.socials}>
              {socials
                .filter((s) => user[s.key])
                .map((s) => (
                  <li key={s.key}>
                    <a
                      href={user[s.key]!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={scss.socialLink}
                      title={user[s.key]!}
                    >
                      <SocialIcon social={s.key} size={16} />
                      {s.label}
                    </a>
                  </li>
                ))}
            </ul>
          )}

          {isOwn && (
            <div className={scss.links}>
              <Button href="/settings/profile" variant="outline">
                Edit profile
              </Button>
            </div>
          )}
        </div>

        <div className={scss.stats}>
          {stats.map((s) => (
            <div key={s.label} className={scss.stat}>
              <p className={scss.statValue}>{s.value}</p>
              <p className={scss.statLabel}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <div className={scss.grid}>
        <div className={scss.main}>
          {user.bio && (
            <Panel title="About">
              <p className={scss.text}>{user.bio}</p>
            </Panel>
          )}

          <Panel title="Projects">
            {projects.length > 0 ? (
              <ul className={scss.projects}>
                {projects.slice(0, 3).map((p) => (
                  <li key={p.id}>
                    <Link href={`/projects/${p.id}`} className={scss.project}>
                      <span className={scss.projectIcon}><ProjectIcon icon={p.icon} size={18} /></span>
                      <div className={scss.projectInfo}>
                        <p className={scss.projectTitle}>{p.title}</p>
                        <p className={scss.projectDescription}>{p.description}</p>
                      </div>
                      <span className={scss.arrow}>→</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={scss.empty}>No projects yet.</p>
            )}
          </Panel>
        </div>

        <div className={scss.side}>
          <Panel title="Skills">
            <TagList>
              {user.skills.map((skill) => (
                <Tag key={skill} variant="primary" size="lg">
                  {skill}
                </Tag>
              ))}
            </TagList>
          </Panel>

          {/* Направления — после навыков. Пусто: чужому не показываем, себе — подсказка */}
          {(user.stacks?.length || isOwn) && (
            <Panel title="Stack">
              {user.stacks?.length ? (
                <ul className={scss.stacks}>
                  {user.stacks.map((name) => {
                    const Icon = stackIcon(name);
                    return (
                      <li key={name} className={scss.stack}>
                        <span className={scss.stackIcon}>
                          <Icon size={16} strokeWidth={1.75} aria-hidden />
                        </span>
                        {name}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className={scss.stackEmpty}>
                  Add what you do — Frontend, Fullstack, Mobile… —{" "}
                  <Link href="/settings/profile">in profile settings</Link>.
                </p>
              )}
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
