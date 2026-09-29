import scss from "./EmptyState.module.scss";

type EmptyStateProps = { icon: string; text: string };

const EmptyState = ({ icon, text }: EmptyStateProps) => (
  <div className={scss.empty}>
    <div className={scss.icon}>{icon}</div>
    <p className={scss.text}>{text}</p>
  </div>
);

export default EmptyState;
