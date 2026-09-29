import type { Metadata } from "next";
import ProfileSettings from "@/components/pages/settings/ProfileSettings";

export const metadata: Metadata = { title: "Profile settings" };

const page = () => <ProfileSettings />;

export default page;
