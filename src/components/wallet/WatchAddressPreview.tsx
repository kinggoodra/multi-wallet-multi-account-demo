"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink, RefreshCw, Search } from "lucide-react";
import SpotlightCard from "../ui/SpotlightCard";

const address = "0x71C79C5c6B4E7A0F3D2c8B1e5A6f9D4C2B9A2E";
const assets = [
  { symbol: "ETH", name: "Ethereum", network: "Ethereum", amount: "1.2500 ETH", price: "$2,525.00", color: "#9eb6e8" },
  // { symbol: "USDC", name: "USD Coin", network: "Ethereum", amount: "4,820.00 USDC", price: "$1.00", color: "#6c9eff" },
  // { symbol: "WBTC", name: "Wrapped Bitcoin", network: "Ethereum", amount: "0.0842 WBTC", price: "$64,356.00", color: "#f2a84a" },
  // { symbol: "LINK", name: "Chainlink", network: "Ethereum", amount: "42.50 LINK", price: "$14.80", color: "#6b8cff" },
  // { symbol: "UNI", name: "Uniswap", network: "Ethereum", amount: "38.00 UNI", price: "$11.00", color: "#e66c9c" },
  // { symbol: "AAVE", name: "Aave", network: "Ethereum", amount: "6.20 AAVE", price: "$165.00", color: "#b56ce0" },
  // { symbol: "DAI", name: "Dai", network: "Ethereum", amount: "720.00 DAI", price: "$1.00", color: "#e6bd54" },
  // { symbol: "ARB", name: "Arbitrum", network: "Arbitrum", amount: "210.00 ARB", price: "$0.72", color: "#82a7d7" },
  // { symbol: "OP", name: "Optimism", network: "Optimism", amount: "95.00 OP", price: "$1.85", color: "#ff6470" },
  // { symbol: "MATIC", name: "Polygon", network: "Polygon", amount: "315.00 MATIC", price: "$0.38", color: "#a68aff" },
];
const activity = [
  { hash: "0x92A1…e31a", type: "Incoming transfer", asset: "+0.4200 ETH", date: "Oct 28, 2026", status: "Success" },
  { hash: "0x7b04…a91f", type: "Swap · decoded", asset: "USDC → WETH", date: "Oct 26, 2026", status: "Success" },
  { hash: "0xb835…2d0c", type: "Outgoing transfer", asset: "−250.00 USDC", date: "Oct 24, 2026", status: "Success" },
];

