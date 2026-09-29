import type { Metadata } from "next";
import { orNull } from "@/lib/api";
import { serverApi } from "@/lib/api.server";

// Заголовок вкладки — название проекта. Саму переписку рисует Chat в layout
export async function generateMetadata({ params }: PageProps<"/chat/[id]">): Promise<Metadata> {
  const { id } = await params;
  const project = await orNull(serverApi.projects.get(id)).catch(() => null);
  return { title: project ? `${project.title} · Chat` : "Messages" };
}

const page = () => null;

export default page;
