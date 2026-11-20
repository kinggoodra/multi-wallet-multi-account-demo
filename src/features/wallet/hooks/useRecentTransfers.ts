"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  fetchRecentTransfers,
  mapTransfersToHistory,
  type TransactionHistoryItem,
} from "../services/erc20Transfers";

export default function useRecentTransfers(walletAddress: string, chainId: number) {
  const [transactions, setTransactions] = useState<TransactionHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!walletAddress) {
      setTransactions([]);
      setError("");
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError("");
    fetchRecentTransfers(walletAddress, chainId, controller.signal)
      .then((transfers) => {
        if (!controller.signal.aborted) {
          setTransactions(mapTransfersToHistory(transfers, walletAddress));
        }
      })
      .catch((requestError: unknown) => {
        if (controller.signal.aborted) return;
        const message = axios.isAxiosError<{ error?: string; message?: string }>(requestError)
          ? requestError.response?.data?.error ?? requestError.response?.data?.message
          : undefined;
        setError(message ?? (requestError instanceof Error ? requestError.message : "Unable to load transactions."));
        setTransactions([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [walletAddress, chainId]);

  return { transactions, loading, error };
}
