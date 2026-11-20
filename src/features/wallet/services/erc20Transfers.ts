export type Erc20Transfer = {
  hash: string;
  logIndex?: string;
  from: string;
  to: string;
  tokenName: string;
  tokenSymbol: string;
  value: string;
  tokenDecimal: string;
  date: string;
};

export type TransactionHistoryItem = {
  id: string;
  hash: string;
  type: string;
  assetAmount: string;
  date: string;
};

export function openRecentTransfersMonitor(walletAddress: string, chainId: number) {
  const query = new URLSearchParams({ walletAddress, chainId: String(chainId) });
  return new EventSource(`http://localhost:5000/api/wallet/erc20/monitor?${query}`);
}

export function parseTransferEvent(eventData: string): Erc20Transfer[] {
  const parsed: unknown = JSON.parse(eventData);
  if (!Array.isArray(parsed)) return [];
  return parsed.filter(isErc20Transfer);
}

function isErc20Transfer(value: unknown): value is Erc20Transfer {
  if (typeof value !== "object" || value === null) return false;
  const transfer = value as Record<string, unknown>;
  return typeof transfer.hash === "string"
    && typeof transfer.from === "string"
    && typeof transfer.to === "string"
    && typeof transfer.tokenName === "string"
    && typeof transfer.tokenSymbol === "string"
    && typeof transfer.value === "string"
    && typeof transfer.tokenDecimal === "string"
    && typeof transfer.date === "string";
}

export function mapTransfersToHistory(
  transfers: Erc20Transfer[],
  walletAddress: string,
): TransactionHistoryItem[] {
  const normalizedAddress = walletAddress.toLowerCase();
  return transfers.map((transfer, index) => {
    const incoming = transfer.to.toLowerCase() === normalizedAddress;
    const rawAmount = Number(transfer.value) / 10 ** Number(transfer.tokenDecimal);
    const amount = Number.isFinite(rawAmount)
      ? new Intl.NumberFormat("en-US", { maximumFractionDigits: 6 }).format(rawAmount)
      : transfer.value;
    const date = new Date(transfer.date);
    return {
      id: `${transfer.hash}-${transfer.logIndex ?? index}`,
      hash: transfer.hash,
      type: incoming ? "Incoming transfer" : "Outgoing transfer",
      assetAmount: `${incoming ? "+" : "−"}${amount} ${transfer.tokenSymbol}`,
      date: Number.isNaN(date.getTime())
        ? transfer.date
        : new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date),
    };
  });
}

export function prependNewTransfers(
  current: TransactionHistoryItem[],
  transfers: Erc20Transfer[],
  walletAddress: string,
): TransactionHistoryItem[] {
  const incoming = mapTransfersToHistory(transfers, walletAddress);
  const unique = new Map<string, TransactionHistoryItem>();
  for (const item of [...incoming, ...current]) {
    if (!unique.has(item.id)) unique.set(item.id, item);
  }
  return [...unique.values()].slice(0, 5);
}
