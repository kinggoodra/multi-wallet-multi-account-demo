import type { PublicClient } from "viem";
import type { Connection, Connector } from "wagmi";
import { Plus } from "lucide-react";
import type { AccountCandidate, DashboardPage } from "./wallet/types";
import ConnectWalletExtensions from "./wallet/ConnectWalletExtensions";
import AddWatchedAddress from "./wallet/AddWatchedAddress";
import ManagedAccounts from "./wallet/ManagedAccounts";
import SpotlightCard from "./ui/SpotlightCard";
import type { ConnectionStatus } from "./wallet/types";

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
      <SpotlightCard className="hero-panel" id="connect">
        <div className="hero-copy">
          <span className="section-chip"><i /> WALLET ACCESS</span>
          <h2>Your wallets, in one place.</h2>
          <p>Connect an extension to manage authorized accounts and watch addresses.</p>
        </div>
        <div className="hero-orbit" aria-hidden="true"><span /><span /><b><Plus size={22} /></b></div>
        <div className="wallet-section">
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
      <section id="watch" className="content-section">
        <SpotlightCard className="watch-panel">
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
    );
  }

  return (
    <section id="accounts" className="content-section">
      <div className="section-heading">
        <span className="count-pill">{props.entries.length} {props.entries.length === 1 ? "account" : "accounts"}</span>
      </div>
      <SpotlightCard className="accounts-panel">
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
