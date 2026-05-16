# Design brief — EquityAccess

Pega este archivo entero como prompt al iniciar una sesión con el skill
`frontend-design` (o `design-taste-frontend`). Toda la funcionalidad ya está
construida y enchufada a contratos vivos en Avalanche Fuji — tu trabajo es
**redibujar la UI** sobre esa base sin tocar la capa de datos.

---

## 1 · Mission

Redibuja las 5 páginas del marketplace EquityAccess
([`D:\AVAX\web`](./web)) con calidad de producto fintech institucional. No
toques los hooks (`web/hooks/`), las libs (`web/lib/`), el deploy de
contratos, ni los archivos de ABIs. Edita las páginas y los componentes de
presentación. El resultado debe sentirse al nivel de
**Robinhood + Bloomberg Terminal + Linear**: denso pero respirable, sin
gradientes ni neón, tipografía precisa, micro-interacciones sutiles.

## 2 · Contexto del producto en una pantalla

EquityAccess es un marketplace secundario para equity privado tokenizado en
LatAm. Inversionistas verificados (KYC reusable on-chain) compran y venden
fracciones de empresas privadas (Kavak, Bitso, Clip, SPV de Arkangeles) vía
un orderbook on-chain con compliance enforced dentro del SecurityToken
(ERC-3643 simplificado). Las transferencias validan `IdentityRegistry.isVerified(to)`
en `_update`. Live en Avalanche Fuji, chainId 43113. El demo se entrega para
el Hackathon LatAm Institucional el 17 mayo 2026.

Lee [`README.md`](./README.md) y [`PITCH.md`](./PITCH.md) para más contexto
narrativo. El flujo end-to-end ya funciona: connect → KYC → mint USDC →
trade → portfolio.

## 3 · Brand direction

**Paleta** (ya en `web/app/globals.css` como HSL CSS vars — respétala):

| Token            | Hex       | Uso                                                     |
| ---------------- | --------- | ------------------------------------------------------- |
| `--background`   | `#F1EFE8` | Fondo cálido off-white. Bases de página.                |
| `--card`         | `#FFFFFF` | Cards, modales, panels.                                 |
| `--primary`      | `#0F6E56` | CTAs positivos, buy, accent verde. Único color "fuerte". |
| `--accent`       | `#3C3489` | Subrayados, charts secundarios, badges institucionales.  |
| `--destructive`  | `#C03737` | Errores, sell, decay.                                    |
| `--secondary`    | `#D3D1C7` | Borders cálidos, dividers.                              |
| `--muted`        | `~ #E6E2D6` | Hover backgrounds, secondary surfaces.                 |
| `--foreground`   | `#1A1D21` | Texto principal.                                         |

Logos de empresas usan paletas adjuntas en `lib/mock-companies.ts` (KVK
naranja, BTS verde, CLP rojo, ARK1 morado). NO uses gradientes, NO uses
sombras de >2dp, NO uses neón.

**Tipografía**: **Inter** desde `next/font/google` (ya configurada como
`--font-inter`). Tres escalas máximo: 12 / 14 / 24 con jumps muy claros para
display (h1 hero: 36–48, semibold, tracking tight). Tabular nums (`tabular-nums`)
en TODO número monetario. Mono solo para addresses (`font-mono`).

**Sentence case en TODO** — nunca Title Case, nunca ALL CAPS salvo eyebrows
de section (uppercase tracking-wide 0.18em, 11px).

**Sin emojis** en código ni UI.

**Bordes**: 0.5px (`border-border/60` o `border-border/40`). Radius `--radius`
8px en todo. Skeleton states con `bg-muted/50` y pulse sutil.

**Motion**: solo `transition-colors` y `transition-shadow`. Animaciones de
entrada `fade-in 200ms ease-out`. Hover en cards: leve `shadow-sm`.

**Spacing rhythm**: base 4. Padding interno cards 16-20. Gap entre secciones
24-32. Max-width container 1280 (`max-w-7xl`).

