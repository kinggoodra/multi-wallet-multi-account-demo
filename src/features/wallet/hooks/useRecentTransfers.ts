"use client";

import { useEffect, useState } from "react";
import {
  openRecentTransfersMonitor,
  mapTransfersToHistory,
  parseTransferEvent,
  prependNewTransfers,
  type TransactionHistoryItem,
} from "../services/erc20Transfers";

export default function useRecentTransfers(walletAddress: string, chainId: number | null) {
  const [transactions, setTransactions] = useState<TransactionHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!walletAddress || chainId === null) {
      setTransactions([]);
      setError("");
      setLoading(false);
      return;
    }

    let receivedInitial = false;
    setLoading(true);
    setError("");
    setTransactions([]);

    const source = openRecentTransfersMonitor(walletAddress, chainId);
    source.addEventListener("initial", (event) => {
      try {
        const transfers = parseTransferEvent((event as MessageEvent<string>).data);
        receivedInitial = true;
        setTransactions(mapTransfersToHistory(transfers, walletAddress).slice(0, 5));
        setLoading(false);
        setError("");
      } catch {
        setLoading(false);
        setError("The transaction monitor returned an invalid initial response.");
      }
    });
    source.addEventListener("update", (event) => {
      try {
        const transfers = parseTransferEvent((event as MessageEvent<string>).data);
        if (transfers.length) {
          setTransactions((current) => prependNewTransfers(current, transfers, walletAddress));
        }
        setError("");
      } catch {
        setError("The transaction monitor returned an invalid update.");
      }
    });
    source.addEventListener("monitor-error", (event) => {
      const messageEvent = event as MessageEvent<string>;
      try {
        const payload = JSON.parse(messageEvent.data) as { message?: string };
        setError(payload.message ?? "Unable to refresh transactions.");
      } catch {
        setError("Unable to refresh transactions.");
      }
    });
    source.onopen = () => setError("");
    source.onerror = () => {
      setLoading(false);
      setError(receivedInitial
        ? "Transaction monitor disconnected; reconnecting…"
        : "Unable to connect to the transaction monitor; reconnecting…");
    };

    return () => source.close();
  }, [walletAddress, chainId]);

  return { transactions, loading, error };
}
