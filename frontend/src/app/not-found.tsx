import Button from "@/components/ui/Button/Button";
import MainShell from "@/components/layout/MainShell/MainShell";
import { getI18n } from "@/i18n/server";
import scss from "./not-found.module.scss";

// Корневой 404 рендерится вне группы (main), поэтому хедер и футер добавляем сами
const NotFound = async () => {
  const { t } = await getI18n();
  return (
    <MainShell>
      <div className={scss.page}>
        <p className={scss.code}>404</p>
        <h1 className={scss.title}>{t.notFound.title}</h1>
        <p className={scss.text}>{t.notFound.text}</p>
        <div className={scss.actions}>
          <Button href="/" variant="outline" size="lg">
            {t.notFound.home}
          </Button>
          <Button href="/projects" size="lg">
            {t.notFound.browse}
          </Button>
        </div>
      </div>
    </MainShell>
  );
};

export default NotFound;
