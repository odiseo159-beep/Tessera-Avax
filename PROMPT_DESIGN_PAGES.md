# Design brief — Tessera, second pass (interior pages)

Pega este archivo entero como prompt al iniciar una sesión con el skill
`frontend-design` (o `design-taste-frontend`). Este brief es la **segunda
iteración** del diseño de Tessera — la primera ya entregó la landing y
está integrada. Tu trabajo ahora son las **5 páginas interiores**, al
mismo nivel visual de la landing.

---

## 1 · Contexto: la landing ya existe

La primera iteración entregó un landing prototype impresionante con:

- Header sticky con brand mark (dos cuadrados verde+morado), nav con dots
  de color, KYC pill con dot live, wallet button con address + USDC.
- Hero con headline en stagger reveal palabra-por-palabra ("Dos universos
  de activos. Una sola identidad on-chain.")
- Ticker tape horizontal con scroll continuo, datos de los 10 tickers
  con flash al cambiar.
- Choose-your-market: dos cards gigantes con cursor-follow glow,
  micro-tilt 3D, dim-on-other-hover, conector animado entre ambas que
  intensifica al pasar el cursor por el medio, transición universe-entry
  con overlay full-screen.
- Proof-of-life: 4 stat tiles con números actualizándose live.
- How-it-works: 3 pasos con eyebrow + metadata mono.
- Footer con marca + links + version line.

**Esa landing ya está integrada en `web/app/page.tsx` + `web/app/landing.css`
+ `web/components/landing/*`**. No la toques. Es la referencia visual
para que las otras 5 páginas se sientan parte del mismo producto.

Lee y absorbe el feel del landing antes de empezar:

- `web/app/page.tsx` — montaje
- `web/app/landing.css` — todo el design system del prototype (paleta,
  motion, sombras, shapes)
- `web/components/landing/*.tsx` — patrones de componente (cards,
  rows, hover, glow)
- `web/components/landing/landing-header.tsx` y `landing-footer.tsx` —
  la marca, KYC pill, wallet button, dots de nav

**No reuses estos componentes para las otras páginas** (su CSS está
scopeada a `.tessera-landing`). Reusa los patrones visuales (mismas
sombras, mismas escalas tipográficas, mismos cards, mismos hovers) pero
expresalos en el sistema Tailwind + shadcn que ya usa el resto del
producto.

---

## 2 · El reto

Las páginas interiores hoy se ven funcionales pero planas comparado con
la landing. Tu trabajo es subirlas al mismo bar. El jurado va a clickear
en una de las dos cards del landing y aterrizar en una página interior —
si esa página interior se ve básica, la magia de la landing se rompe.

Las 5 páginas a redibujar:

1. `/private` — marketplace de equity privado LatAm
2. `/public` — marketplace de equity público US (Dinari)
3. `/private/trade/[token]` — trading view privado
4. `/public/trade/[symbol]` — trading view público
5. `/portfolio` — dashboard de holdings + órdenes + historial
6. `/kyc` — stepper 3 pasos

La página estrella del demo es `/private/trade/kvk` y `/public/trade/aapl` —
es donde el jurado mira más tiempo. Inviértele cariño extra.

---

## 3 · Brand direction (igual que en la landing)

### Paleta — definida en `web/app/globals.css` como HSL vars

| Token            | Hex       | Uso                                                              |
| ---------------- | --------- | ---------------------------------------------------------------- |
| `--background`   | `#F1EFE8` | Fondo cálido off-white                                           |
| `--card`         | `#FFFFFF` | Cards, modales, panels                                           |
| `--primary`      | `#0F6E56` | Universo **Private** + CTAs positivos / buy                      |
| `--accent`       | `#3C3489` | Universo **Public**                                              |
| `--destructive`  | `#C03737` | Errores, sell                                                    |
| `--secondary`    | `#D3D1C7` | Borders cálidos                                                  |
| `--muted`        | `~#E6E2D6`| Hover backgrounds                                                |
| `--foreground`   | `#1A1D21` | Texto principal                                                  |

Los `--*-soft` y `--*-border` opacities están en `landing.css` —
puedes replicarlos en `globals.css` o en tu Tailwind config si los
necesitas globalmente.

### Tipografía

- Inter (ya configurado como `--font-inter`)
- Display: 32-48, semibold, tracking tight
- Section title: 18-24, semibold
- Body: 14, regular, line-height 1.5
- Numérico: SIEMPRE `tabular-nums`. Activa features `cv01`, `cv11`,
  `ss01` para el feel institucional (la landing ya lo hace).
- Mono: `JetBrains Mono` como primero (si quieres, agrégalo via
  `next/font/google`); fallback a system mono. Para addresses y tx hashes.

**Sentence case en TODO**, eyebrows uppercase tracking-wide 0.18em 11px,
sin emojis.

### Motion philosophy

- Default ease: `cubic-bezier(0.32, 0.72, 0, 1)` (cinematic decel)
- Duración: 180-220ms microinteracciones, 300-400ms page-level
- Solo `transform` + `opacity`. Cero `width`/`height`/`top`/`left`
- Stagger entre hermanos: 60-90ms
- Sin loops infinitos

### Bordes y sombras

- Border 1px con `border-border/60` o `border-border/40`
- Radius 8px estándar (`rounded-md`), 12px para cards principales
  (`rounded-xl`)
- Sombras tomadas del prototype:
  - `shadow-sm`: `0 1px 0 rgba(255,255,255,.6) inset, 0 1px 2px rgba(26,29,33,.04), 0 1px 1px rgba(26,29,33,.03)`
  - `shadow-card`: `0 1px 0 rgba(255,255,255,.7) inset, 0 1px 2px rgba(26,29,33,.04), 0 14px 30px -10px rgba(26,29,33,.10)`

  Puedes agregarlas a tu `tailwind.config.ts` como tokens custom.

---

## 4 · Las 6 páginas — anatomía + objetivos visuales

### 4.1 `/private` y `/public` — marketplaces

**Estructura actual** (mantén):
1. Hero pequeño con eyebrow + h1 + lede + 4 stat tiles
2. Section title "Empresas listadas" / "Tickers listados"
3. Grid de AssetCards (4 cards private, 6 cards public)

**Para subir el nivel**:
- Los AssetCards deben tener el mismo feel que las cards del
  `MarketCard` del landing: cursor-follow glow, hover lift, border-glow
  del color del universo. Más simples (sin tilt 3D, sin connector), pero
  con el mismo lenguaje.
- En hover, mostrar una row de mini-sparkline + última price (puedes
  reutilizar el componente `<Sparkline>` o uno gemelo).
- Diferencia clara private vs public: Private = línea de acento verde
  en el `border-top` de cada card; Public = morado.
- Header local del marketplace con paleta visual del prototype: eyebrow
  con dot, h1 con la misma escala que el hero del landing pero más
  compacta (32-36 en lugar de 48-64).
- Stat tiles consistentes con los de proof-of-life del landing (mismo
  monospace para el número grande, eyebrow con tag, sub-label gris).

### 4.2 `/private/trade/[token]` y `/public/trade/[symbol]` — trading view

**Esta es la página estrella del demo. Inviértele.**

Estructura actual:
1. Asset header (logo + nombre + sector/ronda/país + `<AssetPriceCell>` +
   badges)
2. 4 stat tiles
3. PriceChart (mock 30d en private, Dinari historical en public)
4. TradeGrid (Orderbook 2fr + TradePanel 1fr en desktop)

**Para subir el nivel**:

- **Asset header**: debe sentirse como un "ticker terminal" —
  monospaceado en los números, denso pero ordenado. Ojo, el logo de
  Private es un cuadrado coloreado con las iniciales, el de Public es
  el SVG real de Dinari — trátalos con el mismo tamaño y radio para que
  el grid no se vea inconsistente.
- **Price flash**: el precio en `<AssetPriceCell>` debe pulsar muy
  sutilmente cuando cambie (la query de Dinari invalida cada 30s en
  Public, el on-chain cuando hay fills). Usa un border-bottom o
  background opacity transition, no del texto.
- **Stats row**: cada tile con el mismo treatment de proof-of-life del
  landing (eyebrow chip con tag tipo "on-chain" / "Dinari" / "live").
- **PriceChart**: hoy es funcional. Puedes envolverlo en una card con
  más respiración, agregar un selector de timespan (1D / 1W / 1M / 1Y)
  en el lado público que llama a `useDinariHistory(stockId, timespan)`.
- **Orderbook**: hoy las depth bars son rectángulos planos. Súbelas con
  un gradient muy sutil hacia el centro del row (de fuera hacia el
  spread). Spread row más prominente — monoespaciado con altura un poco
  mayor, con el mismo "uo-meta mono" del UniverseTransition del landing.
- **TradePanel**: el botón "Confirmar" debe cambiar de color según el
  side con transición suave en el tab toggle. Más jerarquía en el total
  (fila grande con monospace).

### 4.3 `/portfolio`

Tres secciones apiladas (holdings, órdenes activas, historial). Cada
sección es un `<section>` con header propio.

**Para subir el nivel**:

- Cada row de holdings con un mini-indicador del universo (línea
  vertical de 2px en el border-left, verde o morado).
- Sparkline al final del row de holdings (deterministic, reutiliza el
  patrón).
- Header del portfolio con el address copy-able micro-interactivo al
  hover (icon de copy aparece, click copia + toast).
- Tabla de órdenes activas: badge de side (Buy verde / Sell rojo) con
  el mismo styling que el resto de badges del producto.
- Historial: link en counterparty a Snowtrace, hover effect en el row.
- Empty states con la misma voz del producto y CTA a donde sigue.

### 4.4 `/kyc`

Stepper 3 pasos (datos personales → documento → confirmación). Hoy
funcional, sin animación.

**Para subir el nivel**:

- Chip stepper arriba con fill animado cuando avanzas (chips inactivos
  → activos, easing del prototype).
- Cross-fade entre pasos en lugar de reemplazo brusco. ~250ms.
- Success state: un check verde que se dibuja a mano (200ms SVG path
  animation) en lugar de un icon estático. O confetti **muy sutil** (1-2
  partículas, 1s max) con paleta de marca.
- El botón "Reclama 10k USDC mock" debe sentirse como un reward — un
  glow del primary green al hover, easing del prototype.

### 4.5 `/not-found`

Ya está OK. Solo asegúrate que matche el resto del lenguaje visual
(tipografía, paleta, spacing). No tomes más de 1 fold.

---

## 5 · Componentes a redibujar (sin tocar lógica)

Todos en [`web/components/`](./web/components). Mantén las interfaces de
props — el sistema de datos depende de ellas.

| Componente                                                                 | Lo que puedes tocar                                              |
| -------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| [`site-header.tsx`](./web/components/site-header.tsx)                      | Visual completo. **Importante**: no-op en `/` (landing tiene su propio header) — mantén esa condición. Para las otras rutas, tráelo al nivel del landing-header. |
| [`site-footer.tsx`](./web/components/site-footer.tsx)                      | Mismo: no-op en `/`, redibuja para el resto.                     |
| [`asset-card.tsx`](./web/components/asset-card.tsx)                        | Visual completo. Aplica el lenguaje del MarketCard del landing.  |
| [`asset-price-cell.tsx`](./web/components/asset-price-cell.tsx)            | Pulse al cambiar precio (nuevo).                                 |
| [`price-chart.tsx`](./web/components/price-chart.tsx)                      | Colores del chart, grid, crosshair. NO la API de lightweight-charts v5. |
| [`dinari-chart.tsx`](./web/components/dinari-chart.tsx)                    | Loading + error states + opcional un selector de timespan.       |
| [`orderbook.tsx`](./web/components/orderbook.tsx)                          | Depth bars, spread row, hover de filas.                          |
| [`trade-panel.tsx`](./web/components/trade-panel.tsx)                      | Toggle tabs, animación submit button.                            |
| [`trade-grid.tsx`](./web/components/trade-grid.tsx)                        | Layout mobile vs desktop, prefill arrive animation.              |
| [`kyc-stepper.tsx`](./web/components/kyc-stepper.tsx)                      | Transiciones entre pasos, success state.                         |
| [`portfolio-holdings.tsx`](./web/components/portfolio-holdings.tsx)        | Tabla, sparkline, badges de universo.                            |
| [`portfolio-orders.tsx`](./web/components/portfolio-orders.tsx)            | Tabla, badges.                                                   |
| [`portfolio-history.tsx`](./web/components/portfolio-history.tsx)          | Tabla, link Snowtrace.                                           |

---

## 6 · Capas que NO se tocan

- **Toda la landing** — `web/app/page.tsx`, `web/app/landing.css`,
  `web/components/landing/*`. Ya está integrada al nivel deseado.
- [`web/hooks/*`](./web/hooks) — todos los wagmi/dinari hooks
  (`useKycStatus`, `useLastPrice`, `useLivePrice`, `useDinariPrice`,
  `useDinariHistory`, `useOrders`, `usePlaceOrder`, `useCancelOrder`,
  `useMintUsdc`, `useUserBalances`, `useUserActiveOrders`,
  `useTradeHistory`).
- [`web/lib/dinari-client.ts`](./web/lib/dinari-client.ts) — server-only
  Dinari client.
- [`web/lib/*`](./web/lib) salvo helpers de formato.
- [`web/lib/abis/*`](./web/lib/abis) — auto-generados.
- [`web/app/api/*`](./web/app/api) — server routes.
- [`web/app/providers.tsx`](./web/app/providers.tsx) — wagmi setup.
- `contracts/` — todo el código Solidity.
- `web/app/globals.css` — puedes refinar tokens pero **mantén los
  nombres** porque shadcn los referencia.

---

## 7 · Restricciones técnicas

- **Tailwind v3.4** (NO v4). El proyecto está pinneado.
- **shadcn/ui 2.10.0** (style new-york, base color neutral). Para
  componentes nuevos: `npx --yes shadcn@2.10.0 add <name>` desde `web/`.
- **Next.js 14 App Router**. Server components por default; `'use client'`
  solo donde haga falta (wagmi hooks, state, refs).
- **TypeScript estricto**. Sin `any`.
- **`process.env.NEXT_PUBLIC_*` con claves literales** — el bundler no
  inlinea referencias dinámicas en el client bundle.
- **Imports absolutos con `@/`**.
- **Strings de UI en español**, identificadores y comentarios en inglés.
- **Sin frontend tests**.

## 8 · Dependencias recomendadas (instálalas si te ayudan)

- **`framer-motion`** — layout animations, page transitions, stagger
  entrances, hover springs. Recomendado para las transiciones entre
  pasos del KYC y el flash de price.
- **`@formkit/auto-animate`** — drop-in para listas (orderbook,
  portfolio).

NO instales: Three.js / R3F (overkill), Lottie (pesado), GSAP
(duplicado con Framer).

## 9 · Output esperado

Después de la sesión:

1. Las **5 páginas interiores** con un diseño que matchee el bar de la
   landing.
2. Los componentes presentacionales reescritos manteniendo sus
   interfaces de props.
3. `pnpm build` desde `web/` debe pasar limpio.
4. `pnpm dev` en `localhost:3500`: navegar de la landing → click en
   Private/Public → aterrizar en `/private` o `/public` debe sentirse
   continuo. Misma marca, mismo lenguaje, sin "back to basic" después
   del landing.
5. Sin emojis, sin Title Case, sin gradientes neón, sin sombras
   gigantes.

## 10 · Estado actual visual

- **Landing (`/`)**: integrada con el prototype del primer pass.
  Compila y se ve bien. **Punto de referencia visual**.
- **Resto de las páginas**: funcionales, paleta brand aplicada, layout
  básico. **Punto de partida — hay que elevarlas**.

## 11 · Inspiración (igual que el primer brief)

- **Linear.app** — fría, densa, sentence case religioso, motion
  invisible pero presente.
- **Stripe.com** — eyebrows uppercase tracking-wide, cards con bordes
  cálidos 0.5px.
- **Robinhood Web** — densidad balanceada en el trade view, tabular
  nums.
- **Bloomberg Terminal** — densidad de información sin sacrificar
  legibilidad.

## 12 · Cómo arrancar

1. Lee los 4 docs clave: este, [`README.md`](./README.md),
   [`PITCH.md`](./PITCH.md), [`CLAUDE.md`](./CLAUDE.md). Y el primer
   brief [`PROMPT_DESIGN.md`](./PROMPT_DESIGN.md) para el lenguaje del
   landing.
2. Arranca el dev server: `cd web && pnpm dev` → http://localhost:3500.
   **Mira la landing primero**, conecta wallet, completa KYC, mintea
   USDC, coloca una orden. Siente el producto.
3. Crea un git branch `design/interior-pages` para no contaminar master.
4. **Empieza por `/private/trade/kvk` y `/public/trade/aapl`** — son las
   páginas que el jurado va a ver durante la demo, después de la
   landing.
5. Después: `/private`, `/public`, `/portfolio`, `/kyc`.
6. Cierra cada página con: validar render + `pnpm build` limpio.
7. Documenta en el commit message los patrones que reutilizaste del
   landing, para que el flujo visual sea coherente.

Buen viaje. La landing puso el bar — ahora levanta el resto del producto
al mismo nivel.
