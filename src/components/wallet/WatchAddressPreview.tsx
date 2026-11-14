"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink, RefreshCw, Search } from "lucide-react";
import SpotlightCard from "../ui/SpotlightCard";
import { NetworkIcon, TokenIcon } from "@web3icons/react/dynamic";
import { networkCatalog, type NetworkGroup } from "./networkCatalog";

const address = "0x71C79C5c6B4E7A0F3D2c8B1e5A6f9D4C2B9A2E";
const assets = [
  { symbol: "ETH", name: "Ethereum", networkId: 1, amount: "1.2500 ETH", price: "$2,525.00" },
  { symbol: "USDC", name: "USD Coin", networkId: 8453, amount: "4,820.00 USDC", price: "$1.00" },
  { symbol: "ARB", name: "Arbitrum", networkId: 42161, amount: "210.00 ARB", price: "$0.72" },
  { symbol: "OP", name: "Optimism", networkId: 10, amount: "95.00 OP", price: "$1.85" },
  { symbol: "POL", name: "POL", networkId: 137, amount: "315.00 POL", price: "$0.38" },
  { symbol: "AVAX", name: "Avalanche", networkId: 43114, amount: "18.40 AVAX", price: "$36.20" },
  { symbol: "ETH", name: "Sepolia Ether", networkId: 11155111, amount: "2.0000 SepoliaETH", price: "Testnet" },
  { symbol: "ETH", name: "Base Sepolia Ether", networkId: 84532, amount: "1.5000 ETH", price: "Testnet" },
];
const activity = [
  { hash: "0x92A1…e31a", type: "Incoming transfer", asset: "+0.4200 ETH", date: "Oct 28, 2026", status: "Success" },
  { hash: "0x7b04…a91f", type: "Swap · decoded", asset: "USDC → WETH", date: "Oct 26, 2026", status: "Success" },
  { hash: "0xb835…2d0c", type: "Outgoing transfer", asset: "−250.00 USDC", date: "Oct 24, 2026", status: "Success" },
];

