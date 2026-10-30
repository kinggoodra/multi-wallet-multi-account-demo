"use client";

import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { config } from "@/lib/wagmi";
import { DashboardStateProvider } from "@/components/wallet/DashboardState";

export default function Providers({
  children,
}: {
  children: ReactNode;
}) {
  const [client] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={client}>
        <DashboardStateProvider>{children}</DashboardStateProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
