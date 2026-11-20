"use client";

import { useEffect, useState } from "react";
import useRecentTransfers from "../hooks/useRecentTransfers";
import type { NetworkOption } from "../constants/networkCatalog";
import NetworkDropdown from "./NetworkDropdown";

export default function TransactionHistory({ walletAddress, networks }: { walletAddress: string; networks: NetworkOption[] }) {
  const [chainId, setChainId] = useState<number | null>(null);
  const { transactions, loading, error } = useRecentTransfers(walletAddress, chainId);

  useEffect(() => {
    if (chainId !== null && networks.some((network) => network.id === chainId)) return;
    setChainId(networks[0]?.id ?? null);
  }, [chainId, networks]);

  return (
    <section aria-label="Transaction history" className="overflow-visible rounded-2xl border border-[#294332] bg-[linear-gradient(135deg,#10351f,#0d2c1a)] p-5 max-[680px]:p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
        <h3 className="m-0 text-sm font-semibold text-[#eef4ec]">Transaction history</h3>
        <p className="mt-1 mb-0 text-[10px] text-[#87968b]">Recent ERC-20 activity</p>
        </div>
        <NetworkDropdown networks={networks} value={chainId} onChange={(value) => setChainId(typeof value === "number" ? value : null)} />
      </div>
      <div className="grid grid-cols-[1.1fr_1.2fr_1fr_.8fr] gap-2 border-b border-white/[.07] px-2 pb-2 text-[9px] font-semibold uppercase tracking-[.08em] text-[#718178] max-[600px]:grid-cols-[1fr_1fr]">
        <span>Transaction</span><span>Type</span><span>Asset / amount</span><span className="text-right">Date</span>
      </div>
      {loading ? <p className="m-0 px-2 py-6 text-center text-[10px] text-[#87968b]">Connecting to transaction monitor…</p>
        : error && transactions.length === 0 ? <p role="status" className="m-0 px-2 py-6 text-center text-[10px] text-[#d4b362]">{error}</p>
          : transactions.length === 0 ? <p className="m-0 px-2 py-6 text-center text-[10px] text-[#87968b]">{!networks.length ? "Enable a network to load transactions." : walletAddress ? "No transactions found." : "Register an address to load transactions."}</p>
            : <>
              {error && <p role="status" className="m-0 px-2 py-2 text-center text-[10px] text-[#d4b362]">{error}</p>}
              {transactions.map((item) => (
              <div key={item.id} className="grid grid-cols-[1.1fr_1.2fr_1fr_.8fr] items-center gap-2 border-b border-white/[.05] px-2 py-3 last:border-0 max-[600px]:grid-cols-[1fr_1fr]">
                <a href={`https://etherscan.io/tx/${item.hash}`} target="_blank" rel="noreferrer" className="truncate font-mono text-[9px] text-[#dce5dc] hover:text-[#b5d76c]">{item.hash}</a>
                <span className="text-[9px] text-[#aab7ad]">{item.type}</span>
                <span className="text-[9px] text-[#e4ece4]">{item.assetAmount}</span>
                <time dateTime={item.date} className="text-right text-[9px] text-[#aab7ad]">{item.date}</time>
              </div>
              ))}
            </>}
    </section>
  );
}