## 4 · Las 5 páginas

Estructura actual a redibujar. Mantén las rutas y los nombres de archivos.

### 4.1 `/` Marketplace ([`web/app/page.tsx`](./web/app/page.tsx))

**Anatomía actual**:
1. Eyebrow "Marketplace · Avalanche Fuji"
2. Hero h1 (2 líneas) + lead paragraph (2 líneas)
3. 4 stat cards: TVL, Empresas listadas, Volumen 24h, Inversionistas
4. Section title "Empresas listadas" + nota a la derecha
5. Grid de 4 `<AssetCard />` (símbolo, nombre, sector, último precio, change
   24h, badge país, tag "On-chain/Mock · ERC-3643", botón Trade)

**Objetivo**: que en 3 segundos quede claro qué es el producto y qué se
puede tradear. El hero ocupa max 30% de fold-1. Las 4 stats son el segundo
foco visual. Las cards de empresa son el tercero.

### 4.2 `/trade/[token]` Trading view ([`web/app/trade/[token]/page.tsx`](./web/app/trade/[token]/page.tsx))

**La página estrella del demo.** Anatomía actual:
1. Header del asset: logo 48px + nombre + (sector · ronda · país) +
   `<AssetPriceCell />` (precio + change + on-chain/mock tag) + badges
   (ERC-3643, KYC enforced, ticker)
2. 4 stats: market cap, volumen 24h, holders, default rate
3. `<PriceChart />` lightweight-charts v5, 30 puntos mock, fondo
   transparente, línea `#0F6E56` 2px
4. `<TradeGrid />` que pone `<Orderbook />` 2fr y `<TradePanel />` 1fr en
   desktop, stack en mobile

**Objetivo**: que se sienta como Bloomberg Terminal. Mucha información,
densa pero legible. Tabular nums en todo. Depth bars en el orderbook
proporcionales al amount. Click en row de orderbook → prellena el panel.

### 4.3 `/portfolio` ([`web/app/portfolio/page.tsx`](./web/app/portfolio/page.tsx))

**Anatomía**:
1. Header con address corta + botón "Completa tu KYC" cuando no esté verificado
2. `<PortfolioHoldings />` — tabla USDC + 4 SecurityTokens con cantidad,
   precio, valor, total. Botón "Mintea 10k USDC mock" en el header de la
   sección.
3. `<PortfolioOrders />` — tabla órdenes activas con botón Cancelar por row
4. `<PortfolioHistory />` — tabla OrderFilled events con role (maker/taker)
   + side + counterparty linkeado a Snowtrace

**Objetivo**: dashboard que un family office leería sin sentirse perdido.
Estados vacíos con CTA hacia donde sigue (ir al marketplace, completar KYC).

### 4.4 `/kyc` ([`web/app/kyc/page.tsx`](./web/app/kyc/page.tsx))

Stepper de 3 pasos vivo en `<KycStepper />`
([`web/components/kyc-stepper.tsx`](./web/components/kyc-stepper.tsx)).

1. **Paso 1**: nombre, email, país (`<Select>` con MX/CO/AR/BR/CL/PE/UY)
2. **Paso 2**: documento mock — `<input type="file">` que solo toggle un
   bool, no procesa el archivo
3. **Paso 3**: review + botón "Confirmar y verificar" → POST a
   `/api/kyc/verify` → success state con botón "Reclama 10k USDC mock" +
   link a Snowtrace

Cuando ya esté verificado, muestra empty state con check verde y CTA al
marketplace. Cuando no haya wallet, prompt para conectar.

**Objetivo**: el "magic moment" del demo. Diseño minimalista, paso visible
en el chip stepper arriba, transiciones suaves entre pasos.

### 4.5 `/not-found` ([`web/app/not-found.tsx`](./web/app/not-found.tsx))

404 branded con voz del producto. Botones para volver al marketplace o
portfolio. No tomes más de 1 fold.

