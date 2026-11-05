import type { ReactNode } from "react";
import { Eye, Users, Wallet } from "lucide-react";
import Dock from "./ui/Dock";
import type { DashboardPage } from "./wallet/types";
import AddNetworks from "./wallet/AddNetworks";

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
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-[5] flex w-[264px] flex-col border-r border-white/[.07] bg-[#081a10]/95 px-4 py-[30px] max-[1050px]:w-[212px] max-[1050px]:px-[14px] max-[680px]:inset-auto max-[680px]:right-0 max-[680px]:bottom-0 max-[680px]:left-0 max-[680px]:h-[66px] max-[680px]:w-auto max-[680px]:border-t max-[680px]:border-r-0 max-[680px]:border-white/[.08] max-[680px]:bg-[#081a10]/95 max-[680px]:px-[14px] max-[680px]:pt-[6px] max-[680px]:pb-[calc(6px+env(safe-area-inset-bottom))] max-[680px]:backdrop-blur-[14px]">
        <a className="flex items-center gap-3 text-xs font-extrabold tracking-[.12em] max-[680px]:hidden" href="#top">
          <span className="grid size-9 place-items-center rounded-xl border border-[#536839] bg-[#182d1d] text-[#b5d76c]"><Wallet size={18} /></span>
          <span>AVARITIA<small className="mt-1 block text-[8px] font-medium tracking-[.18em] text-[#728178]">WALLET WORKSPACE</small></span>
        </a>
        <p className="mt-[63px] mb-3 mx-3 text-[10px] font-bold tracking-[.18em] text-[#637269] max-[680px]:hidden">WALLET</p>
        <Dock
          items={[
            { label: "Wallet dashboard", icon: <Wallet size={17} />, href: "/", active: page === "dashboard" },
            { label: "Watch address", icon: <Eye size={17} />, href: "/watch", active: page === "watch" },
            { label: "Managed accounts", icon: <Users size={17} />, href: "/accounts", active: page === "accounts" },
          ]}
        />
      </aside>

      <main id="top" className="mx-auto max-w-[1500px] ml-[264px] px-[34px] pb-[30px] max-[1050px]:ml-[212px] max-[1050px]:px-[25px] max-[680px]:mx-0 max-[680px]:px-[17px] max-[680px]:pt-0 max-[680px]:pb-[99px]">
        <header className="flex h-[72px] items-center justify-between border-b border-white/[.05] max-[680px]:h-[61px] max-[680px]:border-0">
          <div className="text-[11px] text-[#839287] max-[680px]:text-[10px]">Workspace <span className="px-2.5 text-[#536157]">/</span> <strong className="font-medium text-[#d7dfd7]">{pageLabels[page]}</strong></div>
        </header>
        <div className="flex items-end justify-between py-[27px] pb-[22px] max-[680px]:items-start max-[680px]:py-[19px] max-[680px]:pb-[17px]">
          <div>
            <p className="mb-2 text-[10px] font-bold tracking-[.17em] text-[#9bb756] max-[680px]:text-[9px]">YOUR FINANCIAL WORKSPACE</p>
            <h1 className="m-0 text-[clamp(28px,2.4vw,34px)] font-bold tracking-[-.045em] leading-[1.08] max-[680px]:text-[27px]">{pageLabels[page]}</h1>
            <p className="mt-2 max-w-[500px] text-xs leading-[1.55] text-[#8d9b90] max-[680px]:max-w-[230px] max-[680px]:text-[10px]">{pageDescriptions[page]}</p>
          </div>
          <AddNetworks />
        </div>
        {children}
        <footer className="flex justify-between gap-[15px] pt-5 text-[9px] text-[#64746a] max-[680px]:text-[8px]">
          <span>Wallet permissions stay with your extension.</span>
          <span className="text-[8px] tracking-[.14em] max-[680px]:text-[7px]"><i className="mr-[5px] inline-block size-[5px] rounded-full bg-[#a8c85d] shadow-[0_0_12px_#a8c85d55]" /> CONNECTED LOCALLY</span>
        </footer>
      </main>
    </div>
  );
}
