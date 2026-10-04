"use client";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { I18nProvider } from "@/i18n/client";
import type { Locale } from "@/i18n/config";
import { useRealtime } from "@/lib/realtime";

// WebSocket-соединение (чат, уведомления, кто в сети) — одно на весь сайт
const Realtime = () => {
  useRealtime();
  return null;
};

const Providers = ({ locale, children }: { locale: Locale; children: React.ReactNode }) => {
  // useState — чтобы QueryClient создавался один раз, а не на каждом рендере
  const [queryClient] = useState(() => new QueryClient());
  return (
    <I18nProvider locale={locale}>
      <QueryClientProvider client={queryClient}>
        <Realtime />
        {children}
      </QueryClientProvider>
    </I18nProvider>
  );
};

export default Providers;
