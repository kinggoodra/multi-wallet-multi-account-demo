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
    <section className="grid grid-cols-[minmax(160px,240px)_minmax(180px,1fr)_auto] items-end gap-3 max-[850px]:grid-cols-[1fr_1.2fr] max-[680px]:grid-cols-1 max-[680px]:gap-[11px]">
      <h2 className="hidden">2. Add another address (Watch only)</h2>
      <p className="hidden">Adding an address does NOT authorize it to sign transactions.</p>
      <label className="grid min-w-0 gap-[7px]">
        <span className="text-[9px] font-semibold tracking-[.08em] text-[#aab7ad] uppercase">Connected wallet</span>
        <select
          value={walletUid}
          onChange={(event) => onWalletChange(event.target.value)}
          disabled={disabled}
          className="h-[42px] w-full min-w-0 rounded-[9px] border border-[#2b4832] bg-[#081a10] px-3 text-[11px] text-[#e1e9e1] outline-none focus:border-[#8ba83a] focus:ring-[3px] focus:ring-[#8ba83a]/10 disabled:opacity-50 max-[680px]:h-[43px]"
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
      <label className="grid min-w-0 gap-[7px]">
        <span className="text-[9px] font-semibold tracking-[.08em] text-[#aab7ad] uppercase">EVM address</span>
        <input
          value={address}
          onChange={(event) => onAddressChange(event.target.value)}
          placeholder="0x... public address"
          disabled={disabled}
          className="h-[42px] w-full min-w-0 rounded-[9px] border border-[#2b4832] bg-[#081a10] px-3 text-[11px] text-[#e1e9e1] outline-none placeholder:text-[#68786d] focus:border-[#8ba83a] focus:ring-[3px] focus:ring-[#8ba83a]/10 disabled:opacity-50 max-[680px]:h-[43px]"
        />
      </label>
      <button
        className="inline-flex h-[42px] min-h-[34px] items-center justify-center whitespace-nowrap rounded-[9px] border border-[#718c45] bg-[#9bb756] px-[18px] text-[10px] font-bold text-[#102015] transition duration-200 hover:-translate-y-px hover:brightness-110 disabled:transform-none disabled:cursor-not-allowed disabled:opacity-50 max-[850px]:col-start-2 max-[850px]:justify-self-end max-[850px]:min-w-[170px] max-[680px]:h-[43px] max-[680px]:w-full max-[680px]:min-w-0 max-[680px]:col-auto"
        type="button"
        onClick={onAdd}
        disabled={disabled}
      >
        Register address
      </button>
      <p className="col-span-full m-0 text-[10px] text-[#a8c85d] max-[680px]:text-[10px]" role="status">{message}</p>
    </section>
  );
}
