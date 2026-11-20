"use client";

import { useState } from "react";
import { NetworkIcon } from "@web3icons/react/dynamic";
import type { NetworkOption } from "../constants/networkCatalog";

export type NetworkSelection = number | "all" | null;

type NetworkDropdownProps = {
  networks: NetworkOption[];
  value: NetworkSelection;
  onChange: (value: NetworkSelection) => void;
  allowAll?: boolean;
};

export default function NetworkDropdown({
  networks,
  value,
  onChange,
  allowAll = false,
}: NetworkDropdownProps) {
  const [open, setOpen] = useState(false);
  const selectedNetwork = typeof value === "number"
    ? networks.find((network) => network.id === value)
    : undefined;

  function select(nextValue: NetworkSelection) {
    onChange(nextValue);
    setOpen(false);
  }

  return (
    <div
      className="relative grid gap-1 text-[8px] font-semibold uppercase tracking-[.08em] text-[#819084]"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") setOpen(false);
      }}
    >
      <span>Network</span>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="inline-flex h-10 w-[204px] max-w-full items-center justify-between gap-2 rounded-lg border border-[#2b4832] bg-[#081a10] px-3 text-[11px] font-normal normal-case tracking-normal text-[#dce5dc] outline-none hover:border-[#567247] focus-visible:border-[#8ba83a]"
      >
        {value === "all" ? <span>All networks</span>
          : selectedNetwork ? <span className="inline-flex items-center gap-2"><NetworkIcon chainId={selectedNetwork.id} size={18} variant="branded" />{selectedNetwork.name}</span>
            : <span>{networks.length ? "Select network" : "No networks enabled"}</span>}
        <span aria-hidden="true" className="text-[#829287]">⌄</span>
      </button>
      {open && (
        <div role="listbox" aria-label="Choose network" className="absolute right-0 top-full z-50 mt-1 max-h-[min(22rem,calc(100vh-8rem))] w-[min(230px,calc(100vw-32px))] overflow-y-auto rounded-xl border border-[#2b4832] bg-[#0b2014] p-1.5 shadow-xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {allowAll && (
            <button
              type="button"
              role="option"
              aria-selected={value === "all"}
              onClick={() => select("all")}
              className={`flex h-10 w-full items-center rounded-lg px-2.5 text-left text-[11px] whitespace-nowrap normal-case tracking-normal transition-colors ${value === "all" ? "bg-[#556b2f]/30 text-[#cce88a]" : "text-[#c5d1c7] hover:bg-white/[.05]"}`}
            >
              All networks
            </button>
          )}
          {networks.map((network) => (
            <button
              key={network.id}
              type="button"
              role="option"
              aria-selected={value === network.id}
              onClick={() => select(network.id)}
              className={`flex h-10 w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-[11px] whitespace-nowrap normal-case tracking-normal transition-colors ${value === network.id ? "bg-[#556b2f]/30 text-[#cce88a]" : "text-[#c5d1c7] hover:bg-white/[.05]"}`}
            >
              <NetworkIcon chainId={network.id} size={18} variant="branded" />
              <span className="whitespace-nowrap">{network.name}</span>
            </button>
          ))}
          {!allowAll && networks.length === 0 && (
            <p className="m-0 px-2 py-3 text-[10px] font-normal normal-case tracking-normal text-[#87968b]">Enable a network in Networks to choose it.</p>
          )}
        </div>
      )}
    </div>
  );
}
