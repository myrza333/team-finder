import type { Metadata } from "next";
import NotificationSettings from "@/components/pages/settings/NotificationSettings";

export const metadata: Metadata = { title: "Notification settings" };

const page = () => <NotificationSettings />;

export default page;
