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
import ConnectWalletExtensions from "./wallet/ConnectWalletExtensions";
import AddWatchedAddress from "./wallet/AddWatchedAddress";
import ManagedAccounts from "./wallet/ManagedAccounts";
import type { WatchedAccount, ConnectionStatus } from "./wallet/types";

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

    setCancelHelpShown(true);
    setMessage(
      `To cancel this request, open ${pendingConnectorName ?? "your wallet"} and choose Reject. The wallet controls its own approval popup.`,
    );
  }

  function handleDisconnect(connector: Connector) {
    if (pendingConnectorUid === connector.uid) {
      return;
    }

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

      <ConnectWalletExtensions
        connectors={connectors}
        connections={connections}
        pendingConnectorUid={pendingConnectorUid}
        pendingConnectorName={pendingConnectorName}
        cancelHelpShown={cancelHelpShown}
        connectionStatus={connectionStatus}
        errorMessage={error?.message}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
        onCancelConnection={handleCancelConnection}
      />

      <AddWatchedAddress
        connections={connections}
        walletUid={walletUid}
        address={address}
        message={message}
        disabled={!!pendingConnectorUid}
        onWalletChange={setWalletUid}
        onAddressChange={setAddress}
        onAdd={addWatch}
      />

      <ManagedAccounts
        entries={entries}
        selected={selected}
        balances={balances}
        client={client}
        onSelectionChange={(id, checked) =>
          setSelected((current) =>
            checked
              ? current.includes(id) ? current : [...current, id]
              : current.filter((item) => item !== id),
          )
        }
      />
    </main>
  );
}
