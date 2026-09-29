import type { Metadata } from "next";
import LegalPage from "@/components/pages/legal/LegalPage";
import { termsOfService } from "@/data/legal";

export const metadata: Metadata = { title: "Terms of Service" };

const page = () => (
  <LegalPage document={termsOfService} related={{ label: "Privacy Policy", href: "/privacy" }} />
);

export default page;
