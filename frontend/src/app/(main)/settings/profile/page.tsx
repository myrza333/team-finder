import type { Metadata } from "next";
import { getI18n } from "@/i18n/server";
import ProfileSettings from "@/components/pages/settings/ProfileSettings";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.meta.profileSettings };
}

const page = () => <ProfileSettings />;

export default page;
