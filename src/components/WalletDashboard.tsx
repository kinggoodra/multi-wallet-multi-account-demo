"use client";

import DashboardLayout from "./DashboardLayout";
import DashboardPageSections from "./DashboardPageSections";
import useWalletDashboard from "./wallet/useWalletDashboard";
import type { DashboardPage } from "./wallet/types";

export default function WalletDashboard({
  page = "dashboard",
}: {
  page?: DashboardPage;
}) {
  const dashboard = useWalletDashboard();

  return (
    <DashboardLayout page={page}>
      <DashboardPageSections page={page} {...dashboard} />
    </DashboardLayout>
  );
}
