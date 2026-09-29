"use client";
import Button from "@/components/ui/Button/Button";
import scss from "../not-found.module.scss";

const ErrorPage = ({ retry }: { error: Error & { digest?: string }; retry: () => void }) => (
  <div className={scss.page}>
    <p className={scss.code}>Oops</p>
    <h1 className={scss.title}>Something went wrong</h1>
    <p className={scss.text}>We couldn&apos;t load this page. Check that the server is running and try again.</p>
    <div className={scss.actions}>
      <Button href="/" variant="outline" size="lg">
        Go home
      </Button>
      <Button size="lg" onClick={retry}>
        Try again
      </Button>
    </div>
  </div>
);

export default ErrorPage;
