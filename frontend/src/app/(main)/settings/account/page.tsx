import type { Metadata } from "next";
import { getI18n } from "@/i18n/server";
import AccountSettings from "@/components/pages/settings/AccountSettings";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.meta.accountSettings };
}

// ?error=google_taken и т.п. приходит после неудачной привязки Google
const page = async ({ searchParams }: PageProps<"/settings/account">) => {
  const { error } = await searchParams;
  return <AccountSettings error={typeof error === "string" ? error : undefined} />;
};

export default page;
