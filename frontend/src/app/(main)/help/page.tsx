import type { Metadata } from "next";
import { getI18n } from "@/i18n/server";
import HelpPage from "@/components/pages/help/HelpPage";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.meta.help };
}

// Видна и гостям: в proxy.ts этого адреса нет среди закрытых
const page = () => <HelpPage />;

export default page;
