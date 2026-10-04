import type { Metadata } from "next";
import { getI18n } from "@/i18n/server";
import AnnouncementsPage from "@/components/pages/announcements/AnnouncementsPage";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.meta.announcements };
}

// Видна и гостям: в proxy.ts этого адреса нет среди закрытых
const page = () => <AnnouncementsPage />;

export default page;
