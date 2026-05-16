# EquityAccess

Marketplace secundario para equity privado tokenizado en Avalanche.

## Contexto del proyecto

Estamos construyendo este proyecto para el **Hackathon LatAm Institucional de Avalanche**.

- **Deadline**: 17 mayo 2026, 9:00 AM hora de México (UTC-6)
- **Tracks objetivo**: Mercados Secundarios para Equity Privado · Tokenización de Acciones IFC · Identidad Digital y KYC On-Chain
- **Partners a impresionar**: Arkangeles, Bankaool, Oracle, Wavy Node, Ledger Leaders Week

## Qué es EquityAccess

Plataforma donde inversionistas pueden comprar y vender fracciones tokenizadas de empresas privadas latinoamericanas (Kavak, Bitso, startups de Arkangeles), con KYC reusable on-chain y compliance regulatorio integrado a nivel de smart contract.

**El elevator pitch**: "El Nasdaq de las empresas privadas en LatAm. Inversionistas atrapados en rondas pueden salir en 60 segundos. Empresas dan liquidez a empleados sin tender offer caro."

## MVP que vamos a entregar

Demo end-to-end con este happy path:

1. Usuario conecta wallet → completa KYC mock → recibe verificación on-chain
2. Ve marketplace con 4 empresas privadas tokenizadas y precios actuales
3. Entra a vista de trading con orderbook real y mini chart de precio
4. Coloca una orden limit (comprar o vender) → se ejecuta on-chain en Fuji
5. Ve sus holdings actualizados en /portfolio

Si lo demuestras en el video, está dentro del scope. Si no, no se construye.

## Stack técnico

**Contratos**
- Solidity 0.8.24, Hardhat con TypeScript, OpenZeppelin v5
- Red: Avalanche Fuji testnet (chainId 43113)
- RPC: https://api.avax-test.network/ext/bc/C/rpc
- Faucet: https://core.app/tools/testnet-faucet/

**Frontend**
- Next.js 14 con App Router + TypeScript estricto
- Tailwind CSS **v3.4** (NO v4, shadcn no es 100% compatible aún) + shadcn/ui
- wagmi v2 + viem v2 + RainbowKit v2
- Wallets soportadas: Core (preferida, es la nativa de Avalanche) + MetaMask fallback
- Charts: `lightweight-charts` de TradingView

**Package manager**: pnpm en todo el monorepo.

## Decisiones arquitectónicas (NO cambiar sin discutir conmigo)

1. **Orderbook on-chain, no AMM.** Es el patrón correcto para securities (BlackRock, Securitize y Tokeny lo hacen así). Un AMM diluye el price discovery y los reguladores lo odian.
2. **Compliance dentro del token mismo.** Cada `transfer` valida con `IdentityRegistry.isVerified(to)`. No usamos un contrato proxy separado de compliance.
3. **KYC mockeado.** El backend firma claims y los agrega al registry. NO integramos Persona/SumSub/Onfido reales — no hay tiempo y no aporta a la demo.
4. **MockUSDC propio**, no bridge real ni faucet externo.
5. **Datos de empresas hardcoded** con info pública real de prensa. Sin scraping ni APIs externas.
6. **Sin tests en frontend.** Solo tests unitarios en los contratos críticos.

## Estructura del repo

```
equity-access/
├── CLAUDE.md
├── DEVELOPMENT_PLAN.md
├── README.md
├── contracts/                       # Hardhat project
│   ├── contracts/
│   │   ├── SecurityToken.sol        # ERC-3643 simplificado
│   │   ├── IdentityRegistry.sol     # KYC registry on-chain
│   │   ├── Orderbook.sol            # Orderbook con escrow
│   │   └── MockUSDC.sol             # Stablecoin de prueba
│   ├── scripts/
│   │   ├── deploy.ts
│   │   └── seed.ts                  # Crea 4 tokens + órdenes mock
│   ├── test/
│   ├── deployments/fuji.json        # Addresses generados al deployar
│   └── hardhat.config.ts
└── web/                             # Next.js app
    ├── app/
    │   ├── page.tsx                 # Marketplace
    │   ├── trade/[token]/page.tsx   # Trading view (la página estrella)
    │   ├── portfolio/page.tsx
    │   ├── kyc/page.tsx
    │   ├── api/kyc/verify/route.ts  # Firma claims mock
    │   ├── providers.tsx
    │   └── layout.tsx
    ├── components/
    │   ├── ui/                      # shadcn primitives
    │   ├── orderbook.tsx
    │   ├── trade-panel.tsx
    │   ├── asset-card.tsx
    │   ├── price-chart.tsx
    │   ├── kyc-stepper.tsx
    │   └── wallet-connect.tsx
    └── lib/
        ├── wagmi.ts
        ├── contracts.ts             # ABIs + addresses tipados
        ├── mock-companies.ts        # Empresas listadas
        └── format.ts                # Formatters de USDC, fechas, etc.
```

