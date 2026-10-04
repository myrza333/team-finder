import type { Metadata } from "next";
import { getI18n } from "@/i18n/server";
import SearchPage from "@/components/pages/search/SearchPage";

export async function generateMetadata({ searchParams }: PageProps<"/search">): Promise<Metadata> {
  const { q } = await searchParams;
  const { t } = await getI18n();
  return { title: typeof q === "string" && q.trim() ? t.meta.searchFor(q.trim()) : t.meta.search };
}

const page = async ({ searchParams }: PageProps<"/search">) => {
  const { q } = await searchParams;
  return <SearchPage query={typeof q === "string" ? q : ""} />;
};

export default page;
