import type { Metadata } from "next";
import { getI18n } from "@/i18n/server";
import MyProjectsPage from "@/components/pages/myProjects/MyProjectsPage";
import { requireUser } from "@/lib/api.server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.meta.myProjects };
}

const page = async () => {
  const me = await requireUser("/my-projects");
  return <MyProjectsPage userId={me.id} />;
};

export default page;
