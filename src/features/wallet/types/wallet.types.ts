import type { Address } from "viem";

export type WatchedAccount = {
  connectorUid: string;
  wallet: string;
  address: Address;
  chainId: number;
};

export type ConnectorWithIcon = {
  uid: string;
  name: string;
  icon?: string;
};

export type ConnectionStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "rejected"
  | "error";

export type DashboardPage = "dashboard" | "watch" | "accounts";

export type AccountCandidate = {
  connectorUid: string;
  wallet: string;
  address: Address;
  chainId: number;
};
