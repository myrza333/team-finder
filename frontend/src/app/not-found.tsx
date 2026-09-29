import Button from "@/components/ui/Button/Button";
import MainShell from "@/components/layout/MainShell/MainShell";
import scss from "./not-found.module.scss";

// Корневой 404 рендерится вне группы (main), поэтому хедер и футер добавляем сами
const NotFound = () => (
  <MainShell>
    <div className={scss.page}>
      <p className={scss.code}>404</p>
      <h1 className={scss.title}>Page not found</h1>
      <p className={scss.text}>This page doesn&apos;t exist or hasn&apos;t been built yet.</p>
      <div className={scss.actions}>
        <Button href="/" variant="outline" size="lg">
          Go home
        </Button>
        <Button href="/projects" size="lg">
          Browse projects
        </Button>
      </div>
    </div>
  </MainShell>
);

export default NotFound;
