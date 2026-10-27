"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  useConnect,
  useConnections,
  useConnectors,
  useDisconnect,
  usePublicClient,
  type Connector,
} from "wagmi";
import { isAddress, type Address } from "viem";

type WatchedAccount = {
  connectorUid: string;
  wallet: string;
  address: Address;
  chainId: number;
};

type ConnectorWithIcon = {
  uid: string;
  name: string;
  icon?: string;
};

type ConnectionStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "rejected"
  | "error";

function ConnectorIcon({
  connector,
}: {
  connector: ConnectorWithIcon;
}) {
  const fallback = connector.name.slice(0, 1).toUpperCase();

  if (connector.icon) {
    return (
      <img
        className="connector-icon"
        src={connector.icon}
        alt=""
        aria-hidden="true"
      />
    );
  }

  return (
    <span
      className="connector-icon connector-icon-fallback"
      aria-hidden="true"
    >
      {fallback}
    </span>
  );
}

export default function WalletDashboard() {
  const connectors = useConnectors();
  const connections = useConnections();
  const { connectAsync, error } = useConnect();
  const { disconnect } = useDisconnect();
  const client = usePublicClient();

  const [watched, setWatched] = useState<WatchedAccount[]>([]);
  const [walletUid, setWalletUid] = useState("");
  const [address, setAddress] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [balances, setBalances] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("idle");
  const [pendingConnectorUid, setPendingConnectorUid] = useState<
    string | null
  >(null);
  const [pendingConnectorName, setPendingConnectorName] = useState<
    string | null
  >(null);
  const [cancelHelpShown, setCancelHelpShown] = useState(false);

  const connectionRequestId = useRef(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      connectionRequestId.current += 1;
    };
  }, []);

  const entries = useMemo(() => {
    const map = new Map<
      string,
      WatchedAccount & { id: string; canSign: boolean }
    >();

    const insert = (a: WatchedAccount) => {
      const id = [
        a.connectorUid,
        a.chainId,
        a.address.toLowerCase(),
      ].join(":");

      const connection = connections.find(
        (c) => c.connector.uid === a.connectorUid,
      );

      map.set(id, {
        ...a,
        id,
        canSign:
          !!connection &&
          connection.chainId === a.chainId &&
          connection.accounts[0]?.toLowerCase() === a.address.toLowerCase(),
      });
    };

    watched.forEach(insert);

    connections.forEach((c) =>
      c.accounts.forEach((a) =>
        insert({
          connectorUid: c.connector.uid,
          wallet: c.connector.name,
          address: a,
          chainId: c.chainId,
        }),
      ),
    );

    return [...map.values()];
  }, [watched, connections]);

  // Synchronize wallet permissions with Connected wallets and Managed accounts.
  useEffect(() => {
    let checking = false;
    let cancelled = false;

    async function syncWalletConnections() {
      if (checking || document.visibilityState === "hidden") {
        return;
      }

      checking = true;

      try {
        for (const connection of connections) {
          try {
            const accounts = await connection.connector.getAccounts();

            if (cancelled) {
              return;
            }

            const liveAddresses = new Set(
              accounts.map((account) => account.toLowerCase()),
            );
            const previouslyAuthorized = new Set(
              connection.accounts.map((account) => account.toLowerCase()),
            );

            if (accounts.length === 0) {
              // The entire connector lost site authorization: remove its
              // watched entries and checkbox selections as well.
              setWatched((current) =>
                current.filter(
                  (account) => account.connectorUid !== connection.connector.uid,
                ),
              );
              setSelected((current) =>
                current.filter(
                  (id) => !id.startsWith(connection.connector.uid + ":"),
                ),
              );
              disconnect({ connector: connection.connector });
              continue;
            }

            // If only some authorized accounts were removed, remove those
            // from Managed accounts but preserve still-authorized accounts.
            const removedAddresses = new Set(
              [...previouslyAuthorized].filter(
                (account) => !liveAddresses.has(account),
              ),
            );

            if (removedAddresses.size > 0) {
              setWatched((current) =>
                current.filter(
                  (account) =>
                    account.connectorUid !== connection.connector.uid ||
                    !removedAddresses.has(account.address.toLowerCase()),
                ),
              );
              setSelected((current) =>
                current.filter((id) => {
                  const [, , selectedAddress] = id.split(":");
                  return (
                    !id.startsWith(connection.connector.uid + ":") ||
                    !removedAddresses.has(selectedAddress ?? "")
                  );
                }),
              );
            }
          } catch {
            // A temporary provider error should not force a disconnect.
          }
        }
      } finally {
        checking = false;
      }
    }

    window.addEventListener("focus", syncWalletConnections);
    document.addEventListener("visibilitychange", syncWalletConnections);
    void syncWalletConnections();

    return () => {
      cancelled = true;
      window.removeEventListener("focus", syncWalletConnections);
      document.removeEventListener("visibilitychange", syncWalletConnections);
    };
  }, [connections, disconnect]);

  // Remove checkbox selections for accounts that are no longer listed.
  useEffect(() => {
    const availableIds = new Set(entries.map((account) => account.id));
    setSelected((current) => current.filter((id) => availableIds.has(id)));
  }, [entries]);

  useEffect(() => {
    if (!client) {
      return;
    }

    let cancelled = false;

    Promise.all(
      entries
        .filter((a) => a.chainId === client.chain.id)
        .map(async (a) => {
          try {
            const wei = await client.getBalance({
              address: a.address,
            });

            return [
              a.id,
              (Number(wei) / 1e18).toFixed(6),
            ] as const;
          } catch {
            return [a.id, "Unavailable"] as const;
          }
        }),
    ).then((result) => {
      if (!cancelled) {
        setBalances(Object.fromEntries(result));
      }
    });

    return () => {
      cancelled = true;
    };
  }, [client, entries]);

  async function handleConnect(connector: Connector) {
    if (pendingConnectorUid) {
      return;
    }

    const requestId = connectionRequestId.current + 1;
    connectionRequestId.current = requestId;

    setPendingConnectorUid(connector.uid);
    setPendingConnectorName(connector.name);
    setCancelHelpShown(false);
    setConnectionStatus("connecting");
    setMessage(`Waiting for ${connector.name} wallet approval...`);

    try {
      await connectAsync({
        connector,
      });

      if (
        !mountedRef.current ||
        connectionRequestId.current !== requestId
      ) {
        return;
      }

      setConnectionStatus("connected");
      setMessage(`${connector.name} connected successfully.`);
    } catch (connectError) {
      if (
        !mountedRef.current ||
        connectionRequestId.current !== requestId
      ) {
        return;
      }

      const errorMessage =
        connectError instanceof Error
          ? connectError.message
          : "Wallet connection was cancelled.";

      const rejected = /rejected|denied|cancelled|canceled|user/i.test(
        errorMessage,
      );

      setConnectionStatus(rejected ? "rejected" : "error");
      setMessage(
        rejected
          ? `${connector.name} connection was rejected or cancelled in the wallet.`
          : `Unable to connect ${connector.name}.`,
      );
    } finally {
      if (
        mountedRef.current &&
        connectionRequestId.current === requestId
      ) {
        setPendingConnectorUid(null);
        setPendingConnectorName(null);
        setCancelHelpShown(false);
      }
    }
  }

  function handleCancelConnection() {
    if (!pendingConnectorUid) {
      return;
    }

    // EIP-1193 and Wagmi do not expose a standard API for a dapp to
    // press Reject in a wallet extension's native approval popup.
    // Keep the request pending until the wallet resolves it, so a late
    // successful connection is not silently ignored by the UI.
    setCancelHelpShown(true);
    setMessage(
      `To cancel this request, open ${pendingConnectorName ?? "your wallet"} and choose Reject. The wallet controls its own approval popup.`,
    );
  }

  function handleDisconnect(connector: Connector) {
    if (pendingConnectorUid === connector.uid) {
      return;
    }

    // Disconnecting a wallet removes every account registered under it.
    setWatched((current) =>
      current.filter((account) => account.connectorUid !== connector.uid),
    );
    setSelected((current) =>
      current.filter((id) => !id.startsWith(connector.uid + ":")),
    );

    disconnect({
      connector,
    });
  }

  function addWatch() {
    const connection = connections.find(
      (c) => c.connector.uid === walletUid,
    );

    if (!connection) {
      setMessage("First connect the wallet extension.");
      return;
    }

    if (!isAddress(address)) {
      setMessage("Invalid EVM address.");
      return;
    }

    setWatched((prev) => [
      ...prev.filter(
        (a) =>
          !(
            a.connectorUid === walletUid &&
            a.address.toLowerCase() === address.toLowerCase() &&
            a.chainId === connection.chainId
          ),
      ),
      {
        connectorUid: walletUid,
        wallet: connection.connector.name,
        address: address as Address,
        chainId: connection.chainId,
      },
    ]);

    setAddress("");
    setMessage("Account registered for watch-only monitoring.");
  }

  return (
    <main>
      <h1>Multi-Wallet + Multi-Account</h1>

      <p className="muted">
        Connect MetaMask, Trust Wallet, Rabby or other EIP-6963 wallets.
        Track multiple addresses. Signing is restricted to the
        extension-authorized account.
      </p>

      <section className="panel">
        <h2>1. Connect wallet extensions</h2>

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
              onClick={handleCancelConnection}
            >
              Cancel request
            </button>
          </div>
        )}

        <div className="cards">
          {connectors.map((c) => {
            const connector = c as typeof c & ConnectorWithIcon;
            const isThisConnectorPending =
              pendingConnectorUid === c.uid;

            return (
              <div className="card connector-card" key={c.uid}>
                <div className="connector-brand">
                  <ConnectorIcon connector={connector} />

                  <div>
                    <strong>{c.name}</strong>
                    <span className="caption">Wallet connector</span>
                  </div>
                </div>

                <div>
                  <button
                    disabled={!!pendingConnectorUid}
                    onClick={() => handleConnect(c)}
                  >
                    {isThisConnectorPending ? "Waiting..." : "Connect"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {connectionStatus === "rejected" && (
          <p className="warn">
            The wallet request was rejected or cancelled.
          </p>
        )}

        {connectionStatus === "error" && !pendingConnectorUid && (
          <p className="warn">
            {error?.message?.includes("Connector already connected")
              ? "Connector already connected."
              : error?.message ?? "The wallet connection failed."}
          </p>
        )}
      </section>

      <section className="panel">
        <h2>2. Connected wallets</h2>

        {connections.length === 0 ? (
          <p className="muted">No wallet connected yet.</p>
        ) : (
          connections.map((c) => (
            <div className="card connector-card" key={c.connector.uid}>
              <div className="connector-brand">
                <ConnectorIcon
                  connector={
                    c.connector as typeof c.connector & ConnectorWithIcon
                  }
                />

                <div>
                  <strong>{c.connector.name}</strong>
                  <span className="caption">
                    Chain {c.chainId} • {c.accounts.length} account
                    {c.accounts.length === 1 ? "" : "s"}
                  </span>
                </div>
              </div>

              <button
                disabled={pendingConnectorUid === c.connector.uid}
                onClick={() => handleDisconnect(c.connector)}
              >
                Disconnect
              </button>
            </div>
          ))
        )}
      </section>

      <section className="panel">
        <h2>3. Add another address under a wallet</h2>

        <p className="caption">
          Adding an address does NOT authorize it to sign transactions.
        </p>

        <select
          value={walletUid}
          onChange={(e) => setWalletUid(e.target.value)}
          disabled={!!pendingConnectorUid}
        >
          <option value="">Choose a connected wallet</option>

          {connections.map((c) => (
            <option key={c.connector.uid} value={c.connector.uid}>
              {c.connector.name}
            </option>
          ))}
        </select>

        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="0x... public address"
          disabled={!!pendingConnectorUid}
        />

        <button
          onClick={addWatch}
          disabled={!!pendingConnectorUid}
        >
          Register address
        </button>

        <p role="status">{message}</p>
      </section>

      <section className="panel">
        <h2>4. Managed accounts</h2>

        {entries.length === 0 ? (
          <p className="muted">
            Connect and register accounts to begin.
          </p>
        ) : (
          entries.map((a) => (
            <div className="account" key={a.id}>
              <label>
                <input
                  type="checkbox"
                  checked={selected.includes(a.id)}
                  onChange={(e) =>
                    setSelected((old) =>
                      e.target.checked
                        ? [...old, a.id]
                        : old.filter((x) => x !== a.id),
                    )
                  }
                />

                <strong>{a.wallet}</strong> —
                {a.canSign ? (
                  <span className="ok">Active signer candidate</span>
                ) : (
                  <span className="warn">
                    Watch-only / switch required
                  </span>
                )}
              </label>

              <div className="address">{a.address}</div>

              <div className="caption">
                Chain {a.chainId} • Native balance:{" "}
                {a.chainId === client?.chain.id
                  ? balances[a.id] ?? "Loading..."
                  : "Change read network"}
              </div>
            </div>
          ))
        )}

        <p>
          <strong>{selected.length}</strong> accounts selected for a
          future route plan.
        </p>

        <p className="caption">
          No swap or multi-account transaction signing is implemented
          in this demonstration.
        </p>
      </section>
    </main>
  );
}
