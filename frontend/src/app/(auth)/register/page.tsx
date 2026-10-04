import type { Metadata } from "next";
import { getI18n } from "@/i18n/server";
import RegisterPage from "@/components/pages/auth/RegisterPage";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.meta.register };
}

// next — куда вернуть после входа (его подставляет proxy.ts при редиректе на /login)
const page = async ({ searchParams }: PageProps<"/register">) => {
  const { next, error } = await searchParams;
  const safeNext = typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : "/";
  return <RegisterPage next={safeNext} error={typeof error === "string" ? error : undefined} />;
};

export default page;
