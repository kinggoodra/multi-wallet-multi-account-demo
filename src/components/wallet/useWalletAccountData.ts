"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAccount, useConnections, useDisconnect, usePublicClient } from "wagmi";
import { useDashboardState } from "./DashboardState";
import type { AccountCandidate } from "./types";

export default function useWalletAccountData() {
  const connections = useConnections();
  const activeAccount = useAccount();
  const { disconnect } = useDisconnect();
  const client = usePublicClient();
  const {
    watched,
    removeWatchedForConnector,
    selected,
    setSelected,
  } = useDashboardState();
  const [balances, setBalances] = useState<Record<string, string>>({});

  const entries = useMemo(() => {
    const byId = new Map<
      string,
      AccountCandidate & { id: string; canSign: boolean }
    >();

    const add = (account: AccountCandidate) => {
      const id = [
        account.connectorUid,
        account.chainId,
        account.address.toLowerCase(),
      ].join(":");

      byId.set(id, {
        ...account,
        id,
        canSign:
          activeAccount.connector?.uid === account.connectorUid &&
          activeAccount.address?.toLowerCase() ===
            account.address.toLowerCase() &&
          activeAccount.chainId === account.chainId,
      });
    };

    watched.forEach(add);
    connections.forEach((connection) =>
      connection.accounts.forEach((address) =>
        add({
          connectorUid: connection.connector.uid,
          wallet: connection.connector.name,
          address,
          chainId: connection.chainId,
        }),
      ),
    );

    return [...byId.values()];
  }, [
    watched,
    connections,
    activeAccount.connector?.uid,
    activeAccount.address,
    activeAccount.chainId,
  ]);

  useEffect(() => {
    let checking = false;
    let cancelled = false;

    async function syncConnections() {
      if (checking || document.visibilityState === "hidden") return;
      checking = true;

      try {
        for (const connection of connections) {
          try {
            const accounts = await connection.connector.getAccounts();
            if (cancelled) return;
            if (accounts.length !== 0) continue;

            removeWatchedForConnector(connection.connector.uid);
            setSelected((current) =>
              current.filter(
                (id) => !id.startsWith(connection.connector.uid + ":"),
              ),
            );
            disconnect({ connector: connection.connector });
          } catch {
            // A temporary provider error should not force a disconnect.
          }
        }
      } finally {
        checking = false;
      }
    }

    window.addEventListener("focus", syncConnections);
    document.addEventListener("visibilitychange", syncConnections);
    void syncConnections();

    return () => {
      cancelled = true;
      window.removeEventListener("focus", syncConnections);
      document.removeEventListener("visibilitychange", syncConnections);
    };
  }, [connections, disconnect, removeWatchedForConnector, setSelected]);

  useEffect(() => {
    const availableIds = new Set(entries.map((account) => account.id));
    setSelected((current) => current.filter((id) => availableIds.has(id)));
  }, [entries, setSelected]);

  useEffect(() => {
    if (!client) return;
    let cancelled = false;

    Promise.all(
      entries
        .filter((account) => account.chainId === client.chain.id)
        .map(async (account) => {
          try {
            const wei = await client.getBalance({ address: account.address });
            return [account.id, (Number(wei) / 1e18).toFixed(6)] as const;
          } catch {
            return [account.id, "Unavailable"] as const;
          }
        }),
    ).then((result) => {
      if (!cancelled) setBalances(Object.fromEntries(result));
    });

    return () => {
      cancelled = true;
    };
  }, [client, entries]);

  const onSelectionChange = useCallback(
    (id: string, checked: boolean) =>
      setSelected((current) =>
        checked
          ? current.includes(id)
            ? current
            : [...current, id]
          : current.filter((item) => item !== id),
      ),
    [setSelected],
  );

  return { connections, entries, selected, balances, client, onSelectionChange };
}
