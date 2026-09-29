import type { Metadata } from "next";
import AccountSettings from "@/components/pages/settings/AccountSettings";

export const metadata: Metadata = { title: "Account settings" };

// ?error=google_taken и т.п. приходит после неудачной привязки Google
const page = async ({ searchParams }: PageProps<"/settings/account">) => {
  const { error } = await searchParams;
  return <AccountSettings error={typeof error === "string" ? error : undefined} />;
};

export default page;
