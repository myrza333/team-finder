import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CreateProjectPage from "@/components/pages/createProject/CreateProjectPage";
import { orNull } from "@/lib/api";
import { requireUser, serverApi } from "@/lib/api.server";

export const metadata: Metadata = { title: "Edit project" };

const page = async ({ params }: PageProps<"/projects/[id]/edit">) => {
  const { id } = await params;
  const me = await requireUser(`/projects/${id}/edit`);
  const project = await orNull(serverApi.projects.get(id));
  if (!project || project.owner.id !== me.id) notFound();
  return <CreateProjectPage project={project} />;
};

export default page;
