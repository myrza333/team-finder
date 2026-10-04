"use client";
import Button from "@/components/ui/Button/Button";
import { useI18n } from "@/i18n/client";
import scss from "../not-found.module.scss";

const ErrorPage = ({ retry }: { error: Error & { digest?: string }; retry: () => void }) => {
  const { t } = useI18n();
  return (
    <div className={scss.page}>
      <p className={scss.code}>{t.error.code}</p>
      <h1 className={scss.title}>{t.error.title}</h1>
      <p className={scss.text}>{t.error.text}</p>
      <div className={scss.actions}>
        <Button href="/" variant="outline" size="lg">
          {t.notFound.home}
        </Button>
        <Button size="lg" onClick={retry}>
          {t.error.retry}
        </Button>
      </div>
    </div>
  );
};

export default ErrorPage;
