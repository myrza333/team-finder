import type { Metadata } from "next";
import { getI18n } from "@/i18n/server";
import AboutPage from "@/components/pages/about/AboutPage";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.meta.about };
}

// Видна и гостям: в proxy.ts этого адреса нет среди закрытых
const page = () => <AboutPage />;

export default page;
