import type { PublicClient } from "viem";
import type { Connection, Connector } from "wagmi";
import { Plus } from "lucide-react";
import type { AccountCandidate, DashboardPage } from "./wallet/types";
import ConnectWalletExtensions from "./wallet/ConnectWalletExtensions";
import AddWatchedAddress from "./wallet/AddWatchedAddress";
import ManagedAccounts from "./wallet/ManagedAccounts";
import SpotlightCard from "./ui/SpotlightCard";
import type { ConnectionStatus } from "./wallet/types";
import WatchAddressPreview from "./wallet/WatchAddressPreview";

type Props = {
  page: DashboardPage;
  connectors: readonly Connector[];
  connections: readonly Connection[];
  entries: Array<AccountCandidate & { id: string; canSign: boolean }>;
  selected: string[];
  balances: Record<string, string>;
  client: PublicClient | undefined;
  walletUid: string;
  address: string;
  message: string;
  pendingConnectorUid: string | null;
  pendingConnectorName: string | null;
  cancelHelpShown: boolean;
  connectionStatus: ConnectionStatus;
  errorMessage?: string;
  onConnect: (connector: Connector) => void;
  onDisconnect: (connector: Connector) => void;
  onCancelConnection: () => void;
  onWalletChange: (uid: string) => void;
  onAddressChange: (address: string) => void;
  onAddWatch: () => void;
  onSelectionChange: (id: string, checked: boolean) => void;
};

export default function DashboardPageSections(props: Props) {
  const { page } = props;

  if (page === "dashboard") {
    return (
      <SpotlightCard className="flex min-h-[270px] flex-col justify-between p-[26px_28px_23px] max-[1050px]:min-h-[285px] max-[680px]:min-h-0 max-[680px]:rounded-[17px] max-[680px]:p-[18px_16px_15px]" id="connect">
        <div className="relative z-[1]">
          <span className="inline-flex items-center gap-2 rounded-[30px] bg-[#556b2f]/25 px-[10px] py-[6px] text-[9px] font-bold tracking-[.1em] text-[#b6d375]"><i className="size-[6px] rounded-full bg-[#b5d76c]" /> WALLET ACCESS</span>
          <h2 className="mt-4 mb-1 text-2xl font-bold tracking-[-.035em] max-[680px]:mt-[13px] max-[680px]:text-[21px]">Your wallets, in one place.</h2>
          <p className="m-0 text-[11px] text-[#a6b3a8] max-[680px]:max-w-[265px] max-[680px]:text-[10px] max-[680px]:leading-[1.55]">Connect an extension to manage authorized accounts and watch addresses.</p>
        </div>
        <div className="pointer-events-none absolute -top-[58px] right-[7%] grid size-[220px] place-items-center rounded-full opacity-100 max-[850px]:right-[1%] max-[850px]:opacity-50 max-[680px]:-top-[30px] max-[680px]:-right-10 max-[680px]:size-[135px] max-[680px]:opacity-70" aria-hidden="true"><span className="absolute size-full rounded-full border border-[#718d4560]" /><span className="absolute size-[67%] rounded-full border border-[#718d4580]" /><b className="grid size-[34%] place-items-center rounded-full border border-[#718d4560] bg-[#556b2f]/25 text-[#b5d76c]"><Plus size={22} /></b></div>
        <div className="relative z-[1] mt-[27px] max-[680px]:mt-[18px]">
          <ConnectWalletExtensions
            connectors={props.connectors}
            connections={props.connections}
            pendingConnectorUid={props.pendingConnectorUid}
            pendingConnectorName={props.pendingConnectorName}
            cancelHelpShown={props.cancelHelpShown}
            connectionStatus={props.connectionStatus}
            errorMessage={props.errorMessage}
            onConnect={props.onConnect}
            onDisconnect={props.onDisconnect}
            onCancelConnection={props.onCancelConnection}
          />
        </div>
      </SpotlightCard>
    );
  }

  if (page === "watch") {
    return (
      <>
        <section id="watch" className="mt-[25px] max-[680px]:mt-[23px]">
          <SpotlightCard className="bg-[linear-gradient(105deg,#10351f,#0d2c1a)] p-4 px-[18px] max-[680px]:bg-[#0d2c1a] max-[680px]:p-[14px]">
            <AddWatchedAddress
              connections={props.connections}
              walletUid={props.walletUid}
              address={props.address}
              message={props.message}
              disabled={!!props.pendingConnectorUid}
              onWalletChange={props.onWalletChange}
              onAddressChange={props.onAddressChange}
              onAdd={props.onAddWatch}
            />
          </SpotlightCard>
        </section>
        <WatchAddressPreview />
      </>
    );
  }

  return (
    <section id="accounts" className="mt-[25px] max-[680px]:mt-[23px]">
      <div className="mb-[11px] flex items-end justify-between">
        <span className="rounded-[10px] border border-[#2b4832] bg-[#0d2c1a] px-[10px] py-[7px] text-[9px] text-[#b7c5b9]">{props.entries.length} {props.entries.length === 1 ? "account" : "accounts"}</span>
      </div>
      <SpotlightCard className="bg-[linear-gradient(105deg,#10351f,#0d2c1a)] px-[17px] py-1 max-[680px]:px-[13px] max-[680px]:py-0">
        <ManagedAccounts
          entries={props.entries}
          selected={props.selected}
          balances={props.balances}
          client={props.client}
          onSelectionChange={props.onSelectionChange}
        />
      </SpotlightCard>
    </section>
  );
}
