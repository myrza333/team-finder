import type { Metadata } from "next";
import { getI18n } from "@/i18n/server";
import { orNull } from "@/lib/api";
import { serverApi } from "@/lib/api.server";

// Заголовок вкладки — название проекта. Саму переписку рисует Chat в layout
export async function generateMetadata({ params }: PageProps<"/chat/[id]">): Promise<Metadata> {
  const { id } = await params;
  const project = await orNull(serverApi.projects.get(id)).catch(() => null);
  const { t } = await getI18n();
  return { title: project ? t.meta.chat(project.title) : t.meta.messages };
}

const page = () => null;

export default page;
