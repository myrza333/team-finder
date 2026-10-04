import type { Metadata } from "next";
import { getI18n } from "@/i18n/server";
import { notFound } from "next/navigation";
import ProfilePage from "@/components/pages/profile/ProfilePage";
import { orNull } from "@/lib/api";
import { requireUser, serverApi } from "@/lib/api.server";

export async function generateMetadata({ params }: PageProps<"/profile/[id]">): Promise<Metadata> {
  const { id } = await params;
  const user = await orNull(serverApi.users.get(id)).catch(() => null);
  const { t } = await getI18n();
  return { title: user?.name ?? t.meta.profile };
}

const page = async ({ params }: PageProps<"/profile/[id]">) => {
  const { id } = await params;
  const me = await requireUser(`/profile/${id}`);
  const user = await orNull(serverApi.users.get(id));
  if (!user) notFound();
  const projects = await serverApi.projects.list({ member: user.id });
  return <ProfilePage user={user} projects={projects} isOwn={user.id === me.id} />;
};

export default page;
