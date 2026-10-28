import type { Connector, Connection } from "wagmi";
import ConnectorIcon from "./ConnectorIcon";
import { metaMaskInstallUrl, useWalletInstallation, WalletInstallationAction } from "./WalletInstallation";
import type { ConnectorWithIcon } from "./types";
import SwipeToast from "../ui/SwipeToast";

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
    <section className="panel">
      <h2>1. Connect wallet extensions</h2>
      <p className="caption">Connect or disconnect wallets from here.</p>

      {pendingConnectorUid && <div className="connection-status" role="status"><div><strong>Waiting for wallet approval</strong><span className="caption">{pendingConnectorName} is waiting for your response.</span>{cancelHelpShown && <span className="caption">Open the wallet popup and select Reject. This app cannot programmatically reject the wallet's native request.</span>}</div><button className="secondary-button" onClick={onCancelConnection}>Cancel request</button></div>}

      <div className="cards">
        {connectors.map(c => {
          const connector = c as Connector & ConnectorWithIcon;
          const isThisConnectorPending = pendingConnectorUid === c.uid;
          const isConnected = connections.some(connection => connection.connector.uid === c.uid);
          const isInstalled = installed[c.uid];
          return <div className="card connector-card" key={c.uid}>
            <div className="connector-brand"><ConnectorIcon connector={connector}/><div><strong>{c.name}</strong><span className="caption">{isThisConnectorPending ? "Waiting for approval..." : isConnected ? "Connected" : checkingInstallations ? "Checking wallet..." : isInstalled ? "Not connected" : "Wallet not installed"}</span></div></div>
            <div>{isConnected ? <button className="secondary-button" disabled={isThisConnectorPending || !!pendingConnectorUid} onClick={() => onDisconnect(c)}>Disconnect</button> : <WalletInstallationAction connector={c} isInstalled={isInstalled} checkingInstallations={checkingInstallations} disabled={!!pendingConnectorUid} onConnect={() => onConnect(c)}/>}</div>
          </div>;
        })}
      </div>

      {connectors.length === 0 && <div className="connection-status" role="status"><strong>No wallet connector detected</strong><span className="caption">Install a compatible wallet extension and refresh the page.</span><a className="button" href={metaMaskInstallUrl} target="_blank" rel="noreferrer">Install MetaMask</a></div>}

      {showToast && <SwipeToast open title={connectionStatus === "connected" ? "Wallet connected" : "Wallet connection failed"} description={connectionStatus === "connected" ? "Your wallet was connected successfully." : errorMessage ?? "The wallet request was rejected or cancelled."} />}
    </section>
  );
}
