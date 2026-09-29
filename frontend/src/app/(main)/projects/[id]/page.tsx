import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProjectDetailPage from "@/components/pages/projectDetail/ProjectDetailPage";
import { orNull } from "@/lib/api";
import { requireUser, serverApi } from "@/lib/api.server";

export async function generateMetadata({ params }: PageProps<"/projects/[id]">): Promise<Metadata> {
  const { id } = await params;
  const project = await orNull(serverApi.projects.get(id)).catch(() => null);
  return { title: project?.title ?? "Project" };
}

const page = async ({ params }: PageProps<"/projects/[id]">) => {
  const { id } = await params;
  const me = await requireUser(`/projects/${id}`);
  const project = await orNull(serverApi.projects.get(id));
  if (!project) notFound();
  return <ProjectDetailPage project={project} currentUserId={me.id} />;
};

export default page;
