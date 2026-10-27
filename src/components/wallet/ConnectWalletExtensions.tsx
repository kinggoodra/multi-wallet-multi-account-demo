import { useEffect, useState } from "react";
import type { Connector, Connection } from "wagmi";
import ConnectorIcon from "./ConnectorIcon";
import type { ConnectorWithIcon } from "./types";

type Props = {
  connectors: readonly Connector[];
  connections: readonly Connection[];
  pendingConnectorUid: string | null;
  pendingConnectorName: string | null;
  cancelHelpShown: boolean;
  connectionStatus:
    | "idle"
    | "connecting"
    | "connected"
    | "rejected"
    | "error";
  errorMessage?: string;
  onConnect: (connector: Connector) => void;
  onDisconnect: (connector: Connector) => void;
  onCancelConnection: () => void;
};

const installUrls: Record<string, string> = {
  metamask: "https://metamask.io/download/",
  coinbase: "https://www.coinbase.com/wallet/downloads",
  trust: "https://trustwallet.com/download",
  rabby: "https://rabby.io/",
};

function getInstallUrl(connector: Connector) {
  const name = connector.name.toLowerCase();

  if (name.includes("metamask")) {
    return installUrls.metamask;
  }

  if (name.includes("coinbase")) {
    return installUrls.coinbase;
  }

  if (name.includes("trust")) {
    return installUrls.trust;
  }

  if (name.includes("rabby")) {
    return installUrls.rabby;
  }

  return null;
}

export default function ConnectWalletExtensions({
  connectors,
  connections,
  pendingConnectorUid,
  pendingConnectorName,
  cancelHelpShown,
  connectionStatus,
  errorMessage,
  onConnect,
  onDisconnect,
  onCancelConnection,
}: Props) {
  const [installed, setInstalled] = useState<Record<string, boolean>>({});
  const [checkingInstallations, setCheckingInstallations] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function checkInstalledWallets() {
      setCheckingInstallations(true);

      const results = await Promise.all(
        connectors.map(async (connector) => {
          try {
            await connector.getProvider();
            return [connector.uid, true] as const;
          } catch {
            return [connector.uid, false] as const;
          }
        }),
      );

      if (!cancelled) {
        setInstalled(Object.fromEntries(results));
        setCheckingInstallations(false);
      }
    }

    void checkInstalledWallets();

    return () => {
      cancelled = true;
    };
  }, [connectors]);

  return (
    <section className="panel">
      <h2>1. Connect wallet extensions</h2>

      <p className="caption">
        Connect or disconnect wallets from here.
      </p>

      {pendingConnectorUid && (
        <div className="connection-status" role="status">
          <div>
            <strong>Waiting for wallet approval</strong>
            <span className="caption">
              {pendingConnectorName} is waiting for your response.
            </span>
            {cancelHelpShown && (
              <span className="caption">
                Open the wallet popup and select Reject. This app cannot
                programmatically reject the wallet's native request.
              </span>
            )}
          </div>

          <button
            className="secondary-button"
            onClick={onCancelConnection}
          >
            Cancel request
          </button>
        </div>
      )}

      <div className="cards">
        {connectors.map((c) => {
          const connector = c as Connector & ConnectorWithIcon;
          const isThisConnectorPending = pendingConnectorUid === c.uid;
          const isConnected = connections.some(
            (connection) => connection.connector.uid === c.uid,
          );
          const isInstalled = installed[c.uid];
          const installUrl = getInstallUrl(c);

          return (
            <div className="card connector-card" key={c.uid}>
              <div className="connector-brand">
                <ConnectorIcon connector={connector} />

                <div>
                  <strong>{c.name}</strong>
                  <span className="caption">
                    {isThisConnectorPending
                      ? "Waiting for approval..."
                      : isConnected
                        ? "Connected"
                        : checkingInstallations
                          ? "Checking wallet..."
                          : isInstalled
                            ? "Not connected"
                            : "Wallet not installed"}
                  </span>
                </div>
              </div>

              <div>
                {isConnected ? (
                  <button
                    className="secondary-button"
                    disabled={
                      isThisConnectorPending || !!pendingConnectorUid
                    }
                    onClick={() => onDisconnect(c)}
                  >
                    Disconnect
                  </button>
                ) : !checkingInstallations && !isInstalled && installUrl ? (
                  <a
                    className="button"
                    href={installUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Install
                  </a>
                ) : (
                  <button
                    disabled={
                      !!pendingConnectorUid ||
                      checkingInstallations ||
                      !isInstalled
                    }
                    onClick={() => onConnect(c)}
                  >
                    {isThisConnectorPending ? "Waiting..." : "Connect"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {connectors.length === 0 && (
        <div className="connection-status" role="status">
          <strong>No wallet connector detected</strong>
          <span className="caption">
            Install a compatible wallet extension and refresh the page.
          </span>
          <a
            className="button"
            href={installUrls.metamask}
            target="_blank"
            rel="noreferrer"
          >
            Install MetaMask
          </a>
        </div>
      )}

      {connectionStatus === "rejected" && (
        <p className="warn">
          The wallet request was rejected or cancelled.
        </p>
      )}

      {connectionStatus === "error" && !pendingConnectorUid && (
        <p className="warn">
          {errorMessage?.includes("Connector already connected")
            ? "Connector already connected."
            : errorMessage ?? "The wallet connection failed."}
        </p>
      )}
    </section>
  );
}
