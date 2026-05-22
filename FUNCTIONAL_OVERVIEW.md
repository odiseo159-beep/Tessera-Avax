# Tessera · Functional Overview

Resumen funcional honesto del proyecto. Cubre **qué hace el app**, **cómo
funciona end-to-end**, y **qué partes están live vs mockeadas vs
pendientes**. Pensado para que un juez del hackathon o un futuro
colaborador pueda entender el sistema en 10 minutos sin leer código.

Diagrama de flujo: [`/functional-flow.svg`](./web/public/functional-flow.svg) — diagrama
end-to-end de cómo se conectan user, frontend, backend y on-chain.

Diagrama de stack (capas): [`/architecture.svg`](./web/public/architecture.svg) — modelo
de 4 capas (identidad / compliance / trading / monitoreo).

---

## 1 · Tesis en una línea

Tessera es un mercado secundario sobre Avalanche que junta **equity privado
de Latinoamérica** y **equity público de Estados Unidos** en el mismo
orderbook, con una sola identidad ERC-3643 atestada on-chain. Una
verificación KYC sirve a los dos universos; el compliance vive dentro del
bytecode del token, no en un PDF.

---

## 2 · Lo que el usuario puede hacer hoy

Las **cinco operaciones del happy path** del demo, en orden cronológico:

| # | Acción del usuario | URL | Resultado |
|---|---|---|---|
| 01 | Conectar wallet | `/` | Address + chain visibles en el header. KYC pill "pendiente" si la wallet no está atestada. |
| 02 | Verificar identidad | `/kyc` | 3 pasos (datos → documento → firma on-chain). Resultado: address atestada en `IdentityRegistry` en Fuji. Una sola vez. |
| 03 | Browse mercado privado | `/private` → `/private/trade/[token]` | Ve 4 tickers LatAm tokenizados (KVK · BTS · CLP · ARK1) con orderbook, gráfico de 30 días, y botón de compra/venta. |
| 04 | Browse mercado público | `/public` → `/public/trade/[symbol]` | Misma vista para 6 acciones US (AAPL · MSFT · NVDA · GOOGL · AMZN · META). Precios live del sandbox de Dinari. |
| 05 | Colocar orden | en cualquier `/trade/...` | `placeOrder()` on-chain. Settlement en USDC en ~3s. Aparece en el orderbook compartido. |
| 06 | Ver portfolio | `/portfolio` | Holdings de ambos universos en una sola tabla. Balance USDC. |
| 07 | Ver reportes regulatorios | `/admin/reports` | Demo: 11 reportes mock LFPIORPI/UIAF/UIF/IVE con banner "DEMO". Live: data real de Wavy Node cuando llegue la API key. |

Surfaces de apoyo: `/compliance` (one-pager regulatorio explicando ERC-3643
y flujo de issuer), `/kyc` con risk badge en header (Wavy Node).

---

## 3 · Cómo funciona, paso por paso

### 3.1 · Conectar wallet (instantáneo)

- **Frontend**: `RainbowKit` + `wagmi v2` + `viem v2` en `web/app/providers.tsx`.
- **Wallets soportadas**: Core (preferida en Avalanche), MetaMask,
  WalletConnect, Rainbow.
- **Lo que pasa**: `useAccount()` expone `address` y `chainId`. El header
  lee `IdentityRegistry.isVerified(address)` y `MockUSDC.balanceOf(address)`
  vía `useReadContract` para pintar el KYC pill + balance USDC.

### 3.2 · Verificar KYC (~3 segundos on-chain)

- **Frontend**: `web/components/interior/kyc-page.tsx`. Stepper de 3 pasos:
  datos personales, documento, registro on-chain.
- **Server**: `web/app/api/kyc/verify/route.ts`. Recibe `{ wallet, country }`.
  Usa `KYC_ISSUER_PRIVATE_KEY` (server-only env) para firmar la transacción
  `IdentityRegistry.addIdentity(wallet, country)`. Espera el receipt y
  retorna `{ txHash, alreadyVerified }`.
