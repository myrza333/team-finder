import type { Metadata } from "next";
import PeoplePage from "@/components/pages/people/PeoplePage";

export const metadata: Metadata = { title: "People" };

const page = async ({ searchParams }: PageProps<"/people">) => {
  const { q } = await searchParams;
  const initialQuery = typeof q === "string" ? q : "";
  return <PeoplePage key={initialQuery} initialQuery={initialQuery} />;
};

export default page;
