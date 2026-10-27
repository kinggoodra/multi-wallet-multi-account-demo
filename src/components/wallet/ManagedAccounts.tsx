import type { PublicClient } from "viem";
import type { Address } from "viem";

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
  return (
    <section className="panel">
      <h2>3. Managed accounts</h2>
      {entries.length === 0 ? (
        <p className="muted">Connect and register accounts to begin.</p>
      ) : (
        entries.map((account) => (
          <div className="account" key={account.id}>
            <label>
              <input
                type="checkbox"
                checked={selected.includes(account.id)}
                onChange={(event) =>
                  onSelectionChange(account.id, event.target.checked)
                }
              />
              <strong>{account.wallet}</strong> —
              {account.canSign ? (
                <span className="ok">Active signer candidate</span>
              ) : (
                <span className="warn">Watch-only / switch required</span>
              )}
            </label>
            <div className="address">{account.address}</div>
            <div className="caption">
              Chain {account.chainId} • Native balance:{" "}
              {account.chainId === client?.chain.id
                ? balances[account.id] ?? "Loading..."
                : "Change read network"}
            </div>
          </div>
        ))
      )}
      <p>
        <strong>{selected.length}</strong> accounts selected for a future route
        plan.
      </p>
      <p className="caption">
        No swap or multi-account transaction signing is implemented in this
        demonstration.
      </p>
    </section>
  );
}
