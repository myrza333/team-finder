"use client";
import Avatar from "@/components/ui/Avatar/Avatar";
import { useI18n } from "@/i18n/client";
import Button from "@/components/ui/Button/Button";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";
import Tag, { TagList } from "@/components/ui/Tag/Tag";
import type { User } from "@/types";
import scss from "./PersonCard.module.scss";

const PersonCard = ({ user }: { user: User }) => {
  const { t } = useI18n();
  return (
    <article className={scss.card}>
      <div className={scss.avatar}>
        <Avatar src={user.avatarUrl} alt={user.name} size={64} />
      </div>
      <h3 className={scss.name}>{user.name}</h3>
      {user.openToProjects && (
        <div className={scss.badge}>
          <StatusBadge status="open" />
        </div>
      )}

      <div className={scss.skills}>
        <TagList center>
          {user.skills.slice(0, 3).map((skill) => (
            <Tag key={skill} variant="primary">
              {skill}
            </Tag>
          ))}
        </TagList>
      </div>

      <p className={scss.projects}>{t.personCard.projects(user.projectsCount)}</p>

      <Button href={`/profile/${user.id}`} variant="outline" size="sm" fullWidth className={scss.button}>
        {t.common.viewProfile}
      </Button>
    </article>
  );
};

export default PersonCard;
