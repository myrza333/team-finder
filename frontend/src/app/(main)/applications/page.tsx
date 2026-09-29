import type { Metadata } from "next";
import ApplicationsPage from "@/components/pages/applications/ApplicationsPage";

export const metadata: Metadata = { title: "Applications" };

// ?tab=sent открывает вкладку отправленных заявок
const page = async ({ searchParams }: PageProps<"/applications">) => {
  const { tab } = await searchParams;
  const initialTab = tab === "sent" ? "sent" : "received";
  return <ApplicationsPage key={initialTab} initialTab={initialTab} />;
};

export default page;