- **Hook adicional**: Después del receipt, llama
  `wavy-client.registerAddress(wallet)` para añadir el address al monitoreo
  continuo. Idempotente; no bloquea KYC si Wavy está down.
- **On-chain**: `IdentityRegistry.addIdentity(addr, country)` en
  `0x4d698C6f9e68C1cf6e3095e994114A44d8F6Ea96`.

### 3.3 · Browse y trading (Private / Public · mismo orderbook)

- **Frontend**: `web/components/interior/markets-page.tsx` lista los tickers
  por universo. Click → `/private/trade/[token]` o `/public/trade/[symbol]`.
  `web/components/interior/trade-page.tsx` renderiza header con precio,
  gráfico (SVG custom), orderbook, y panel de trade.
- **Hooks**:
  - `use-orders.ts` → `Orderbook.getOrdersForToken(token)` para libro
  - `use-place-order.ts` → `Orderbook.placeOrder(token, isBuy, amount, price)`
  - `use-cancel-order.ts` → `Orderbook.cancelOrder(id)`
  - `use-live-price.ts` (Private) → midprice mock (`mock-companies.ts`)
  - `use-dinari-price.ts` (Public) → fetch `/api/dinari/stocks/[id]/price`
- **Server-only (Public)**: `web/lib/dinari-client.ts` llama al sandbox de
  Dinari con `DINARI_API_KEY_ID` + `DINARI_API_SECRET` (nunca en el
  bundle del cliente). Reshape al boundary de la API route.
- **On-chain**:
  - `Orderbook.placeOrder()` valida balance + transfiere escrow (USDC para
    bid; SecurityToken para ask) al contrato.
  - `Orderbook.fillOrder(id)` (auto-llamado al match) ejecuta atómicamente.
  - `SecurityToken._update()` (override del ERC-20 de OZ v5) llama
    `IdentityRegistry.isVerified(to)` ANTES de mover balance. Si retorna
    `false`, la tx revierte en el bloque. Compliance enforced en bytecode.

### 3.4 · Portfolio (lectura agregada)

- **Frontend**: `web/components/interior/portfolio-page.tsx`.
- **Hook**: `use-user-balances.ts` hace multicall a los 10 SecurityTokens +
  MockUSDC. Renderiza en una sola tabla con dos columnas universo (PRIV /
  PUB) — sin pestañas, sin re-login.
- **No hay servidor en el camino**: lectura directa contra Fuji RPC vía wagmi.

### 3.5 · Reportes regulatorios

- **Frontend**: `web/app/admin/reports/page.tsx` server-component con
  switcher de país MX · CO · SV · GT y selector de periodo.
- **Server**: `web/app/api/compliance/reports/route.ts`. **Tres modos
  honestos**:
  1. `ok` — `WAVY_API_KEY` configurado → llama a `wavy-client.listReports()`,
     proxy server-only a `api.wavynode.com/v1/reports`.
  2. `demo` — sin key pero `WAVY_DEMO_MODE=true` → retorna 11 reportes mock
     de `web/lib/wavy-demo-data.ts` con flag `demo: true`. UI muestra
     banner inocultable "DATOS SINTÉTICOS".
  3. `not_configured` — sin key y sin flag → banner "integración lista,
     esperando key" con el comando exacto.

### 3.6 · Monitoreo continuo (background)

- Cada wallet atestada queda registrada en Wavy Node. El score se actualiza
  fuera del browser, en tiempo real.
- El badge "Riesgo · X" del header consume `/api/risk/scan?address=...`.
- Sin `WAVY_API_KEY`, el endpoint devuelve `503 not_configured` y el badge
  muestra "Riesgo · pendiente" (estado honesto, sin fabricar score).

---

## 4 · Stack técnico

### Contratos (Solidity 0.8.24 · OpenZeppelin v5 · Hardhat 2.28)