export default function WatchAddressPreview() {
  const [copied, setCopied] = useState(false);

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section aria-label="Watch address dashboard preview" className="mt-8 space-y-5 pb-8 max-[680px]:mt-6">
      <SpotlightCard className="flex flex-wrap items-center justify-between gap-4 bg-[linear-gradient(105deg,#10351f,#0d2c1a)] p-5 max-[680px]:p-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-10 flex-none place-items-center rounded-xl bg-[#556b2f]/30 text-[#b5d76c]">◎</span>
          <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="m-0 text-sm font-semibold text-[#eef4ec]">Research Wallet</h2><span className="rounded-full bg-white/[.06] px-2.5 py-1 text-[8px] font-bold tracking-[.06em] text-[#aab7ad]">WATCH ONLY</span></div><p className="mt-1 mb-0 break-all font-mono text-[10px] text-[#92a096]">{address}</p><p className="mt-1 mb-0 text-[9px] text-[#6f8075]">Watching 2 configured networks · Preview data</p></div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void copyAddress()}
            aria-label={copied ? "Address copied" : "Copy address"}
            title={copied ? "Copied" : "Copy"}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#425a43] bg-[#0b2416] px-3 text-[9px] text-[#c5d1c7] hover:border-[#718c45]"
          >
            {copied ? (
              <Check size={13} className="text-[#9bb756]" />
            ) : (
              <Copy size={13} className="text-[#9bb756]" />
            )}
            {copied ? "Copied" : "Copy"}
          </button>
          <button type="button" className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#425a43] bg-[#0b2416] px-3 text-[9px] text-[#c5d1c7] hover:border-[#718c45]"><ExternalLink size={13} className="text-[#9bb756]" />Explorer</button>
          <button type="button" className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#425a43] bg-[#0b2416] px-3 text-[9px] text-[#c5d1c7] hover:border-[#718c45]"><RefreshCw size={13} className="text-[#9bb756]" />Refresh</button>
        </div>
      </SpotlightCard>

      <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="mb-2 text-[10px] font-bold tracking-[.17em] text-[#9bb756]">ADDRESS OVERVIEW</p><h2 className="m-0 text-xl font-bold tracking-[-.03em] text-[#f1f5ef]">Portfolio overview</h2></div><span className="rounded-full border border-[#718c45]/40 bg-[#556b2f]/15 px-3 py-1.5 text-[9px] font-bold tracking-[.08em] text-[#b5d76c]">WATCH ONLY · PREVIEW DATA</span></div>
      <div className="grid grid-cols-3 gap-3 max-[850px]:grid-cols-1">
        <Metric label="Total portfolio value" value="$18,472.50" note="Illustrative preview value" />
        <Metric label="Native coin value" value="1.2500 ETH" note="≈ $3,156.25 · sample" />
        <Metric label="Token value" value="$15,316.25" note="Illustrative preview value" />
      </div>

      <SpotlightCard className="overflow-hidden bg-[linear-gradient(135deg,#10351f,#0d2c1a)] p-5 max-[680px]:p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h3 className="m-0 text-sm font-semibold text-[#eef4ec]">Token holdings</h3><p className="mt-1 mb-0 text-[10px] text-[#87968b]">Search by token name, symbol, or network</p></div><span className="rounded-lg border border-[#2b4832] bg-[#081a10] px-2.5 py-1.5 text-[9px] text-[#aab7ad]">All networks</span></div>
        <label className="mb-4 flex h-10 max-w-sm items-center gap-2 rounded-lg border border-[#2b4832] bg-[#081a10] px-3 text-[#728178]"><Search size={14} /><input placeholder="Search token or symbol" className="min-w-0 flex-1 bg-transparent text-[10px] text-[#e1e9e1] outline-none placeholder:text-[#728178]" /></label>
        <div className="grid grid-cols-[1.3fr_1fr_1fr] border-b border-white/[.07] px-2 pb-2 text-[9px] font-semibold uppercase tracking-[.08em] text-[#718178]"><span>Asset</span><span>Balance</span><span className="text-right">Price</span></div>
        <div className="max-h-[340px] overflow-y-auto pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{assets.map((asset) => <div key={asset.symbol} className="grid grid-cols-[1.3fr_1fr_1fr] items-center border-b border-white/[.05] px-2 py-3 last:border-0"><div className="flex min-w-0 items-center gap-2.5"><span className="grid size-8 flex-none place-items-center rounded-full bg-white/[.06] text-[10px] font-bold" style={{ color: asset.color }}>{asset.symbol.slice(0, 1)}</span><span className="min-w-0"><strong className="block text-[10px] text-[#e1e9e1]">{asset.name}</strong><small className="text-[9px] text-[#7f9085]">{asset.symbol}</small></span></div><span className="text-[10px] text-[#c9d6ca]">{asset.amount}</span><span className="text-right text-[10px] font-medium text-[#e1e9e1]">{asset.price}</span></div>)}</div>
      </SpotlightCard>

      <SpotlightCard className="overflow-hidden bg-[linear-gradient(135deg,#10351f,#0d2c1a)] p-5 max-[680px]:p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h3 className="m-0 text-sm font-semibold text-[#eef4ec]">Transaction history</h3><p className="mt-1 mb-0 text-[10px] text-[#87968b]">Recent activity · illustrative preview rows</p></div><span className="rounded-lg border border-[#2b4832] bg-[#081a10] px-2.5 py-1.5 text-[9px] text-[#aab7ad]">Last 90 days</span></div>
        <div className="mb-4 flex flex-wrap gap-2">{["All types", "Incoming", "Outgoing", "Transfers", "Swaps"].map((category, index) => <button key={category} type="button" className={`h-8 rounded-lg border px-3 text-[9px] ${index === 0 ? "border-[#718c45]/50 bg-[#556b2f]/30 text-[#b5d76c]" : "border-[#2b4832] bg-[#0b2416] text-[#aab7ad]"}`}>{category}</button>)}</div>
        <div className="grid grid-cols-[1.1fr_1.2fr_1fr_.8fr] border-b border-white/[.07] px-2 pb-2 text-[9px] font-semibold uppercase tracking-[.08em] text-[#718178]"><span>Transaction</span><span>Type</span><span>Asset / amount</span><span className="text-right">Date</span></div>
        {activity.map((item) => <div key={item.hash} className="grid grid-cols-[1.1fr_1.2fr_1fr_.8fr] items-center gap-2 border-b border-white/[.05] px-2 py-3 last:border-0"><span className="truncate font-mono text-[9px] text-[#dce5dc]">{item.hash}</span><span className="text-[9px] text-[#aab7ad]">{item.type}</span><span className="text-[9px] text-[#e4ece4]">{item.asset}</span><span className="text-right text-[9px] text-[#aab7ad]">{item.date}</span></div>)}
        <p className="mt-3 mb-0 text-[9px] text-[#718075]">Transaction details and values are illustrative preview data.</p>
      </SpotlightCard>
      <p className="m-0 text-[9px] leading-relaxed text-[#64746a]">Preview figures are illustrative only and are not live blockchain balances or prices.</p>
    </section>
  );
}

function Metric({ label, value, note }: { label: string; value: string; note: string }) {
  return <SpotlightCard className="bg-[linear-gradient(135deg,#10351f,#0d2c1a)] p-5 max-[680px]:p-4"><p className="m-0 text-[9px] font-semibold uppercase tracking-[.08em] text-[#91a096]">{label}</p><p className="mt-4 mb-2 text-2xl font-bold tracking-[-.04em] text-[#f0f6ee] max-[680px]:text-xl">{value}</p><p className="m-0 text-[9px] text-[#d4b362]">{note}</p></SpotlightCard>;
}
