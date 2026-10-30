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
    <section className="watch-form">
      <h2>2. Add another address (Watch only)</h2>
      <p>Adding an address does NOT authorize it to sign transactions.</p>
      <label className="form-control">
        <span>Connected wallet</span>
        <select
          value={walletUid}
          onChange={(event) => onWalletChange(event.target.value)}
          disabled={disabled}
        >
          <option value="">Choose a connected wallet</option>
          {connections.map((connection) => (
            <option
              key={connection.connector.uid}
              value={connection.connector.uid}
            >
              {connection.connector.name}
            </option>
          ))}
        </select>
      </label>
      <label className="form-control address-control">
        <span>EVM address</span>
        <input
          value={address}
          onChange={(event) => onAddressChange(event.target.value)}
          placeholder="0x... public address"
          disabled={disabled}
        />
      </label>
      <button
        className="watch-submit"
        type="button"
        onClick={onAdd}
        disabled={disabled}
      >
        Register address
      </button>
      <p role="status">{message}</p>
    </section>
  );
}
