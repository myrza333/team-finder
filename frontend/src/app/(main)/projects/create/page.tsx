import type { Metadata } from "next";
import { getI18n } from "@/i18n/server";
import CreateProjectPage from "@/components/pages/createProject/CreateProjectPage";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.meta.createProject };
}

const page = () => <CreateProjectPage />;

export default page;
