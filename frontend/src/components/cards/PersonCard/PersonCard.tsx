import Avatar from "@/components/ui/Avatar/Avatar";
import Button from "@/components/ui/Button/Button";
import Tag, { TagList } from "@/components/ui/Tag/Tag";
import type { User } from "@/types";
import scss from "./PersonCard.module.scss";

const PersonCard = ({ user }: { user: User }) => (
  <article className={scss.card}>
    <div className={scss.avatar}>
      <Avatar src={user.avatarUrl} alt={user.name} size={64} />
    </div>
    <h3 className={scss.name}>{user.name}</h3>
    <p className={scss.title}>{user.title}</p>

    <div className={scss.skills}>
      <TagList center>
        {user.skills.slice(0, 3).map((skill) => (
          <Tag key={skill} variant="primary">
            {skill}
          </Tag>
        ))}
      </TagList>
    </div>

    <p className={scss.projects}>Projects: {user.projectsCount}</p>

    <Button href={`/profile/${user.id}`} variant="outline" size="sm" fullWidth className={scss.button}>
      View profile
    </Button>
  </article>
);

export default PersonCard;
