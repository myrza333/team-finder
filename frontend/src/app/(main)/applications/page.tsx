import type { Metadata } from "next";
import { getI18n } from "@/i18n/server";
import ApplicationsPage from "@/components/pages/applications/ApplicationsPage";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.meta.applications };
}

// ?tab=sent открывает вкладку отправленных заявок
const page = async ({ searchParams }: PageProps<"/applications">) => {
  const { tab } = await searchParams;
  const initialTab = tab === "sent" ? "sent" : "received";
  return <ApplicationsPage key={initialTab} initialTab={initialTab} />;
};

export default page;
