import { redirect } from "next/navigation";

// /settings сразу открывает первый раздел
const page = () => redirect("/settings/profile");

export default page;