export default function WatchAddressPreview() {
  const [copied, setCopied] = useState(false);
  const [networkGroup, setNetworkGroup] = useState<"All tokens" | NetworkGroup>("All tokens");
  const [networkFilter, setNetworkFilter] = useState("all");
  const [networkMenuOpen, setNetworkMenuOpen] = useState(false);
  const [tokenSearch, setTokenSearch] = useState("");
  const availableNetworks = networkGroup === "All tokens"
    ? networkCatalog
    : networkCatalog.filter((network) => network.group === networkGroup);
  const filteredAssets = assets.filter((asset) => {
    const network = networkCatalog.find((item) => item.id === asset.networkId);
    if (!network) return false;
    if (networkGroup !== "All tokens" && network.group !== networkGroup) return false;
    if (networkFilter !== "all" && asset.networkId !== Number(networkFilter)) return false;
    const query = tokenSearch.trim().toLowerCase();
    return !query || `${asset.name} ${asset.symbol} ${network.name}`.toLowerCase().includes(query);
  });

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
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h3 className="m-0 text-sm font-semibold text-[#eef4ec]">Token holdings</h3><p className="mt-1 mb-0 text-[10px] text-[#87968b]">Search by token name, symbol, or network</p></div>
          <div className="relative grid gap-1 text-[8px] font-semibold uppercase tracking-[.08em] text-[#819084]" onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setNetworkMenuOpen(false); }} onKeyDown={(event) => { if (event.key === "Escape") setNetworkMenuOpen(false); }}>
            <span>Network</span>
            <button type="button" aria-haspopup="listbox" aria-expanded={networkMenuOpen} onClick={() => setNetworkMenuOpen((open) => !open)} className="inline-flex h-9 min-w-[150px] items-center justify-between gap-2 rounded-lg border border-[#2b4832] bg-[#081a10] px-2.5 text-[10px] font-normal normal-case tracking-normal text-[#dce5dc] outline-none hover:border-[#567247] focus-visible:border-[#8ba83a]">
              {networkFilter === "all" ? <span>All networks</span> : (() => {
                const network = networkCatalog.find((item) => item.id === Number(networkFilter));
                return network ? <span className="inline-flex items-center gap-2"><NetworkIcon chainId={network.id} size={18} variant="branded" />{network.name}</span> : <span>All networks</span>;
              })()}
              <span aria-hidden="true" className="text-[#829287]">⌄</span>
            </button>
            {networkMenuOpen && <div role="listbox" aria-label="Choose network" className="absolute right-0 top-full z-20 mt-1 max-h-64 min-w-full overflow-y-auto rounded-lg border border-[#2b4832] bg-[#0b2014] p-1 shadow-xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <button type="button" role="option" aria-selected={networkFilter === "all"} onClick={() => { setNetworkFilter("all"); setNetworkMenuOpen(false); }} className={`flex h-9 w-full items-center rounded-md px-2 text-left text-[10px] normal-case tracking-normal ${networkFilter === "all" ? "bg-[#556b2f]/30 text-[#cce88a]" : "text-[#c5d1c7] hover:bg-white/[.05]"}`}>All networks</button>
              {availableNetworks.map((network) => <button key={network.id} type="button" role="option" aria-selected={networkFilter === String(network.id)} onClick={() => { setNetworkFilter(String(network.id)); setNetworkMenuOpen(false); }} className={`flex h-9 w-full items-center gap-2 rounded-md px-2 text-left text-[10px] normal-case tracking-normal ${networkFilter === String(network.id) ? "bg-[#556b2f]/30 text-[#cce88a]" : "text-[#c5d1c7] hover:bg-white/[.05]"}`}><NetworkIcon chainId={network.id} size={18} variant="branded" /><span>{network.name}</span></button>)}
            </div>}
          </div>
        </div>
        <div className="mb-3 flex flex-wrap gap-2" role="group" aria-label="Filter token holdings by network type">
          {(["All tokens", "Mainnet", "Testnet"] as const).map((item) => (
            <button key={item} type="button" aria-pressed={networkGroup === item} onClick={() => { setNetworkGroup(item); setNetworkFilter("all"); }} className={`h-8 rounded-lg border px-3 text-[9px] transition ${networkGroup === item ? "border-[#718c45]/50 bg-[#556b2f]/30 text-[#b5d76c]" : "border-[#2b4832] bg-[#0b2416] text-[#aab7ad] hover:border-[#567247]"}`}>
              {item}
            </button>
          ))}
        </div>
        <label className="mb-4 flex h-10 max-w-sm items-center gap-2 rounded-lg border border-[#2b4832] bg-[#081a10] px-3 text-[#728178]"><Search size={14} /><input value={tokenSearch} onChange={(event) => setTokenSearch(event.target.value)} placeholder="Search token or symbol" className="min-w-0 flex-1 bg-transparent text-[10px] text-[#e1e9e1] outline-none placeholder:text-[#728178]" /></label>
        <div className="grid grid-cols-[1.3fr_1fr_1fr] border-b border-white/[.07] px-2 pb-2 text-[9px] font-semibold uppercase tracking-[.08em] text-[#718178]"><span>Asset</span><span>Balance</span><span className="text-right">Price</span></div>
        <div className="max-h-[340px] overflow-y-auto pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{filteredAssets.length > 0 ? filteredAssets.map((asset) => <div key={`${asset.networkId}:${asset.symbol}`} className="grid grid-cols-[1.3fr_1fr_1fr] items-center border-b border-white/[.05] px-2 py-3 last:border-0"><div className="flex min-w-0 items-center gap-2.5"><span className="grid size-8 flex-none place-items-center rounded-full bg-white/[.06]"><TokenIcon symbol={asset.symbol} size={32} variant="branded" /></span><span className="min-w-0"><strong className="block text-[10px] text-[#e1e9e1]">{asset.name}</strong><small className="text-[9px] text-[#7f9085]">{asset.symbol} · {networkCatalog.find((network) => network.id === asset.networkId)?.name}</small></span></div><span className="text-[10px] text-[#c9d6ca]">{asset.amount}</span><span className="text-right text-[10px] font-medium text-[#e1e9e1]">{asset.price}</span></div>) : <p className="m-0 px-2 py-6 text-center text-[10px] text-[#87968b]">No tokens match these filters.</p>}</div>
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
