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
    <section>
      <h2 className="hidden">1. Connect wallet extensions</h2>
      <p className="hidden">Connect or disconnect wallets from here.</p>

      {pendingConnectorUid && <div role="status" className="mb-[10px] rounded-[10px] border border-[#536839] bg-[#132a18] px-3 py-[10px] text-[11px] text-[#cfdbc8] max-[680px]:text-[10px]"><div><strong>Waiting for wallet approval</strong><p className="mt-1 text-[#9eaea3]">{pendingConnectorName} is waiting for your response.</p>{cancelHelpShown && <p className="mt-1 text-[#9eaea3]">Open the wallet popup and select Reject. This app cannot programmatically reject the wallet's native request.</p>}</div><button className="mt-2 rounded-md border border-[#718c45] px-3 py-1" onClick={onCancelConnection}>Cancel request</button></div>}

      <div className="grid grid-cols-3 gap-3 max-[1050px]:grid-cols-2 max-[680px]:grid-cols-1 max-[680px]:gap-2">
        {connectors.map(c => {
          const connector = c as Connector & ConnectorWithIcon;
          const isThisConnectorPending = pendingConnectorUid === c.uid;
          const isConnected = connections.some(connection => connection.connector.uid === c.uid);
          const isInstalled = installed[c.uid];
          return <div className="flex min-w-0 items-center justify-between gap-2 rounded-[13px] border border-[#2b4832] bg-[#091e13] px-3 py-[11px] transition duration-200 hover:-translate-y-0.5 hover:border-[#678146] max-[680px]:px-[10px] max-[680px]:py-[9px]" key={c.uid}>
            <div className="flex min-w-0 items-center gap-[10px]"><ConnectorIcon connector={connector}/><div className="min-w-0"><strong className="block overflow-hidden text-ellipsis whitespace-nowrap text-[11px]">{c.name}</strong><p className="mt-1 text-[9px] text-[#87968b]">{isThisConnectorPending ? "Waiting for approval..." : isConnected ? "Connected" : checkingInstallations ? "Checking wallet..." : isInstalled ? "Not connected" : "Wallet not installed"}</p></div></div>
            <div>{isConnected ? <button className="inline-flex min-h-[34px] items-center justify-center whitespace-nowrap rounded-[9px] border border-[#425a43] bg-transparent px-[11px] text-[10px] font-bold text-[#c5d1c7] transition duration-200 hover:-translate-y-px hover:brightness-110 disabled:transform-none disabled:cursor-not-allowed disabled:opacity-50" disabled={isThisConnectorPending || !!pendingConnectorUid} onClick={() => onDisconnect(c)}>Disconnect</button> : <WalletInstallationAction connector={c} isInstalled={isInstalled} checkingInstallations={checkingInstallations} disabled={!!pendingConnectorUid} onConnect={() => onConnect(c)}/>}</div>
          </div>;
        })}
      </div>

      {connectors.length === 0 && <div role="status" className="rounded-[10px] border border-[#536839] bg-[#132a18] px-3 py-[10px] text-[11px] text-[#cfdbc8]"><strong>No wallet connector detected</strong><p className="mt-1 text-[#9eaea3]">Install a compatible wallet extension and refresh the page.</p><a className="text-[#b5d76c] underline" href={metaMaskInstallUrl} target="_blank" rel="noreferrer">Install MetaMask</a></div>}

      {showToast && <p role="status" className="mb-[10px] rounded-[10px] border border-[#536839] bg-[#132a18] px-3 py-[10px] text-[11px] text-[#cfdbc8] max-[680px]:text-[10px]">{connectionStatus === "connected" ? "Wallet connected. Your wallet was connected successfully." : `Wallet connection failed. ${errorMessage ?? "The wallet request was rejected or cancelled."}`}</p>}
    </section>
  );
}
