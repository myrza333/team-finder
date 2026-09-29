import type { Metadata } from "next";
import AppearanceSettings from "@/components/pages/settings/AppearanceSettings";

export const metadata: Metadata = { title: "Appearance" };

const page = () => <AppearanceSettings />;

export default page;
