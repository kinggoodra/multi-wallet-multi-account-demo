import { useEffect, useState } from "react";
import type { Connector } from "wagmi";
import SpecularButton from "../ui/SpecularButton";

const installUrls: Record<string, string> = {
  metamask: "https://metamask.io/download/",
  coinbase: "https://www.coinbase.com/wallet/downloads",
  trust: "https://trustwallet.com/download",
  rabby: "https://rabby.io/",
};

function getInstallUrl(connector: Connector) {
  const name = connector.name.toLowerCase();
  if (name.includes("metamask")) return installUrls.metamask;
  if (name.includes("coinbase")) return installUrls.coinbase;
  if (name.includes("trust")) return installUrls.trust;
  if (name.includes("rabby")) return installUrls.rabby;
  return null;
}

export function useWalletInstallation(connectors: readonly Connector[]) {
  const [installed, setInstalled] = useState<Record<string, boolean>>({});
  const [checkingInstallations, setCheckingInstallations] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function checkInstalledWallets() {
      setCheckingInstallations(true);
      const results = await Promise.all(connectors.map(async connector => {
        try { await connector.getProvider(); return [connector.uid, true] as const; }
        catch { return [connector.uid, false] as const; }
      }));
      if (!cancelled) { setInstalled(Object.fromEntries(results)); setCheckingInstallations(false); }
    }
    void checkInstalledWallets();
    return () => { cancelled = true; };
  }, [connectors]);

  return { installed, checkingInstallations };
}

export function WalletInstallationAction({ connector, isInstalled, checkingInstallations, disabled, onConnect }: { connector: Connector; isInstalled: boolean | undefined; checkingInstallations: boolean; disabled: boolean; onConnect: () => void }) {
  const installUrl = getInstallUrl(connector);
  if (!checkingInstallations && !isInstalled && installUrl) {
    return <a className="button" href={installUrl} target="_blank" rel="noreferrer">Install</a>;
  }
  return <SpecularButton size="sm" disabled={disabled || checkingInstallations || !isInstalled} onClick={onConnect}>Connect Wallet</SpecularButton>;
}

export const metaMaskInstallUrl = installUrls.metamask;
