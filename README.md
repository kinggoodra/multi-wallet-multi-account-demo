# Multi-Wallet + Multi-Account Demo

A non-custodial **Next.js / wagmi / viem** proof of concept for managing multiple injected EVM wallet extensions and displaying additional user-entered account addresses.

## Features
- EIP-6963 multi-extension discovery via wagmi
- Connect multiple wallet providers where supported
- Register multiple public addresses under each wallet for monitoring
- Read native token balances on supported networks
- Select accounts for a future multi-DEX trade plan
- Distinguish read-only registered accounts from the account currently permitted to sign

**Demo limitation:** Connecting one wallet extension does not grant permission to sign as all its accounts. The registered addresses are watch-only unless the extension independently exposes/authorizes them. No trading, approvals, auto-signing, or private-key collection is implemented.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000 with supported browser wallet extensions installed.

## Planned next steps
DEX quote adapters (Uniswap, SushiSwap, PancakeSwap), account-specific approval and signing workflows, slippage limits, routing engine, per-wallet transaction status, and reconciliation.

Never paste seed phrases or private keys into this demo.
