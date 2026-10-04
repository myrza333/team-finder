import type { Metadata } from "next";
import { getI18n } from "@/i18n/server";
import NotificationsPage from "@/components/pages/notifications/NotificationsPage";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.meta.notifications };
}

const page = () => <NotificationsPage />;

export default page;
