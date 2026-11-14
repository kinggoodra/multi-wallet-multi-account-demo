"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Network, Plus, Trash2, X } from "lucide-react";

type NetworkEntry = {
  name: string;
  chainId: number;
  symbol: string;
  ethersNetwork: string;
};

const STORAGE_KEY = "avaritia.custom-networks";
const inputClass = "mt-1.5 w-full rounded-lg border border-[#38513b] bg-[#081a10] px-3 py-2.5 text-xs text-[#e4eae4] outline-none placeholder:text-[#66776b] focus:border-[#91ad50]";

export default function AddNetworks() {
  const [open, setOpen] = useState(false);
  const [networks, setNetworks] = useState<NetworkEntry[]>([]);
  const [name, setName] = useState("");
  const [chainId, setChainId] = useState("");
  const [symbol, setSymbol] = useState("");
  const [ethersNetwork, setEthersNetwork] = useState("matic");
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const stored: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
      if (Array.isArray(stored)) setNetworks(stored);
    } catch {
      setNetworks([]);
    }
  }, []);

  function persist(next: NetworkEntry[]) {
    setNetworks(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  function addNetwork(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedChainId = Number(chainId);
    if (!Number.isSafeInteger(parsedChainId) || parsedChainId < 1) {
      setError("Enter a valid positive chain ID.");
      return;
    }
    if (networks.some((network) => network.chainId === parsedChainId)) {
      setError("A network with this chain ID is already saved.");
      return;
    }
    const next = [...networks, {
      name: name.trim(),
      chainId: parsedChainId,
      symbol: symbol.trim().toUpperCase(),
      ethersNetwork: ethersNetwork.trim(),
    }];
    persist(next);
    setName("");
    setChainId("");
    setSymbol("");
    setEthersNetwork("matic");
    setError("");
  }

  function removeNetwork(chain: number) {
    persist(networks.filter((network) => network.chainId !== chain));
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-haspopup="dialog" className="inline-flex items-center gap-2 rounded-[10px] border border-[#536839] bg-[#a8c85d] px-3 py-2 text-[10px] font-bold text-[#142217] transition hover:bg-[#b8d66e]">
        <Plus size={14} /> Add networks
      </button>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/65 p-4 backdrop-blur-[3px]" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="network-dialog-title" className="max-h-[90vh] w-full max-w-[620px] overflow-y-auto rounded-2xl border border-[#294332] bg-[#0c2114] p-6 shadow-2xl max-[600px]:p-4">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 id="network-dialog-title" className="m-0 text-lg font-bold text-[#e4eae4]">Manage networks</h2>
                <p className="mt-1 text-xs text-[#8d9b90]">Save network details for your wallet workspace.</p>
              </div>
              <button type="button" aria-label="Close" onClick={() => setOpen(false)} className="grid size-8 shrink-0 place-items-center rounded-lg border border-[#38513b] text-[#aab7ad] hover:bg-white/5"><X size={15} /></button>
            </div>

            <form onSubmit={addNetwork} className="rounded-xl border border-[#294332] bg-[#102419] p-4">
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 max-[520px]:grid-cols-1">
                <label className="text-[11px] text-[#aab7ad]">Network name<input className={inputClass} required maxLength={48} placeholder="Polygon" value={name} onChange={(event) => setName(event.target.value)} /></label>
                <label className="text-[11px] text-[#aab7ad]">Chain ID<input className={inputClass} required type="number" min="1" step="1" placeholder="137" value={chainId} onChange={(event) => setChainId(event.target.value)} /></label>
                <label className="text-[11px] text-[#aab7ad]">Native symbol<input className={inputClass} required maxLength={12} placeholder="MATIC" value={symbol} onChange={(event) => setSymbol(event.target.value)} /></label>
                <label className="text-[11px] text-[#aab7ad]">ethersNetwork<input className={inputClass} required maxLength={48} placeholder="matic" value={ethersNetwork} onChange={(event) => setEthersNetwork(event.target.value)} /></label>
              </div>
              {error && <p role="alert" className="mt-3 text-[11px] text-[#f0a09a]">{error}</p>}
              <div className="mt-4 flex justify-end">
                <button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-[#a8c85d] px-4 py-2 text-xs font-bold text-[#142217] hover:bg-[#b8d66e]"><Plus size={14} /> Save network</button>
              </div>
            </form>

            <div className="mt-5">
              <h3 className="mb-2 text-[11px] font-bold uppercase tracking-[.12em] text-[#819083]">Saved networks ({networks.length})</h3>
              {networks.length === 0 ? (
                <div className="flex items-center gap-3 rounded-xl border border-dashed border-[#38513b] px-4 py-5 text-xs text-[#819083]"><Network size={17} /> No custom networks saved yet.</div>
              ) : (
                <ul className="m-0 space-y-2 p-0">
                  {networks.map((network) => (
                    <li key={network.chainId} className="flex items-center justify-between gap-3 rounded-xl border border-[#294332] bg-[#081a10] px-4 py-3">
                      <div className="min-w-0"><p className="m-0 truncate text-xs font-semibold text-[#dce5dc]">{network.name}<span className="ml-2 font-normal text-[#819083]">{network.symbol}</span></p><p className="m-0 mt-1 text-[10px] text-[#819083]">Chain ID {network.chainId} · ethersNetwork: {network.ethersNetwork}</p></div>
                      <button type="button" aria-label={`Remove ${network.name}`} onClick={() => removeNetwork(network.chainId)} className="grid size-8 shrink-0 place-items-center rounded-lg text-[#9eaaa0] hover:bg-[#41221f] hover:text-[#f0a09a]"><Trash2 size={14} /></button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
