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