## Comandos clave

```bash
# Contratos
cd contracts
pnpm install
npx hardhat compile
npx hardhat test
npx hardhat run scripts/deploy.ts --network fuji
npx hardhat run scripts/seed.ts --network fuji

# Frontend
cd web
pnpm install
pnpm dev         # http://localhost:3000
pnpm build
pnpm lint
```

## Variables de entorno

`contracts/.env`:
```
PRIVATE_KEY=0x...                                              # wallet de deploy
FUJI_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
SNOWTRACE_API_KEY=...                                          # opcional, para verify
```

`web/.env.local`:
```
NEXT_PUBLIC_CHAIN_ID=43113
NEXT_PUBLIC_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
NEXT_PUBLIC_USDC_ADDRESS=0x...
NEXT_PUBLIC_IDENTITY_REGISTRY=0x...
NEXT_PUBLIC_ORDERBOOK_ADDRESS=0x...
NEXT_PUBLIC_TOKEN_KVK=0x...
NEXT_PUBLIC_TOKEN_BTS=0x...
NEXT_PUBLIC_TOKEN_CLP=0x...
NEXT_PUBLIC_TOKEN_ARK1=0x...
KYC_ISSUER_PRIVATE_KEY=0x...                                   # solo server-side, firma claims
```

## Estilo visual

Estética **fintech institucional**: Robinhood + Bloomberg Terminal + Linear.

- Paleta principal: blanco, gris claro (`#F1EFE8`, `#D3D1C7`), acento verde `#0F6E56`, acento morado `#3C3489`
- Verde para acciones positivas (buy, success), rojo solo para errores y sell
- Bordes 0.5px, border-radius 8-12px
- Sin gradientes, sin sombras pesadas, sin neón
- **Sentence case en TODO** (nunca Title Case ni ALL CAPS)
- Sin emojis en el código ni en la UI
- Tipografía: Inter como font principal

## Convenciones de código

- TypeScript estricto, **jamás `any`** (usar `unknown` y narrow)
- Identificadores y comentarios en inglés
- Strings de UI en español neutro
- Componentes funcionales con hooks, no clases
- shadcn/ui para todo componente primitivo (button, input, dialog, etc.)
- Imports absolutos con `@/`
- Server components por default; `'use client'` solo donde se necesite (wallet, charts, formularios interactivos)
- Formatear números con `Intl.NumberFormat` siempre
- Nunca `console.log` en código que va a producción — usar `console.error` solo en catches

## Lo que NO hay que hacer

- ❌ NO deployar a mainnet bajo ninguna circunstancia
- ❌ NO usar Tailwind v4 (incompatibilidades con shadcn)
- ❌ NO añadir tests al frontend
- ❌ NO integrar KYC real (Persona, SumSub) — mockeado
- ❌ NO usar AMM, sólo orderbook
- ❌ NO añadir features fuera del MVP definido arriba
- ❌ NO subir `.env` ni `deployments/*.json` con private keys al repo
- ❌ NO usar emojis en código ni UI
- ❌ NO bloquear el flow por wallet errors — degradar gracefully

## Cómo trabajar conmigo (Claude Code)

1. **Siempre confirma el plan antes de escribir mucho código.** Te diré "go" o "ajusta X".
2. **Itera en fases** definidas en `DEVELOPMENT_PLAN.md`.
3. **Al terminar una fase** corre los tests / build y muestra el output completo.
4. **Si encuentras decisiones ambiguas, pregunta** antes de asumir.
5. **Commits pequeños** y descriptivos con conventional commits: `feat:`, `fix:`, `chore:`, `refactor:`.
6. **Si una tarea toma más del doble de lo estimado**, alerta y propón simplificar.
7. **Última hora antes del deadline** es solo para grabar demo y submit. No tocar código.
