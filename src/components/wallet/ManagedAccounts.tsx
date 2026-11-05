"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import type { PublicClient } from "viem";
import type { Address } from "viem";
import AnimatedList from "../ui/AnimatedList";

export type ManagedAccountEntry = {
  id: string;
  wallet: string;
  address: Address;
  chainId: number;
  canSign: boolean;
};

type Props = {
  entries: ManagedAccountEntry[];
  selected: string[];
  balances: Record<string, string>;
  client: PublicClient | undefined;
  onSelectionChange: (id: string, checked: boolean) => void;
};

export default function ManagedAccounts({
  entries,
  selected,
  balances,
  client,
  onSelectionChange,
}: Props) {
  const [copiedAccountId, setCopiedAccountId] = useState<string | null>(null);

  async function copyAddress(account: ManagedAccountEntry) {
    try {
      await navigator.clipboard.writeText(account.address);
      setCopiedAccountId(account.id);
      window.setTimeout(() => setCopiedAccountId((current) => current === account.id ? null : current), 1800);
    } catch {
      setCopiedAccountId(null);
    }
  }

  return (
    <section>
      {entries.length === 0 ? (
        <p className="p-[14px] text-[11px] text-[#9eaea3]">Connect and register accounts to begin.</p>
      ) : (
        <AnimatedList>{entries.map((account) => (
          <article className="animate-in fade-in slide-in-from-bottom-2 duration-500 grid min-w-0 grid-cols-[minmax(220px,1.1fr)_minmax(105px,.45fr)_minmax(100px,.5fr)_auto] items-center gap-4 border-b border-white/[.06] py-[14px] last:border-0 max-[1050px]:grid-cols-[minmax(180px,1fr)_auto_auto] max-[680px]:grid-cols-[minmax(0,1fr)_auto] max-[680px]:gap-x-2 max-[680px]:gap-y-[7px] max-[680px]:py-[13px]" key={account.id}>
            <label className="flex min-w-0 items-center gap-[10px] text-[11px] max-[1050px]:col-start-1 max-[680px]:col-start-1 max-[680px]:row-start-1 max-[680px]:gap-2 max-[680px]:text-[10px]">
              <input
                className="size-[14px] flex-none accent-[#a7c85e] max-[680px]:size-[13px]"
                type="checkbox"
                checked={selected.includes(account.id)}
                onChange={(event) =>
                  onSelectionChange(account.id, event.target.checked)
                }
              />
              <strong className="overflow-hidden text-ellipsis whitespace-nowrap text-xs font-semibold tracking-[-.01em]">{account.wallet}</strong> —
              {account.canSign ? (
                <span className="whitespace-nowrap rounded-full bg-[#556b2f]/25 px-2 py-1.5 text-[9px] font-bold tracking-[.07em] text-[#b9d674] max-[680px]:col-start-2 max-[680px]:row-start-1 max-[680px]:px-[7px] max-[680px]:py-[5px] max-[680px]:text-[7px]">SIGNING</span>
              ) : (
                <span className="whitespace-nowrap rounded-full bg-white/[.04] px-2 py-1.5 text-[9px] font-bold tracking-[.07em] text-[#adbaae] max-[680px]:col-start-2 max-[680px]:row-start-1 max-[680px]:px-[7px] max-[680px]:py-[5px] max-[680px]:text-[7px]">WATCH ONLY</span>
              )}
            </label>
            <div className="[overflow-wrap:anywhere] col-start-1 -mt-3 ml-6 flex min-w-0 items-center gap-2 font-mono text-[10px] leading-[1.5] text-[#819087] max-[1050px]:row-start-2 max-[680px]:col-span-full max-[680px]:row-start-2 max-[680px]:mt-0 max-[680px]:mb-0 max-[680px]:ml-[21px] max-[680px]:text-[9px]">
              <span className="[overflow-wrap:anywhere] min-w-0">{account.address}</span>
              <button
                className="grid size-[25px] flex-none place-items-center rounded-[7px] border border-[#425a43] bg-white/[.03] p-0 text-[#a8c85d] transition hover:border-[#718c45] hover:bg-[#556b2f]/20 hover:text-[#d7efa0] focus-visible:outline-2 focus-visible:outline-[#a8c85d] focus-visible:outline-offset-2"
                type="button"
                onClick={() => void copyAddress(account)}
                aria-label={copiedAccountId === account.id ? "Address copied" : "Copy address"}
                title={copiedAccountId === account.id ? "Copied" : "Copy address"}
              >
                {copiedAccountId === account.id ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
            <div className="text-[10px] leading-[1.5] text-[#dce5dc] max-[1050px]:col-start-3 max-[1050px]:row-start-1 max-[680px]:col-span-full max-[680px]:col-start-1 max-[680px]:row-start-3 max-[680px]:ml-[21px] max-[680px]:text-[9px]">
              Chain {account.chainId} • Native balance:{" "}
                {account.chainId === client?.chain?.id
                ? balances[account.id] ?? "Loading..."
                : "Change read network"}
            </div>
          </article>
        ))}</AnimatedList>
      )}
      <p className="border-t border-white/[.06] pt-[11px] pb-[3px] text-[10px] text-[#7f9085]">
        <strong>{selected.length}</strong> accounts selected for a future route
        plan.
      </p>
      <p className="text-[10px] text-[#7f9085]">
        No swap or multi-account transaction signing is implemented in this
        demonstration.
      </p>
    </section>
  );
}