## 5 · Componentes a redibujar (sin tocar lógica)

Todos viven en [`web/components/`](./web/components). Acepta los mismos
props (definidos en cada `interface`) — mantén el shape porque el resto del
sistema depende.

- [`site-header.tsx`](./web/components/site-header.tsx) — sticky topbar con
  brand mark "EA" 28px + EquityAccess wordmark, nav links Marketplace /
  Portfolio, KYC pill (5 estados: disconnected, unconfigured, loading,
  pending, verified), RainbowKit `<ConnectButton />`. Backdrop blur + border
  bottom.
- [`site-footer.tsx`](./web/components/site-footer.tsx) — footer pequeño
  con crédito hackathon + chainId.
- [`asset-card.tsx`](./web/components/asset-card.tsx) — card de empresa en
  el marketplace. 4 secciones: logo+nombre / descripción / precio+change /
  meta tag + Trade button.
- [`asset-price-cell.tsx`](./web/components/asset-price-cell.tsx) — display
  de precio + change para el header de la trade view. Lee `useLastPrice`.
- [`price-chart.tsx`](./web/components/price-chart.tsx) — wrapper
  lightweight-charts v5. NO cambies la API (`addSeries(LineSeries, …)`),
  sí puedes ajustar colores/grid/cursor.
- [`orderbook.tsx`](./web/components/orderbook.tsx) — 8 asks invertidas
  arriba (mejor ask abajo del bloque rojo), spread row, 8 bids abajo
  (mejor bid arriba del bloque verde), depth bars. Click row → callback.
- [`trade-panel.tsx`](./web/components/trade-panel.tsx) — tabs Comprar /
  Vender, inputs cantidad/precio, breakdown subtotal+fee+total, botón
  submit que dice exactamente por qué está disabled (state machine).
- [`trade-grid.tsx`](./web/components/trade-grid.tsx) — client wrapper que
  comparte el prefill state entre orderbook y panel. Solo es layout — el
  diseño grid puede cambiar.
- [`kyc-stepper.tsx`](./web/components/kyc-stepper.tsx) — los 3 pasos +
  success state. Toca todo el chrome menos el `fetch('/api/kyc/verify')`.
- [`portfolio-holdings.tsx`](./web/components/portfolio-holdings.tsx),
  [`portfolio-orders.tsx`](./web/components/portfolio-orders.tsx),
  [`portfolio-history.tsx`](./web/components/portfolio-history.tsx) — 3
  tablas independientes en `<section>`s con header propio.

## 6 · Capas que NO se tocan

- [`web/hooks/*`](./web/hooks) — todos los wagmi hooks (`useKycStatus`,
  `useLastPrice`, `useOrders`, `usePlaceOrder`, `useCancelOrder`,
  `useMintUsdc`, `useUserBalances`, `useUserActiveOrders`, `useTradeHistory`).
- [`web/lib/*`](./web/lib) salvo si necesitas agregar un helper de
  formato. Nada de cambiar `contracts.ts`, `mock-orderbook.ts`,
  `mock-companies.ts`, `parse-error.ts`.
- [`web/lib/abis/*`](./web/lib/abis) — auto-generados, no tocar.
- [`web/app/api/kyc/verify/route.ts`](./web/app/api/kyc/verify/route.ts) —
  server route que firma `addIdentity`. Lo dejas igual.
- [`web/app/providers.tsx`](./web/app/providers.tsx) — config de wagmi +
  RainbowKit + react-query. Puedes ajustar `lightTheme()` props si quieres
  refinar el wallet modal.
- `contracts/` — todo el código Solidity, scripts, tests, deployments.
- `web/app/globals.css` — puedes refinar tokens pero **mantén los nombres**
  porque los componentes de shadcn referencian estos exactos
  (`--background`, `--foreground`, `--primary`, etc.).

## 7 · Restricciones técnicas

