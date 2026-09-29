import type { Metadata } from "next";
import LoginPage from "@/components/pages/auth/LoginPage";

export const metadata: Metadata = { title: "Sign in" };

// next — куда вернуть после входа (его подставляет proxy.ts при редиректе на /login)
const page = async ({ searchParams }: PageProps<"/login">) => {
  const { next, error } = await searchParams;
  const safeNext = typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : "/";
  return <LoginPage next={safeNext} error={typeof error === "string" ? error : undefined} />;
};

export default page;
