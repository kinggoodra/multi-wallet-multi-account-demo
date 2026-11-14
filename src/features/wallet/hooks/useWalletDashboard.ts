"use client";

import { useCallback, useState } from "react";
import { useConnectors } from "wagmi";
import { isAddress } from "viem";
import { useDashboardState } from "../state/DashboardState";
import useWalletAccountData from "./useWalletAccountData";
import useWalletConnectionActions from "./useWalletConnectionActions";

export default function useWalletDashboard() {
  const connectors = useConnectors();
  const accounts = useWalletAccountData();
  const { addWatched, selectedNetworks } = useDashboardState();
  const [walletUid, setWalletUid] = useState("");
  const [address, setAddress] = useState("");
  const [message, setMessage] = useState("");
  const connectionActions = useWalletConnectionActions(setMessage);

  function onAddWatch() {
    const connection = accounts.connections.find(
      (item) => item.connector.uid === walletUid,
    );
    if (!connection) {
      setMessage("First connect the wallet extension.");
      return;
    }
    if (selectedNetworks.M_chainids.length + selectedNetworks.T_chainids.length === 0) {
      setMessage("Choose at least one network and click Done first.");
      return;
    }
    if (!connection.accounts.some((account) => account.toLowerCase() === address.toLowerCase())) {
      setMessage("Choose an address authorized during this wallet connection.");
      return;
    }
    if (!isAddress(address)) {
      setMessage("Invalid EVM address.");
      return;
    }

    addWatched({
      connectorUid: walletUid,
      wallet: connection.connector.name,
      address,
      chainId: connection.chainId,
    });
    setAddress("");
    setMessage("Account registered for watch-only monitoring.");
  }

  const onWalletChange = useCallback((uid: string) => {
    setWalletUid(uid);
    const connection = accounts.connections.find((item) => item.connector.uid === uid);
    setAddress(connection?.accounts[0] ?? "");
    setMessage("");
  }, [accounts.connections]);

  return {
    connectors,
    ...accounts,
    ...connectionActions,
    walletUid,
    address,
    message,
    selectedNetworks,
    onWalletChange,
    onAddressChange: setAddress,
    onAddWatch,
  };
}
