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
    <section className="managed-account-list">
      {entries.length === 0 ? (
        <p className="empty-accounts">Connect and register accounts to begin.</p>
      ) : (
        <AnimatedList>{entries.map((account) => (
          <article className="account-row" key={account.id}>
            <label className="account-select">
              <input
                type="checkbox"
                checked={selected.includes(account.id)}
                onChange={(event) =>
                  onSelectionChange(account.id, event.target.checked)
                }
              />
              <strong>{account.wallet}</strong> —
              {account.canSign ? (
                <span className="account-badge signer-badge">SIGNING</span>
              ) : (
                <span className="account-badge watch-badge">WATCH ONLY</span>
              )}
            </label>
            <div className="account-address">
              <span>{account.address}</span>
              <button
                className="copy-address-button"
                type="button"
                onClick={() => void copyAddress(account)}
                aria-label={copiedAccountId === account.id ? "Address copied" : "Copy address"}
                title={copiedAccountId === account.id ? "Copied" : "Copy address"}
              >
                {copiedAccountId === account.id ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
            <div className="account-balance">
              Chain {account.chainId} • Native balance:{" "}
                {account.chainId === client?.chain?.id
                ? balances[account.id] ?? "Loading..."
                : "Change read network"}
            </div>
          </article>
        ))}</AnimatedList>
      )}
      <p className="account-footnote">
        <strong>{selected.length}</strong> accounts selected for a future route
        plan.
      </p>
      <p>
        No swap or multi-account transaction signing is implemented in this
        demonstration.
      </p>
    </section>
  );
}
