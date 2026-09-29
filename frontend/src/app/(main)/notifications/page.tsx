import type { Metadata } from "next";
import NotificationsPage from "@/components/pages/notifications/NotificationsPage";

export const metadata: Metadata = { title: "Notifications" };

const page = () => <NotificationsPage />;

export default page;
