import axios from "axios";

export type Erc20Transfer = {
  hash: string;
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

type RecentTransfersResponse = { success: boolean; data: Erc20Transfer[] };

export async function fetchRecentTransfers(walletAddress: string, chainId: number, signal?: AbortSignal) {
  const { data } = await axios.get<RecentTransfersResponse>(
    "http://localhost:5000/api/wallet/erc20/recent",
    { params: { walletAddress, chainId }, signal },
  );
  if (!data.success || !Array.isArray(data.data)) {
    throw new Error("The transaction history response was invalid.");
  }
  return data.data;
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
      id: `${transfer.hash}-${index}`,
      hash: transfer.hash,
      type: incoming ? "Incoming transfer" : "Outgoing transfer",
      assetAmount: `${incoming ? "+" : "−"}${amount} ${transfer.tokenSymbol}`,
      date: Number.isNaN(date.getTime())
        ? transfer.date
        : new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date),
    };
  });
}
