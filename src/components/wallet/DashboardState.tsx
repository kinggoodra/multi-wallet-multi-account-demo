"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import type { WatchedAccount } from "./types";

type DashboardStateValue = {
  watched: WatchedAccount[];
  addWatched: (account: WatchedAccount) => void;
  removeWatchedForConnector: (connectorUid: string) => void;
  selected: string[];
  setSelected: Dispatch<SetStateAction<string[]>>;
};

const DashboardStateContext = createContext<DashboardStateValue | null>(null);
const STORAGE_KEY = "avaritia.watchedAccounts";

export function DashboardStateProvider({ children }: { children: ReactNode }) {
  const [watched, setWatched] = useState<WatchedAccount[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [storageReady, setStorageReady] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (Array.isArray(parsed)) setWatched(parsed as WatchedAccount[]);
      }
    } catch {
      // Ignore malformed or unavailable local storage and start with an empty list.
    } finally {
      setStorageReady(true);
    }
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(watched));
    } catch {
      // The in-memory list remains usable if storage is unavailable.
    }
  }, [watched, storageReady]);

  const addWatched = useCallback((account: WatchedAccount) => {
    setWatched((current) => [
      ...current.filter(
        (item) =>
          !(
            item.connectorUid === account.connectorUid &&
            item.address.toLowerCase() === account.address.toLowerCase() &&
            item.chainId === account.chainId
          ),
      ),
      account,
    ]);
  }, []);

  const removeWatchedForConnector = useCallback((connectorUid: string) => {
    setWatched((current) =>
      current.filter((account) => account.connectorUid !== connectorUid),
    );
  }, []);

  const value = useMemo(
    () => ({
      watched,
      addWatched,
      removeWatchedForConnector,
      selected,
      setSelected,
    }),
    [watched, addWatched, removeWatchedForConnector, selected],
  );

  return (
    <DashboardStateContext.Provider value={value}>
      {children}
    </DashboardStateContext.Provider>
  );
}

export function useDashboardState() {
  const value = useContext(DashboardStateContext);
  if (!value) {
    throw new Error(
      "useDashboardState must be used inside DashboardStateProvider",
    );
  }
  return value;
}
