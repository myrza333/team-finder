import type { Metadata } from "next";
import { getI18n } from "@/i18n/server";
import PeoplePage from "@/components/pages/people/PeoplePage";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.meta.people };
}

const page = async ({ searchParams }: PageProps<"/people">) => {
  const { q } = await searchParams;
  const initialQuery = typeof q === "string" ? q : "";
  return <PeoplePage key={initialQuery} initialQuery={initialQuery} />;
};

export default page;
