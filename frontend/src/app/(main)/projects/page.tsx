import type { Metadata } from "next";
import ProjectsPage from "@/components/pages/projects/ProjectsPage";

export const metadata: Metadata = { title: "Projects" };

// ?q= приходит из поиска в хедере
const page = async ({ searchParams }: PageProps<"/projects">) => {
  const { q } = await searchParams;
  const initialQuery = typeof q === "string" ? q : "";
  // key — чтобы при новом поиске из хедера состояние страницы сбрасывалось
  return <ProjectsPage key={initialQuery} initialQuery={initialQuery} />;
};

export default page;
