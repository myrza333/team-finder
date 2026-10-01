import type { Metadata } from "next";
import AnnouncementsPage from "@/components/pages/announcements/AnnouncementsPage";

export const metadata: Metadata = { title: "Announcements" };

// Видна и гостям: в proxy.ts этого адреса нет среди закрытых
const page = () => <AnnouncementsPage />;

export default page;
