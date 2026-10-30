import type { ReactNode } from "react";
import { Eye, ShieldCheck, Users, Wallet } from "lucide-react";
import Dock from "./ui/Dock";
import type { DashboardPage } from "./wallet/types";

type Props = {
  page: DashboardPage;
  children: ReactNode;
};

const pageLabels: Record<DashboardPage, string> = {
  dashboard: "Wallet dashboard",
  watch: "Watch an address",
  accounts: "Managed accounts",
};

const pageDescriptions: Record<DashboardPage, string> = {
  dashboard: "Connect wallets and keep every account in view.",
  watch: "Register an address to monitor it as watch-only.",
  accounts:
    "The wallet controls the active signing account. Review balances and status here.",
};

export default function DashboardLayout({ page, children }: Props) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#top">
          <span className="brand-mark"><Wallet size={18} /></span>
          <span>AVARITIA<small>WALLET WORKSPACE</small></span>
        </a>
        <p className="side-label">WALLET</p>
        <Dock
          items={[
            { label: "Wallet dashboard", icon: <Wallet size={17} />, href: "/", active: page === "dashboard" },
            { label: "Watch address", icon: <Eye size={17} />, href: "/watch", active: page === "watch" },
            { label: "Managed accounts", icon: <Users size={17} />, href: "/accounts", active: page === "accounts" },
          ]}
        />
        <div className="sidebar-bottom">
          <span className="online-dot" /> Sepolia testnet
          <small>Permissions stay with your wallet.</small>
        </div>
      </aside>

      <main id="top" className="dashboard">
        <header className="topbar">
          <div className="breadcrumbs">Workspace <span>/</span> <strong>{pageLabels[page]}</strong></div>
          <span className="network-pill"><i /> Sepolia testnet</span>
        </header>
        <div className="page-heading">
          <div>
            <p className="eyebrow">YOUR FINANCIAL WORKSPACE</p>
            <h1>{pageLabels[page]}</h1>
            <p className="subhead">{pageDescriptions[page]}</p>
          </div>
          <div className="secure-pill"><ShieldCheck size={15} /> Secure session</div>
        </div>
        {children}
        <footer className="dashboard-footer">
          <span>Wallet permissions stay with your extension.</span>
          <span><i /> CONNECTED LOCALLY</span>
        </footer>
      </main>
    </div>
  );
}