| Contrato | Address Fuji | Función |
|---|---|---|
| `MockUSDC` | `0xFaC00CC23F0b840A130A8Cb320d74FBBdcCf8dB6` | Stablecoin de prueba, 6 decimales |
| `IdentityRegistry` | `0x4d698C6f9e68C1cf6e3095e994114A44d8F6Ea96` | KYC claims atestados (`addIdentity`, `isVerified`, `removeIdentity`) |
| `Orderbook` | `0x830e07b0545461E279b0d24EB923937Ed4ECE042` | Limit orderbook compartido, 0.3% fee, pull-style escrow |
| `SecurityToken` × 10 | ver `contracts/deployments/fuji.json` | ERC-3643-inspired: `_update()` valida `IdentityRegistry.isVerified(to)` |

Tests: 8 unit tests pasando (`pnpm test`).

### Frontend (Next.js 14 App Router · TypeScript strict)

- Tailwind v3.4 + shadcn/ui v2.10
- `wagmi v2` + `viem v2` + `RainbowKit v2` para wallet + on-chain
- `@tanstack/react-query` para caching cross-cutting
- `framer-motion ^12.39` para tabs HowItWorks
- `lightweight-charts` reemplazado por SVG custom (más ligero)

### Server-side (Next API routes)

- `/api/kyc/verify` — firma claim + write on-chain + register Wavy
- `/api/risk/scan` — proxy Wavy Node scan-risk
- `/api/risk/register` — proxy Wavy Node addresses
- `/api/compliance/reports` — proxy Wavy Node reports (con demo-mode fallback)
- `/api/dinari/stocks` — proxy Dinari listado
- `/api/dinari/stocks/[id]/price` — proxy Dinari live price
- `/api/dinari/stocks/[id]/history` — proxy Dinari historical bars

Todos los API routes usan `import "server-only"` para garantizar que las
keys jamás se bundleen al cliente.

### Externos

- **Dinari sandbox** (`api-enterprise.sandbox.dinari.com`) — precios live
  de 6 stocks US. Key real configurada.
- **Avalanche Fuji RPC** (`api.avax-test.network/ext/bc/C/rpc`) — chainId
  43113.
- **Wavy Node API** (`api.wavynode.com/v1`) — risk + reportes. **Esperando
  API key del partner.**

---

## 5 · Qué está implementado vs mockeado vs pendiente

### ✓ Implementado y live en Fuji

- 4 contratos deployados + verificados, 10 SecurityTokens deployados, 50+ órdenes activas
- Compliance enforced on-chain (`_update` revierte transfers a wallets no atestadas)
- Wallet connect (3 wallets: Core / MetaMask / WalletConnect)
- 9 rutas frontend: `/`, `/private`, `/public`, `/private/trade/[token]`,
  `/public/trade/[symbol]`, `/portfolio`, `/kyc`, `/compliance`,
  `/admin/reports`
- KYC flow extremo a extremo (form → claim → write on-chain → atestación)
- Place / cancel orders con settlement on-chain real
- Portfolio leyendo balances reales
- Dinari sandbox integrado (precio + histórico real para 6 tickers)
- Risk badge en header con estado honesto cuando falta la key
- `/admin/reports` con 3 modos (ok / demo / not_configured)
- `/compliance` one-pager con marcos regulatorios reales (LFPIORPI, UIAF, etc.)
- Architecture SVG + Functional flow SVG
- Error boundaries (`app/error.tsx`, `app/global-error.tsx`)
- Pre-flight check script (`pnpm preflight:fuji`)
- Vercel deploy + preview por PR

### ◐ Mockeado / sandbox

- **KYC issuer** — la wallet deployer firma los claims (mock issuer). En
  producción se reemplaza por un servicio regulado (Persona, SumSub, Onfido)
  sin cambiar el contrato. Topología idéntica.
- **MockUSDC** — implementación ERC20 con `mint` público para que cualquier
  wallet pueda obtener saldo de prueba. En producción se reemplaza por USDC
  nativo de Circle en Avalanche.
- **Public universe settlement** — los precios vienen del sandbox real de
  Dinari pero el settlement vive en Fuji (sintético). En producción se
  conectaría al settlement nativo de Dinari cuando Dinari deploye en
  Avalanche (Q4 2026 esperado).