- **Tailwind v3.4** (NO v4). El proyecto está pinneado.
- **shadcn/ui 2.10.0** (style new-york, base color neutral). Si necesitas
  un componente primitive nuevo: `npx --yes shadcn@2.10.0 add <name>` desde
  `web/`.
- **Next.js 14 App Router**. Server components por default; `'use client'`
  solo donde se necesite (cualquier componente que use wagmi hooks,
  state, refs).
- **TypeScript estricto**. Nunca `any`. Usa `unknown` y narrow.
- **`process.env.NEXT_PUBLIC_*` con claves literales** — el bundler no
  inlinea referencias dinámicas en el client bundle.
- **Imports absolutos con `@/`** (`@/components/...`, `@/lib/...`).
- **Strings de UI en español neutro**, identificadores y comentarios en
  inglés.
- **Sin frontend tests**. No introduzcas Vitest ni Playwright.

## 8 · Output esperado

Después de la sesión, los siguientes archivos deben compilar limpio
(`pnpm build` desde `web/`) y la app debe renderizar en `localhost:3500`:

- Las 5 páginas con un diseño visiblemente mejor (mide en términos de:
  jerarquía visual clara, densidad apropiada, motion sutil, paleta
  consistente).
- Los componentes de presentación reescritos manteniendo sus interfaces
  de props.
- Tokens de tema en `globals.css` ajustados si conviene, **sin renombrar**.
- Cualquier nuevo asset (SVG, ilustración) en `web/public/`.
- `pnpm build` debe pasar sin errores TS ni nuevos warnings de webpack
  reales (los warnings preexistentes de `@react-native-async-storage` y
  `pino-pretty` ya están externalizados en `next.config.mjs`, ignóralos).

## 9 · Estado actual visual

Las screenshots que sigue muestran el punto de partida (Tailwind v3 ya
genera correctamente):

- Marketplace `/`: hero + 4 stats + 4 cards de empresas en grid 2×2. Logo
  EA arriba a la izquierda, ConnectButton arriba a la derecha. Footer
  fino abajo.
- Trade view `/trade/kvk`: header con logo + nombre + precio + 3 badges,
  4 stats, chart de 30 días (línea verde), orderbook con depth bars
  rojas/verdes, panel Comprar/Vender abajo (en mobile) o a la derecha
  (en desktop).
- Portfolio `/portfolio`: 3 secciones apiladas (holdings, órdenes,
  historial), cada una un `<section>` con tabla shadcn.
- KYC `/kyc`: chip stepper de 3 pasos, formulario simple, success state
  con botones de acción.

Punto de partida funcional. Hay que llevarlo de "MVP que funciona" a
"producto que un partner institucional firmaría en la mesa".

## 10 · Inspiración concreta

Como referencia visual:

- **Robinhood Web** — densidad balanceada, tabular nums, charts limpios,
  paleta minimal con un solo accent fuerte.
- **Bloomberg Terminal** — densidad de información sin sacrificar
  legibilidad. Modos oscuros y claros igualmente legibles.
- **Linear** — sentence case religioso, micro-tipografía perfecta, motion
  invisible pero presente. Iconografía lucide-react.
- **Stripe Dashboard** — eyebrows uppercase tracking-wide, cards con
  bordes 0.5px cálidos, stats grid de 4.

## 11 · Cómo empezar

1. Lee los 4 archivos clave: este, `README.md`, `PITCH.md`, `CLAUDE.md`.
2. Inspecciona los componentes y hooks listados arriba para entender el
   contrato de datos.
3. Arranca el dev server: `cd web && pnpm dev` → http://localhost:3500
4. Crea un git branch `design/<tu-iteración>` para no contaminar master.
5. Trabaja primero la página `/trade/kvk` (la estrella del demo). Cuando
   esté lista, alinea el resto al mismo nivel visual.
6. Cierra cada página con: validar render en preview + screenshot +
   `pnpm build` limpio.

Buen viaje.
