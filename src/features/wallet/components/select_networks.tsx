"use client";

import { useEffect, useState, type FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { NetworkIcon } from "@web3icons/react/dynamic";
import { ChevronDown, Plus, Trash2, X } from "lucide-react";
import axios from "axios";
import { useDashboardState } from "../state/DashboardState";
import { networkCatalog, type NetworkGroup, type NetworkOption } from "../constants/networkCatalog";

export default function AddNetworks() {
  const [group, setGroup] = useState<NetworkGroup>("Mainnet");
  const [networks, setNetworks] = useState<NetworkOption[]>(networkCatalog);
  const { selectedNetworks, setSelectedNetworks, networkSelectorOpen: open, setNetworkSelectorOpen: setOpen } = useDashboardState();
  const [selectedIds, setSelectedIds] = useState<number[]>(() => [
    ...selectedNetworks.M_chainids,
    ...selectedNetworks.T_chainids,
  ]);
  const [adding, setAdding] = useState(false);
  const [chainId, setChainId] = useState("");
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [newGroup, setNewGroup] = useState<NetworkGroup>("Mainnet");
  const [error, setError] = useState("");
  const [requestError, setRequestError] = useState("");
  const [saving, setSaving] = useState(false);
  const reducedMotion = useReducedMotion();

  const visibleNetworks = [...networks]
    .filter((network) => network.group === group)
    .sort((a, b) => Number(selectedIds.includes(b.id)) - Number(selectedIds.includes(a.id)));

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  function toggleNetwork(id: number) {
    setSelectedIds((current) => current.includes(id)
      ? current.filter((selectedId) => selectedId !== id)
      : [...current, id]);
  }

  function addNetwork(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const id = Number(chainId);
    const trimmedName = name.trim();
    const trimmedSymbol = symbol.trim().toUpperCase();
    if (!Number.isSafeInteger(id) || id <= 0 || !trimmedName || !trimmedSymbol) {
      setError("Enter a valid chain ID, network name, and symbol.");
      return;
    }
    if (networks.some((network) => network.id === id)) {
      setError("A network with this chain ID already exists.");
      return;
    }
    setNetworks((current) => [...current, { id, name: trimmedName, symbol: trimmedSymbol, group: newGroup }]);
    setGroup(newGroup);
    setChainId("");
    setName("");
    setSymbol("");
    setError("");
    setAdding(false);
  }

  function removeNetwork(id: number) {
    setNetworks((current) => current.filter((network) => network.id !== id));
    setSelectedIds((current) => current.filter((selectedId) => selectedId !== id));
  }

  async function finishSelection() {
    if (saving) return;
    const selection = {
      M_chainids: networks
        .filter((network) => network.group === "Mainnet" && selectedIds.includes(network.id))
        .map((network) => network.id),
      T_chainids: networks
        .filter((network) => network.group === "Testnet" && selectedIds.includes(network.id))
        .map((network) => network.id),
    };

    setSaving(true);
    setRequestError("");
    try {
      await Promise.all([
        axios.post("http://localhost:5000/api/mainnet", {
          chain_ids: selection.M_chainids,
        }),
        axios.post("http://localhost:5000/api/testent", {
          chain_ids: selection.T_chainids,
        }),
      ]);
      setSelectedNetworks(selection);
      setOpen(false);
    } catch {
      setRequestError("Unable to save network selection. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <button
        type="button"
        aria-label="Open network selection"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="inline-flex h-[42px] w-[170px] max-w-full items-center justify-center gap-2 rounded-[9px] border border-[#718c45] bg-[#9bb756] px-3 text-[#102015] transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d7f59b]"
      >
        <span className="flex-1 text-[12px] font-bold">Networks</span>
        <ChevronDown size={16} className={`transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50"
            role="presentation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.2 }}
          >
            <button
              type="button"
              aria-label="Close network selection"
              onClick={() => setOpen(false)}
              className="absolute inset-0 h-full w-full bg-black/55 backdrop-blur-[2px]"
            />
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-labelledby="networks-title"
              initial={{ x: reducedMotion ? 0 : "100%" }}
              animate={{ x: 0 }}
              exit={{ x: reducedMotion ? 0 : "100%" }}
              transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 340, damping: 34 }}
              className="absolute inset-y-0 right-0 flex w-full max-w-[486px] flex-col border-l border-[#314b36] bg-[linear-gradient(160deg,#0d2416,#091a10)] shadow-[-24px_0_70px_#0008]"
            >
              <header className="flex shrink-0 items-center justify-between border-b border-[#223a29] px-6 py-5">
                <div>
                  <h2 id="networks-title" className="m-0 text-[17px] font-semibold text-[#e4eae4]">Networks</h2>
                  <p className="mb-0 mt-1 text-[10px] text-[#829287]">Choose networks for your workspace</p>
                </div>
                <button type="button" aria-label="Close network selection" onClick={() => setOpen(false)} className="grid size-8 place-items-center rounded-lg border border-[#2d4532] bg-[#11271a] text-[#a9b6aa] transition hover:bg-[#1a3522] hover:text-white">
                  <X size={15} />
                </button>
              </header>

              <div className="shrink-0 px-6 pb-4 pt-5">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="m-0 text-sm font-semibold text-[#eef4ec]">Choose networks</h3>
                  <span className="text-[10px] text-[#748478]">{selectedIds.length} enabled</span>
                </div>
                <div role="tablist" aria-label="Network group" className="flex rounded-xl border border-[#2c4634] bg-[#08170f] p-1.5">
                  {(["Mainnet", "Testnet"] as const).map((item) => (
                    <button key={item} type="button" role="tab" aria-selected={group === item} onClick={() => setGroup(item)} className={`h-10 flex-1 rounded-lg text-[12px] font-semibold transition-colors ${group === item ? "bg-[#b5d76c] text-[#14200d]" : "text-[#87978b] hover:text-[#e4ece4]"}`}>
                      {item}
                    </button>
                  ))}
                </div>
                <button type="button" aria-expanded={adding} onClick={() => { setAdding((current) => !current); setError(""); }} className="mt-3 inline-flex items-center gap-2 text-[10px] font-semibold text-[#b5d76c] transition hover:text-[#d5ef9a]">
                  <Plus size={14} aria-hidden="true" /> Add more networks
                </button>
              </div>

              {adding && (
                <form onSubmit={addNetwork} className="mx-6 mb-3 shrink-0 rounded-xl border border-[#2c4634] bg-[#0b2014] p-4">
                  <p className="mb-3 mt-0 text-[11px] font-semibold text-[#dbe5da]">Add a custom network</p>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="text-[9px] text-[#819084]">Chain ID<input required type="number" min="1" step="1" value={chainId} onChange={(event) => setChainId(event.target.value)} className="mt-1 h-9 w-full rounded-md border border-[#2d4532] bg-[#08170f] px-2 text-[11px] text-[#e4eae4] outline-none focus:border-[#a8c85d]" /></label>
                    <label className="text-[9px] text-[#819084]">Name<input required value={name} onChange={(event) => setName(event.target.value)} className="mt-1 h-9 w-full rounded-md border border-[#2d4532] bg-[#08170f] px-2 text-[11px] text-[#e4eae4] outline-none focus:border-[#a8c85d]" /></label>
                    <label className="text-[9px] text-[#819084]">Symbol<input required value={symbol} onChange={(event) => setSymbol(event.target.value)} className="mt-1 h-9 w-full rounded-md border border-[#2d4532] bg-[#08170f] px-2 text-[11px] text-[#e4eae4] outline-none focus:border-[#a8c85d]" /></label>
                    <label className="text-[9px] text-[#819084]">Group<select value={newGroup} onChange={(event) => setNewGroup(event.target.value as NetworkGroup)} className="mt-1 h-9 w-full rounded-md border border-[#2d4532] bg-[#08170f] px-2 text-[11px] text-[#e4eae4] outline-none focus:border-[#a8c85d]"><option value="Mainnet">Mainnet</option><option value="Testnet">Testnet</option></select></label>
                  </div>
                  {error && <p role="alert" className="mb-0 mt-2 text-[10px] text-[#ff9b8f]">{error}</p>}
                  <div className="mt-3 flex justify-end"><button type="submit" className="h-8 rounded-md bg-[#b5d76c] px-3 text-[10px] font-bold text-[#14200d] transition hover:brightness-110">Add network</button></div>
                </form>
              )}

              <ul className="m-0 min-h-0 flex-1 list-none space-y-2 overflow-y-auto px-6 pb-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {visibleNetworks.map((network) => {
                  const selected = selectedIds.includes(network.id);
      const builtIn = networkCatalog.some((item) => item.id === network.id);
                  return (
                    <li key={network.id} className="flex items-center gap-3 rounded-xl border border-[#263d2d] bg-[#0b2014] px-3 py-3">
                      <span className="grid size-[34px] flex-none place-items-center rounded-full border border-[#2d4532] bg-[#091a10]">
                        {builtIn ? <NetworkIcon chainId={network.id} size={22} variant="branded" /> : <span className="text-[10px] font-bold text-[#b5d76c]">{network.symbol.slice(0, 2)}</span>}
                      </span>
                      <span className="min-w-0 flex-1">
                        <strong className="block truncate text-[11px] font-semibold text-[#dbe5da]">{network.name}</strong>
                        <small className="mt-0.5 block text-[9px] text-[#819084]">{network.group} · {network.symbol}</small>
                      </span>
                      <button type="button" role="switch" aria-checked={selected} aria-label={`${network.name} network`} onClick={() => toggleNetwork(network.id)} className={`relative inline-flex h-5 w-[34px] flex-none items-center rounded-full border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b5d76c] ${selected ? "border-[#a8c85d] bg-[#789443]" : "border-[#46574a] bg-[#26372b]"}`}>
                        <span className={`size-3.5 rounded-full bg-[#f3f6ee] shadow-sm transition-transform ${selected ? "translate-x-[16px]" : "translate-x-[3px]"}`} />
                      </button>
                      <button type="button" aria-label={`Delete ${network.name} network`} onClick={() => removeNetwork(network.id)} className="grid size-8 flex-none place-items-center rounded-lg border border-[#493432] bg-[#211715] text-[#c8897f] transition hover:border-[#8b5149] hover:bg-[#35201d] hover:text-[#ffb0a4]">
                        <Trash2 size={14} aria-hidden="true" />
                      </button>
                    </li>
                  );
                })}
                {visibleNetworks.length === 0 && <li className="rounded-xl border border-dashed border-[#263d2d] px-4 py-6 text-center text-[11px] text-[#819084]">No networks in this group yet.</li>}
              </ul>

              <footer className="flex shrink-0 items-center justify-between gap-4 border-t border-[#223a29] px-6 py-4">
                <div className="min-w-0">
                  <p className="m-0 text-[9px] text-[#718176]">All networks start off. Enabled networks appear first.</p>
                  {requestError && <p role="alert" className="mb-0 mt-1 text-[9px] text-[#ff9b8f]">{requestError}</p>}
                </div>
                <button type="button" onClick={() => void finishSelection()} disabled={saving} className="h-9 shrink-0 rounded-lg bg-[#b5d76c] px-5 text-[11px] font-bold text-[#14200d] transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d7f59b] disabled:cursor-wait disabled:opacity-60">{saving ? "Saving…" : "Done"}</button>
              </footer>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
