import type { Metadata } from "next";
import MyProjectsPage from "@/components/pages/myProjects/MyProjectsPage";
import { requireUser } from "@/lib/api.server";

export const metadata: Metadata = { title: "My projects" };

const page = async () => {
  const me = await requireUser("/my-projects");
  return <MyProjectsPage userId={me.id} />;
};

export default page;
