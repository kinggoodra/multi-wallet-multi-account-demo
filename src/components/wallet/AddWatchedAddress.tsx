import type { Connection } from "wagmi";

type Props = {
  connections: readonly Connection[];
  walletUid: string;
  address: string;
  message: string;
  disabled: boolean;
  onWalletChange: (value: string) => void;
  onAddressChange: (value: string) => void;
  onAdd: () => void;
};

export default function AddWatchedAddress({
  connections,
  walletUid,
  address,
  message,
  disabled,
  onWalletChange,
  onAddressChange,
  onAdd,
}: Props) {
  return (
    <section className="panel">
      <h2>2. Add another address (Watch only)</h2>
      <p className="caption">
        Adding an address does NOT authorize it to sign transactions.
      </p>
      <select
        value={walletUid}
        onChange={(event) => onWalletChange(event.target.value)}
        disabled={disabled}
      >
        <option value="">Choose a connected wallet</option>
        {connections.map((connection) => (
          <option key={connection.connector.uid} value={connection.connector.uid}>
            {connection.connector.name}
          </option>
        ))}
      </select>
      <input
        value={address}
        onChange={(event) => onAddressChange(event.target.value)}
        placeholder="0x... public address"
        disabled={disabled}
      />
      <button onClick={onAdd} disabled={disabled}>
        Register address
      </button>
      <p role="status">{message}</p>
    </section>
  );
}
