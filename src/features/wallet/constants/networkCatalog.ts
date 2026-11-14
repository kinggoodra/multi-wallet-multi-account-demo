export type NetworkGroup = "Mainnet" | "Testnet";

export type NetworkOption = {
  id: number;
  name: string;
  symbol: string;
  group: NetworkGroup;
};

export const networkCatalog: NetworkOption[] = [
  { id: 1, name: "Ethereum", symbol: "ETH", group: "Mainnet" },
  { id: 8453, name: "Base", symbol: "ETH", group: "Mainnet" },
  { id: 42161, name: "Arbitrum One", symbol: "ETH", group: "Mainnet" },
  { id: 10, name: "Optimism", symbol: "ETH", group: "Mainnet" },
  { id: 137, name: "Polygon", symbol: "POL", group: "Mainnet" },
  { id: 43114, name: "Avalanche", symbol: "AVAX", group: "Mainnet" },
  { id: 11155111, name: "Sepolia", symbol: "SepoliaETH", group: "Testnet" },
  { id: 84532, name: "Base Sepolia", symbol: "ETH", group: "Testnet" },
];
