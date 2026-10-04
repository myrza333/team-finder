import type { Metadata } from "next";
import { getI18n } from "@/i18n/server";

// Личный чат. Саму переписку рисует Chat в layout (как и для чатов команд)
export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.meta.messages };
}

const page = () => null;

export default page;
