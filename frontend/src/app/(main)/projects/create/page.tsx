import type { Metadata } from "next";
import CreateProjectPage from "@/components/pages/createProject/CreateProjectPage";

export const metadata: Metadata = { title: "Create project" };

const page = () => <CreateProjectPage />;

export default page;
