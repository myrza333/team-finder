import type { Metadata } from "next";
import { getI18n } from "@/i18n/server";
import { notFound } from "next/navigation";
import CreateProjectPage from "@/components/pages/createProject/CreateProjectPage";
import { orNull } from "@/lib/api";
import { requireUser, serverApi } from "@/lib/api.server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.meta.editProject };
}

const page = async ({ params }: PageProps<"/projects/[id]/edit">) => {
  const { id } = await params;
  const me = await requireUser(`/projects/${id}/edit`);
  const project = await orNull(serverApi.projects.get(id));
  if (!project || project.owner.id !== me.id) notFound();
  return <CreateProjectPage project={project} />;
};

export default page;
