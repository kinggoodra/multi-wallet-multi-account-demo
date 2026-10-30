"use client";

import { useState } from "react";
import { useConnectors } from "wagmi";
import { isAddress } from "viem";
import { useDashboardState } from "./DashboardState";
import useWalletAccountData from "./useWalletAccountData";
import useWalletConnectionActions from "./useWalletConnectionActions";

export default function useWalletDashboard() {
  const connectors = useConnectors();
  const accounts = useWalletAccountData();
  const { addWatched } = useDashboardState();
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

  return {
    connectors,
    ...accounts,
    ...connectionActions,
    walletUid,
    address,
    message,
    onWalletChange: setWalletUid,
    onAddressChange: setAddress,
    onAddWatch,
  };
}
