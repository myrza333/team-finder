import type { Metadata } from "next";
import { getI18n } from "@/i18n/server";
import AppearanceSettings from "@/components/pages/settings/AppearanceSettings";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.meta.appearance };
}

const page = () => <AppearanceSettings />;

export default page;
