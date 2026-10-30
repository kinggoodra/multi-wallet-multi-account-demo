import type { Connector, Connection } from "wagmi";
import ConnectorIcon from "./ConnectorIcon";
import { metaMaskInstallUrl, useWalletInstallation, WalletInstallationAction } from "./WalletInstallation";
import type { ConnectorWithIcon } from "./types";

type Props = {
  connectors: readonly Connector[];
  connections: readonly Connection[];
  pendingConnectorUid: string | null;
  pendingConnectorName: string | null;
  cancelHelpShown: boolean;
  connectionStatus: "idle" | "connecting" | "connected" | "rejected" | "error";
  errorMessage?: string;
  onConnect: (connector: Connector) => void;
  onDisconnect: (connector: Connector) => void;
  onCancelConnection: () => void;
};

export default function ConnectWalletExtensions({ connectors, connections, pendingConnectorUid, pendingConnectorName, cancelHelpShown, connectionStatus, errorMessage, onConnect, onDisconnect, onCancelConnection }: Props) {
  const { installed, checkingInstallations } = useWalletInstallation(connectors);
  const showToast = connectionStatus === "connected" || connectionStatus === "rejected" || connectionStatus === "error";

  return (
    <section className="connect-wallets">
      <h2>1. Connect wallet extensions</h2>
      <p>Connect or disconnect wallets from here.</p>

      {pendingConnectorUid && <div role="status"><div><strong>Waiting for wallet approval</strong><p>{pendingConnectorName} is waiting for your response.</p>{cancelHelpShown && <p>Open the wallet popup and select Reject. This app cannot programmatically reject the wallet's native request.</p>}</div><button onClick={onCancelConnection}>Cancel request</button></div>}

      <div className="connector-grid">
        {connectors.map(c => {
          const connector = c as Connector & ConnectorWithIcon;
          const isThisConnectorPending = pendingConnectorUid === c.uid;
          const isConnected = connections.some(connection => connection.connector.uid === c.uid);
          const isInstalled = installed[c.uid];
          return <div className="connector-card" key={c.uid}>
            <div className="connector-info"><ConnectorIcon connector={connector}/><div><strong>{c.name}</strong><p>{isThisConnectorPending ? "Waiting for approval..." : isConnected ? "Connected" : checkingInstallations ? "Checking wallet..." : isInstalled ? "Not connected" : "Wallet not installed"}</p></div></div>
            <div>{isConnected ? <button className="wallet-action secondary-action" disabled={isThisConnectorPending || !!pendingConnectorUid} onClick={() => onDisconnect(c)}>Disconnect</button> : <WalletInstallationAction connector={c} isInstalled={isInstalled} checkingInstallations={checkingInstallations} disabled={!!pendingConnectorUid} onConnect={() => onConnect(c)}/>}</div>
          </div>;
        })}
      </div>

      {connectors.length === 0 && <div role="status"><strong>No wallet connector detected</strong><p>Install a compatible wallet extension and refresh the page.</p><a href={metaMaskInstallUrl} target="_blank" rel="noreferrer">Install MetaMask</a></div>}

      {showToast && <p role="status">{connectionStatus === "connected" ? "Wallet connected. Your wallet was connected successfully." : `Wallet connection failed. ${errorMessage ?? "The wallet request was rejected or cancelled."}`}</p>}
    </section>
  );
}
