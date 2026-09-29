import type { Metadata } from "next";
import SearchPage from "@/components/pages/search/SearchPage";

export async function generateMetadata({ searchParams }: PageProps<"/search">): Promise<Metadata> {
  const { q } = await searchParams;
  return { title: typeof q === "string" && q.trim() ? `Search: ${q.trim()}` : "Search" };
}

const page = async ({ searchParams }: PageProps<"/search">) => {
  const { q } = await searchParams;
  return <SearchPage query={typeof q === "string" ? q : ""} />;
};

export default page;
