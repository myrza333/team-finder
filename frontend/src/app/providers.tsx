"use client";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRealtime } from "@/lib/realtime";

// WebSocket-соединение (чат, уведомления, кто в сети) — одно на весь сайт
const Realtime = () => {
  useRealtime();
  return null;
};

const Providers = ({ children }: { children: React.ReactNode }) => {
  // useState — чтобы QueryClient создавался один раз, а не на каждом рендере
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <Realtime />
      {children}
    </QueryClientProvider>
  );
};

export default Providers;
