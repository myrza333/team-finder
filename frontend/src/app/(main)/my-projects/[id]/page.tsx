import type { Metadata } from "next";
import { getI18n } from "@/i18n/server";
import { notFound } from "next/navigation";
import ManageProjectPage from "@/components/pages/manageProject/ManageProjectPage";
import { orNull } from "@/lib/api";
import { requireUser, serverApi } from "@/lib/api.server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.meta.manageProject };
}

const page = async ({ params }: PageProps<"/my-projects/[id]">) => {
  const { id } = await params;
  const me = await requireUser(`/my-projects/${id}`);
  const project = await orNull(serverApi.projects.get(id));
  if (!project || project.owner.id !== me.id) notFound();
  return <ManageProjectPage project={project} />;
};

export default page;
