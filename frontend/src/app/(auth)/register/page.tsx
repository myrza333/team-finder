import type { Metadata } from "next";
import RegisterPage from "@/components/pages/auth/RegisterPage";

export const metadata: Metadata = { title: "Create account" };

// next — куда вернуть после входа (его подставляет proxy.ts при редиректе на /login)
const page = async ({ searchParams }: PageProps<"/register">) => {
  const { next, error } = await searchParams;
  const safeNext = typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : "/";
  return <RegisterPage next={safeNext} error={typeof error === "string" ? error : undefined} />;
};

export default page;
