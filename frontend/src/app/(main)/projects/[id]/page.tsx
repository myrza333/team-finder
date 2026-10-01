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
  // Проект и моя заявка в него — параллельно
  const [project, myApplications] = await Promise.all([
    orNull(serverApi.projects.get(id)),
    serverApi.applications.sent({ projectId: id }).catch(() => []), // кривой id в адресе — просто "не найдено"
  ]);
  if (!project) notFound();
  // Чужой анонс: подписан ли я на запуск ("Notify me")
  const launch =
    project.announced && project.owner.id !== me.id
      ? await serverApi.launch.subscription(id).catch(() => ({ subscribed: false, subscribers: 0 }))
      : null;
  return (
    <ProjectDetailPage
      project={project}
      currentUserId={me.id}
      myApplication={myApplications[0] ?? null}
      launch={launch}
    />
  );
};

export default page;
