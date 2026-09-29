import type { Metadata } from "next";
import PrivacySettings from "@/components/pages/settings/PrivacySettings";

export const metadata: Metadata = { title: "Privacy settings" };

const page = () => <PrivacySettings />;

export default page;
