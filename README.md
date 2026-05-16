# EquityAccess

Marketplace secundario para equity privado tokenizado en Avalanche. KYC reusable on-chain, orderbook on-chain con compliance integrado a nivel de smart contract.

Construido para el Hackathon LatAm Institucional de Avalanche.

## Cómo correr local

```bash
# Contratos
cd contracts
pnpm install
npx hardhat compile

# Frontend
cd ../web
pnpm install
pnpm dev          # http://localhost:3000
```

## Stack

- Solidity 0.8.24 + Hardhat + OpenZeppelin v5
- Next.js 14 + Tailwind v3.4 + shadcn/ui
- wagmi v2 + viem v2 + RainbowKit v2
- Red: Avalanche Fuji testnet (chainId 43113)
