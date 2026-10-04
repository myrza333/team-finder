import type { Metadata } from "next";
import { getI18n } from "@/i18n/server";
import ProjectsPage from "@/components/pages/projects/ProjectsPage";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.meta.projects };
}

// ?q= приходит из поиска в хедере
const page = async ({ searchParams }: PageProps<"/projects">) => {
  const { q } = await searchParams;
  const initialQuery = typeof q === "string" ? q : "";
  // key — чтобы при новом поиске из хедера состояние страницы сбрасывалось
  return <ProjectsPage key={initialQuery} initialQuery={initialQuery} />;
};

export default page;
