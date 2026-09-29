import type { Metadata } from "next";
import { getProjectById } from "@/data/mock";
import { isChatMember } from "@/data/chat";

export async function generateMetadata({ params }: PageProps<"/chat/[id]">): Promise<Metadata> {
  const { id } = await params;
  const project = getProjectById(id);
  return { title: project && isChatMember(id) ? `${project.title} · Chat` : "Messages" };
}

const page = () => null;

export default page;
