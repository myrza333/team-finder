import type { Metadata } from "next";
import LegalPage from "@/components/pages/legal/LegalPage";
import { privacyPolicy } from "@/data/legal";

export const metadata: Metadata = { title: "Privacy Policy" };

const page = () => (
  <LegalPage document={privacyPolicy} related={{ label: "Terms of Service", href: "/terms" }} />
);

export default page;