- **Datos de empresas privadas** — Kavak, Bitso, Banco Compartamos,
  Arkangeles Series C usan info pública de prensa. Sin scraping ni APIs.

### ○ Esperando key o pendiente

- **Wavy Node API key** — solicitada al partner. Sin la key:
  - `/api/risk/scan` retorna `503 not_configured`
  - Badge muestra "Riesgo · pendiente"
  - `/admin/reports` muestra banner "esperando key" o demo data si
    `WAVY_DEMO_MODE=true`
  - Una vez puesta la key, los 5 surfaces de Wavy se activan sin
    cambiar código (solo env var)
- **Auditoría de contratos** — pendiente. Tests pasando pero sin audit
  formal por Halborn / OpenZeppelin. Pre-requisito de mainnet, no de
  hackathon demo.
- **Mainnet deploy** — explícitamente fuera de scope. Demo en Fuji testnet.
- **CNBV sandbox** — conversación pendiente para Q3 2026 según roadmap.
- **Persona/SumSub real** — integración pendiente; mock issuer suficiente
  para demo del hackathon.
- **Dinari Avalanche nativo** — Dinari aún no deploya en Avalanche.
  Cuando lo hagan, el settlement del lado Public se vuelve nativo en vez
  de sintético.

---

## 6 · Limitaciones honestas a mencionar en Q&A

Si un juez pregunta "¿qué no funciona todavía?", la respuesta corta:

1. **Wavy Node corre en modo demo** (datos sintéticos) hasta que llegue la
   API key. La integración está cableada extremo a extremo —
   `WAVY_API_KEY=...` activa data real sin cambiar código.
2. **El issuer de KYC es el deployer**, no un proveedor regulado.
   Sustituir por Persona/SumSub es una semana de integración, no
   re-arquitectura.
3. **El settlement del lado Public es sintético en Fuji**, no nativo
   Dinari. Cuando Dinari deploye en Avalanche, se conecta directo.
4. **No hay audit formal** todavía. Tests passing pero sin Halborn/OZ
   review. Pre-req absoluto de mainnet.
5. **MockUSDC** en lugar de USDC nativo. Cambia con una sola variable de
   entorno cuando se migre.

Lo que **sí es real** en este demo:
- 4 contratos solidity reales en Fuji, no mocks
- Compliance enforced en el bytecode — un transfer a wallet sin KYC se
  revierte on-chain, visible en Snowtrace
- 50+ órdenes activas reales en el orderbook compartido
- Precios live reales de Dinari para 6 acciones US
- Settlement on-chain real en cada `placeOrder` (no hay state off-chain
  simulado)

---

## 7 · Comandos clave

```bash
# Verificar estado on-chain antes de cualquier demo
cd contracts && pnpm preflight:fuji

# Frontend dev local
cd web && pnpm dev
# → http://localhost:3500

# Re-deployar contratos (si es necesario)
cd contracts && pnpm deploy:fuji && pnpm seed:fuji && pnpm sync-env

# Activar Wavy demo-mode (para presentación sin API key)
echo "WAVY_DEMO_MODE=true" >> web/.env.local

# Render del submission video desde HyperFrames
cd tessera-demo && npx hyperframes render --quality standard
```

---

## 8 · Referencias

- **Repo**: https://github.com/odiseo159-beep/Tessera-Avax
- **Deploy live**: ver Vercel preview en cada PR
- **Pitch deck**:
  - [`PITCH.md`](./PITCH.md) — pitch para audiencia builder/VC
  - [`PITCH_LLW.md`](./PITCH_LLW.md) — pitch para Ledger Leaders Week (legal/compliance)
- **Demo video**: [`tessera-demo/tessera-demo.mp4`](./tessera-demo/tessera-demo.mp4) — 4 min, 1920×1080, narración Spanish TTS
- **Snowtrace**: ver contratos en `contracts/deployments/fuji.json`
- **Diagramas**:
  - [`web/public/functional-flow.svg`](./web/public/functional-flow.svg) — flujo funcional (este doc)
  - [`web/public/architecture.svg`](./web/public/architecture.svg) — stack en 4 capas
