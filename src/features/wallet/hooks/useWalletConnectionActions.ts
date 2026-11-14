"use client";

import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import {
  useConnect,
  useDisconnect,
  type Connector,
} from "wagmi";
import { useDashboardState } from "../state/DashboardState";
import type { ConnectionStatus } from "../types/wallet.types";

export default function useWalletConnectionActions(
  setMessage: Dispatch<SetStateAction<string>>,
) {
  const { connectAsync, error } = useConnect();
  const { disconnect } = useDisconnect();
  const { removeWatchedForConnector, setSelected } = useDashboardState();
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("idle");
  const [connectionError, setConnectionError] = useState<string | undefined>();
  const [pendingConnectorUid, setPendingConnectorUid] = useState<string | null>(
    null,
  );
  const [pendingConnectorName, setPendingConnectorName] = useState<
    string | null
  >(null);
  const [cancelHelpShown, setCancelHelpShown] = useState(false);
  const requestId = useRef(0);
  const mounted = useRef(true);

  useEffect(() => {
    return () => {
      mounted.current = false;
      requestId.current += 1;
    };
  }, []);

  async function onConnect(connector: Connector) {
    if (pendingConnectorUid) return;
    const currentRequest = requestId.current + 1;
    requestId.current = currentRequest;
    setPendingConnectorUid(connector.uid);
    setPendingConnectorName(connector.name);
    setCancelHelpShown(false);
    setConnectionError(undefined);
    setConnectionStatus("connecting");
    setMessage(`Waiting for ${connector.name} wallet approval...`);

    try {
      await connectAsync({ connector });
      if (!mounted.current || requestId.current !== currentRequest) return;
      setConnectionStatus("connected");
      setConnectionError(undefined);
      setMessage(`${connector.name} connected successfully.`);
    } catch (connectError) {
      if (!mounted.current || requestId.current !== currentRequest) return;
      const message =
        connectError instanceof Error
          ? connectError.message
          : "Wallet connection was cancelled.";
      const rejected = /rejected|denied|cancelled|canceled|user/i.test(message);
      const extensionConnectionFailure =
        /failed to connect to metamask|extension context invalidated/i.test(message);
      setConnectionStatus(rejected ? "rejected" : "error");
      setConnectionError(
        extensionConnectionFailure
          ? "MetaMask’s browser extension failed to establish the connection. Reload this page and retry. If another browser wallet extension is active, temporarily disable it and try again."
          : message,
      );
      setMessage(
        rejected
          ? `${connector.name} connection was rejected or cancelled in the wallet.`
          : extensionConnectionFailure
            ? "MetaMask could not establish the connection. Reload the page and retry."
            : `Unable to connect ${connector.name}.`,
      );
    } finally {
      if (mounted.current && requestId.current === currentRequest) {
        setPendingConnectorUid(null);
        setPendingConnectorName(null);
        setCancelHelpShown(false);
      }
    }
  }

  function onCancelConnection() {
    if (!pendingConnectorUid) return;
    setCancelHelpShown(true);
    setMessage(
      `To cancel this request, open ${pendingConnectorName ?? "your wallet"} and choose Reject. The wallet controls its own approval popup.`,
    );
  }

  function onDisconnect(connector: Connector) {
    if (pendingConnectorUid === connector.uid) return;
    setSelected((current) =>
      current.filter((id) => !id.startsWith(connector.uid + ":")),
    );
    removeWatchedForConnector(connector.uid);
    disconnect({ connector });
  }

  return {
    connectionStatus,
    errorMessage: connectionError ?? error?.message,
    pendingConnectorUid,
    pendingConnectorName,
    cancelHelpShown,
    onConnect,
    onDisconnect,
    onCancelConnection,
  };
}
