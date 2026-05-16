# Design brief — Tessera

Pega este archivo entero como prompt al iniciar una sesión con el skill
`frontend-design` (o `design-taste-frontend`). Toda la funcionalidad ya
está construida y enchufada a contratos vivos en Avalanche Fuji + al
sandbox real de Dinari — tu trabajo es **rediseñar la UI** sobre esa base
sin tocar la capa de datos.

---

## 1 · El reto

Estamos a horas de entregar Tessera al **Hackathon LatAm Institucional de
Avalanche**. El jurado verá 50+ demos en sucesión. La nuestra tiene que
clavarse en su memoria en los **primeros 5 segundos** de pantalla
compartida. Tienes que hacer una UI que **vuelva físicamente imposible no
voltear a ver**.

Especialmente la **página de inicio** (`/`) — donde el usuario elige
entre los dos universos de activos — tiene que ser un momento "wow".
Interactiva, viva, con personalidad. No puede ser dos cards bonitas
estáticas. Tiene que sentirse como entrar a un terminal de Bloomberg
diseñado por Linear.

Lo demás del producto (trade view, portfolio, KYC) ya está construido
funcionalmente. Tu trabajo es elevarlo todo a calidad de producto fintech
institucional, pero **la landing es donde más peso visual debe caer**.

## 2 · Test de 5 segundos para el jurado

Cuando el jurado ve la landing por primera vez, en 5 segundos tiene que
poder responder estas tres preguntas sin ayuda:

1. **¿Qué es esto?** "Un marketplace que junta dos universos de activos."
2. **¿Es real?** "Sí — hay datos vivos, números corriendo, logos reales
   de Apple/NVIDIA y de Kavak/Bitso, links a Snowtrace."
3. **¿Quiero tocarlo?** "Sí — ese hover/animación/transición me obliga a
   probarlo yo."

Si tu landing pasa este test, ganamos. Si no, no.

## 3 · Producto en una pantalla

Tessera es una plataforma dual sobre Avalanche Fuji:

- **Tessera Private** (`/private`) — equity privado latinoamericano. Cuatro
  empresas reales tokenizadas (Kavak, Bitso, Clip, SPV de Arkangeles)
  emitidas como SecurityTokens con compliance ERC-3643 enforced en
  `_update`. Orderbook on-chain con escrow.
- **Tessera Public** (`/public`) — equity público US, "powered by Dinari".
  Seis tickers mega-cap (AAPL, MSFT, NVDA, GOOGL, AMZN, META) con precios
  + historicals + metadata reales del sandbox de Dinari. El secundario
  corre sobre nuestro mismo orderbook on-chain con la misma KYC.

**El value prop diferenciador**: una sola verificación KYC en
`IdentityRegistry` desbloquea ambos universos. Verificas una vez,
operas en privado Y público sin re-onboard.

Lee [`README.md`](./README.md) (technical) y [`PITCH.md`](./PITCH.md)
(narrative + demo script) para más contexto.

## 4 · La landing (`/`) — el momento estelar

Esta es **la** página. Inviértele 60% del tiempo de diseño aquí.

### 4.1 Estructura obligatoria

La landing tiene que tener:

1. **Header** sticky con marca + nav + connect wallet (ya existe en
   `<SiteHeader>`, puedes refinarlo pero no quites elementos)
2. **Hero** — title + subtítulo + un primer reveal del dual-product
3. **Choose-your-market** — el momento de interacción central, dos
   universos vivos para elegir
4. **Prueba de vida** — datos reales corriendo (precios, # de órdenes,
   contratos en Snowtrace) que demuestren que no es vaporware
5. **Cómo funciona** — los 3 pasos del onboarding (conecta → KYC → opera)
6. **Footer** con créditos del hackathon (ya existe en `<SiteFooter>`)

### 4.2 Choose-your-market — la pieza interactiva central

**Hoy** son dos cards estáticas. **Tienen que volverse el corazón
interactivo de la landing**. Algunas direcciones obligatorias (puedes
combinarlas como prefieras, pero el resultado tiene que ser visiblemente
"vivo"):

- **Competencia visual entre ambas cards**: cuando el cursor entra a
  Private, Public se atenúa/desatura/se aleja sutilmente; y al revés. El
  usuario debe sentir que **está eligiendo**.
- **Datos vivos dentro de cada card**: dentro de Private muestra el
  precio real on-chain del último fill de KVK + cuántas órdenes activas
  hay; dentro de Public muestra el precio live de AAPL/NVDA viniendo de
  Dinari (cambia cada 30s). Esos números tienen que verse moverse en
  vivo durante la demo.
- **Color de hover**: Private = verde primary `#0F6E56`, Public = morado
  accent `#3C3489`. Cuando estás sobre una card, ese color sangra al
  borde / sombra / underline de manera sutil.
- **Cursor-follow gradient ligero** dentro de cada card al hover (no en
  todo el page, mata performance). Sutil, no neón.
- **Micro-tilt 3D** opcional (~3° max) según la posición del mouse en la
  card. Si lo haces, hardware accelerated (`transform: perspective(...)
  rotateX rotateY`), no JavaScript pesado.
- **Click no navega inmediato** — primero hace un cross-fade /
  morph-zoom de 200-300ms y después navega a `/private` o `/public`. El
  usuario debe sentir que "entra" a un universo, no que cambia de página.
- **Indicador de "ambos universos, una identidad"**: una línea o glow
  morado-verde que conecta sutilmente las dos cards y se intensifica al
  pasar el cursor por en medio. Refuerza visualmente el value prop sin
  necesitar texto.

### 4.3 Hero

- **Headline grande** (display 48-64) con stagger reveal palabra por
  palabra al primer paint (200ms entre palabras, total <1s).
- **Subtítulo de una sola línea** con la palabra clave (probablemente
  "una sola identidad" o "dos universos") resaltada en el morado accent.
- **Eyebrow** "Avalanche LatAm Institucional · Fuji testnet" en
  uppercase tracking-wide 11px — mismo patrón que ya usa el producto.
- **Sin imagen decorativa de stock**. Si necesitas una imagen, tiene que
  ser un screenshot real del trade view del producto, recortado o con
  treatment.

### 4.4 Ticker tape o prueba de vida

Antes del choose-your-market, OBLIGATORIAMENTE muestra una banda de datos
reales. Opciones:

- Una franja horizontal estilo Bloomberg con `KVK $18.00 +2.4%` ·
  `AAPL $299.85 -0.13%` · `NVDA $224.41 -0.4%` ... etc. Scroll horizontal
  lento o auto-rotate cada 4s. Datos reales de los hooks que ya existen
  (`useLivePrice` por compañía).
- O 4 stat tiles grandes: "10 tokens vivos en Fuji", "48 órdenes
  on-chain", "6 stocks US powered by Dinari", "$XX volumen sandbox".
- O ambas combinadas si el espacio lo permite.

El punto: que en los primeros 3 segundos el jurado vea **números
moviéndose**.

### 4.5 Microinteracciones obligatorias

- **Botones**: compress 1-2px al `:active`, no más.
- **Links**: underline animado de izquierda a derecha al hover (200ms),
  cambia de color al accent del universo correspondiente si aplica.
- **Page transition al entrar a `/private` o `/public`**: cross-fade
  rápido (200ms). Si puedes usar View Transitions API o Framer Motion
  layout animations, mejor.
- **Cards de empresa en los marketplaces**: hover eleva 4px + sombra
  sutil + el logo gira/escala ligeramente.
- **Toasts**: slide in desde top-right con bounce físico mínimo.

### 4.6 NO hacer

- No splash screens largos (>1.5s antes del primer paint).
- No carruseles auto-play que el usuario no pueda pausar.
- No video background (matan performance + accesibilidad).
- No 3D pesado (Three.js / R3F sobra para esto).
- No gradientes neón ni glow saturado. Toda saturación viene del
  morado/verde del brand a opacidad media.
- No emojis. Iconos solo de `lucide-react`.

## 5 · Resto de las páginas

Mismo nivel visual que la landing, pero el peso de interacción es menor.
Mantén las anatomías actuales — sólo súbeles el bar visual.

### 5.1 `/private` y `/public` — marketplaces

Ya tienen hero + 4 stats + grid de `<AssetCard>`. Para subir el nivel:

- Cada AssetCard al hover muestra un mini-sparkline del precio (puedes
  reutilizar `<PriceChart>` con altura 30px sin axes).
- Tag "On-chain" / "Dinari live" / "Mock" — hoy es texto chico, hazlo
  pill colorizado consistente con la marca.
- Logo: para Private usa el cuadrado de color (logoBg/logoColor); para
  Public usa el logo real de Dinari (ya descargado vía `next/image`).
  Trata las dos formas con el mismo tamaño y radio para que el grid se
  vea homogéneo.
- Diferencia visual entre Private y Public: Private = línea de acento
  verde en el border-top de cada card; Public = morado. Una pista mínima
  pero presente del universo.

### 5.2 `/private/trade/[token]` y `/public/trade/[symbol]` — trade view

La página estrella del producto. Anatomía actual:

1. Header del asset (logo + nombre + sector/ronda/país + AssetPriceCell +
   badges)
2. 4 stat tiles
3. PriceChart (mock 30d en private, Dinari historical en public)
4. TradeGrid (Orderbook izquierda 2fr + TradePanel derecha 1fr)

Mejoras esperadas:

- El asset header debe sentirse pesado, denso, monoespaciado en los
  números. Es el "ticker terminal" del producto.
- El precio en `<AssetPriceCell>` debe **pulsar/flash** muy sutilmente
  cuando cambie (`react-query` ya invalida cada 30s en Public). Usa una
  animación de border o de background opacity, no del texto.
- Orderbook: hoy las depth bars son rectángulos planos. Súbelas a un
  gradient muy sutil hacia el centro del row (de fuera hacia el spread).
  Spread row más prominente — quizás monoespaciada con altura mayor.
- TradePanel: el botón "Confirmar compra/venta" debe cambiar de color
  según el side (verde buy / rojo sell) con transición suave en el tab
  toggle.

### 5.3 `/portfolio`

Tres secciones (holdings, órdenes activas, historial). Hoy son tablas
shadcn nativas. Para subir nivel:

- Cada row del holdings con un mini-indicador del universo (línea
  vertical de 2px en el border-left, verde o morado).
- Para holdings con balance > 0, agregar un `<Sparkline>` chico al final
  del row (reutiliza la misma técnica que la AssetCard).
- El header del portfolio con el address del usuario debe tener un copy
  button micro-interactivo al hover.

### 5.4 `/kyc`

Stepper 3 pasos. Hoy es funcional pero plano. Para subir nivel:

- El chip stepper arriba con animación de fill cuando avanzas (los chips
  inactivos a activos se llenan con un easing).
- Cross-fade entre pasos en lugar de reemplazo brusco.
- Success state: confetti **muy sutil** (1-2s, no más) con la paleta de
  marca al confirmar el KYC. O un check mark que se dibuja a mano (200ms
  SVG path animation) si confetti es too much.

### 5.5 `/not-found`

Solo asegúrate que matchee el resto del lenguaje visual. Ya es funcional.

## 6 · Brand direction

### Paleta — ya en `web/app/globals.css` como HSL CSS vars. Respétala.

| Token            | Hex       | Uso                                                                          |
| ---------------- | --------- | ---------------------------------------------------------------------------- |
| `--background`   | `#F1EFE8` | Fondo cálido off-white. Bases de página.                                     |
| `--card`         | `#FFFFFF` | Cards, modales, panels.                                                      |
| `--primary`      | `#0F6E56` | Universo **Private** + CTAs positivos / buy. Único color "fuerte" del lado private. |
| `--accent`       | `#3C3489` | Universo **Public** + acentos institucionales.                               |
| `--destructive`  | `#C03737` | Errores, sell, decay.                                                        |
| `--secondary`    | `#D3D1C7` | Borders cálidos, dividers.                                                   |
| `--muted`        | `~#E6E2D6`| Hover backgrounds, secondary surfaces.                                       |
| `--foreground`   | `#1A1D21` | Texto principal.                                                             |

Los logos de empresa privada ya tienen sus paletas custom en
`lib/mock-companies.ts` (KVK naranja, BTS verde, CLP rojo, ARK1 morado).
Los logos de Public vienen reales de Dinari (`dinariLogoUrl`).

### Tipografía

**Inter** desde `next/font/google` (ya configurada como `--font-inter`).

- Display (h1 landing): 40-64, semibold, tracking tight, line-height
  tight (1.05-1.1).
- Section title: 18-24, semibold.
- Body: 14, regular, line-height 1.5.
- Numérico: SIEMPRE `tabular-nums`. Considera Inter en su variante con
  features `cv01` y `cv11` para una vibe más institucional.
- Mono (`font-mono`): solo para addresses y tx hashes.

**Sentence case en TODO** — nunca Title Case, nunca ALL CAPS salvo
eyebrows de section (uppercase tracking-wide 0.18em, 11px).

### Motion philosophy

- **Easing default**: `cubic-bezier(0.32, 0.72, 0, 1)` (cinemático,
  decelera bonito).
- **Duración default**: 180-220ms para microinteracciones, 300-400ms para
  page-level transitions.
- **Hardware accelerated**: solo `transform` y `opacity`. Cero animaciones
  de `width`/`height`/`top`/`left`.
- **Entrance staggers**: 60-90ms entre elementos hermanos al revelar.
- **Sin loops infinitos** salvo el ticker tape (y ese a muy baja
  velocidad).

### Bordes y radios

- Border 0.5-1px con `border-border/60` o `border-border/40`.
- Radius `--radius` (8px) en todo. Cards principales pueden ir 12px para
  destacar.
- Sombras: `shadow-sm` o `shadow-md` max. Cero `shadow-xl`/`shadow-2xl`.

## 7 · Componentes a redibujar (sin tocar lógica)

Todos viven en [`web/components/`](./web/components). Mantén las
interfaces de props — el sistema de datos depende de ellas.

| Componente                                                                                  | Lo que puedes tocar                                                              |
| ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| [`site-header.tsx`](./web/components/site-header.tsx)                                       | Estética del brand mark, hover de nav, KYC pill states (mantén los 5 estados)    |
| [`site-footer.tsx`](./web/components/site-footer.tsx)                                       | Layout y copy fino                                                               |
| [`asset-card.tsx`](./web/components/asset-card.tsx)                                         | Visual completo. La función `LogoMark` ya distingue Private vs Public.           |
| [`asset-price-cell.tsx`](./web/components/asset-price-cell.tsx)                             | Pulse al cambiar de precio (nuevo)                                               |
| [`price-chart.tsx`](./web/components/price-chart.tsx)                                       | Colores, grid, crosshair. NO la API `addSeries(LineSeries, …)` de v5.            |
| [`dinari-chart.tsx`](./web/components/dinari-chart.tsx)                                     | Loading + error states del wrapper                                               |
| [`orderbook.tsx`](./web/components/orderbook.tsx)                                           | Visual de las depth bars, spread row, hover de filas                             |
| [`trade-panel.tsx`](./web/components/trade-panel.tsx)                                       | Toggle de tabs (verde/rojo), animación del botón submit                          |
| [`trade-grid.tsx`](./web/components/trade-grid.tsx)                                         | Layout en mobile vs desktop, animación cuando prefill llega del orderbook        |
| [`kyc-stepper.tsx`](./web/components/kyc-stepper.tsx)                                       | Transiciones entre pasos, success state                                          |
| [`portfolio-holdings.tsx`](./web/components/portfolio-holdings.tsx)                         | Visual de la tabla, sparkline opcional                                           |
| [`portfolio-orders.tsx`](./web/components/portfolio-orders.tsx)                             | Mismo                                                                            |
| [`portfolio-history.tsx`](./web/components/portfolio-history.tsx)                           | Mismo                                                                            |

## 8 · Capas que NO se tocan

- [`web/hooks/*`](./web/hooks) — todos los wagmi/dinari hooks
  (`useKycStatus`, `useLastPrice`, `useLivePrice`, `useDinariPrice`,
  `useDinariHistory`, `useOrders`, `usePlaceOrder`, `useCancelOrder`,
  `useMintUsdc`, `useUserBalances`, `useUserActiveOrders`,
  `useTradeHistory`).
- [`web/lib/dinari-client.ts`](./web/lib/dinari-client.ts) — server-only
  Dinari client. Las credenciales viven aquí.
- [`web/lib/*`](./web/lib) salvo helpers de formato (agregar uno si
  necesitas). Nada de tocar `contracts.ts`, `mock-orderbook.ts`,
  `mock-companies.ts`, `parse-error.ts`.
- [`web/lib/abis/*`](./web/lib/abis) — auto-generados, no tocar.
- [`web/app/api/*`](./web/app/api) — server routes (`/kyc/verify`,
  `/dinari/stocks`, `/dinari/stocks/[id]/price`,
  `/dinari/stocks/[id]/history`). NO tocar.
- [`web/app/providers.tsx`](./web/app/providers.tsx) — wagmi +
  RainbowKit + ReactQuery. Puedes ajustar `lightTheme()` props si quieres
  refinar el wallet modal.
- `contracts/` — todo el código Solidity, scripts, tests, deployments.
- `web/app/globals.css` — puedes **refinar tokens** pero **mantén los
  nombres** (`--background`, `--foreground`, `--primary`, etc.) porque
  los componentes de shadcn referencian estos exactos.

## 9 · Restricciones técnicas

- **Tailwind v3.4** (NO v4). El proyecto está pinneado.
- **shadcn/ui 2.10.0** (style new-york, base color neutral). Si necesitas
  un componente primitive nuevo: `npx --yes shadcn@2.10.0 add <name>`
  desde `web/`.
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

## 10 · Dependencias recomendadas (instálalas tú si te ayudan)

Estas no están en el proyecto pero son OK agregar para la animación:

- **`framer-motion`** — para layouts animations, page transitions,
  stagger entrances, hover effects con spring physics. **Recomendado
  fuertemente para la landing**.
- **`@formkit/auto-animate`** — drop-in para que listas (orderbook,
  portfolio tables) animen su mount/unmount sin configurar mucho.
- **`react-use-measure`** — útil si haces cursor-follow gradients o
  layout-dependent animations.

NO instales:
- Three.js, React Three Fiber (overkill).
- Lottie (assets pesados, mejor evitarlo).
- GSAP (caro y duplicado con Framer).

## 11 · Output esperado

Después de la sesión:

1. Las 5 páginas con un diseño visiblemente mejor; la landing
   especialmente debe sentirse interactiva al primer paint.
2. Los componentes presentacionales reescritos manteniendo sus
   interfaces de props.
3. `pnpm build` desde `web/` debe pasar sin errores TS ni nuevos
   warnings reales (los warnings preexistentes de
   `@react-native-async-storage` y `pino-pretty` ya están externalizados
   en `next.config.mjs`, ignóralos).
4. `pnpm dev` debe levantar en `http://localhost:3500` y la primera
   pantalla (`/`) debe pasar el test de 5 segundos (sección 2).
5. Sin emojis, sin Title Case, sin gradientes neón, sin sombras
   gigantes — mantén la disciplina del brand.

## 12 · Estado actual visual

Lo que hay hoy (punto de partida funcional, no de diseño):

- **`/`** landing: dos cards estáticas con un eyebrow, un h1, un
  subtítulo, un footer de 3 pasos. Compila y muestra los productos pero
  no tiene movimiento ni cursor-follow ni datos vivos. **Este es el
  archivo que más te toca**.
- **`/private`**: marketplace con hero, 4 stat tiles, grid de 4
  AssetCards (KVK/BTS/CLP/ARK1). Los precios son on-chain o mock midprice
  según haya fills.
- **`/public`**: marketplace con hero, 4 stat tiles, grid de 6 AssetCards
  (AAPL/MSFT/NVDA/GOOGL/AMZN/META). Los precios son LIVE desde Dinari.
- **`/private/trade/[token]`**: trade view completo con orderbook + price
  chart + trade panel. Funcional, lleva tiempo de cariño visual.
- **`/public/trade/[symbol]`**: igual estructura, con `<DinariChart>`
  que pinta 30d de historicals reales.
- **`/portfolio`**: 3 secciones (holdings, órdenes activas, history). Hoy
  son tablas planas.
- **`/kyc`**: stepper de 3 pasos. Funcional y limpio pero sin
  transiciones.

## 13 · Inspiración concreta

- **Linear.app** — landing fría, denso, sentence case religioso, motion
  invisible pero presente. **El modelo principal a seguir para la
  landing**.
- **Stripe.com** — eyebrows uppercase tracking-wide, cards con bordes
  cálidos 0.5px, stats grid de 4, gradients muy contenidos.
- **Robinhood Web** — densidad balanceada en el trade view, tabular nums,
  charts limpios.
- **Bloomberg Terminal** — el feel del ticker tape, la densidad de
  información sin sacrificar legibilidad.
- **Tome y Pitch** — el tipo de hover/tilt que queremos en las dos cards
  de elección.

Mira específicamente cómo Linear hace su hero — esa es la temperatura
emocional que queremos para Tessera.

## 14 · Cómo arrancar

1. Lee los 4 archivos clave: este, [`README.md`](./README.md),
   [`PITCH.md`](./PITCH.md), [`CLAUDE.md`](./CLAUDE.md).
2. Inspecciona los hooks y libs en `web/hooks/` y `web/lib/` (NO los
   modifiques) para entender qué datos están disponibles.
3. Arranca el dev server: `cd web && pnpm dev` →
   http://localhost:3500. Conecta tu wallet, completa KYC, mintea USDC,
   coloca una orden — siente el producto antes de rediseñar.
4. Crea un git branch `design/<tu-iteración>` para no contaminar master.
5. **Empieza por `app/page.tsx`** (la landing). Considéralo terminado
   solamente cuando alguien que vea la pantalla por 5 segundos sin más
   contexto pueda responder las 3 preguntas de la sección 2.
6. Después de la landing, ataca `/private/trade/[token]` y
   `/public/trade/[symbol]` — son las páginas que el jurado va a ver
   durante la demo.
7. Cierra cada página con: validar render en preview + screenshot real
   + `pnpm build` limpio.
8. Documenta en el commit message qué patrones interactivos usaste, para
   que el equipo entienda las decisiones después de la entrega.

Buen viaje. El jurado nos va a recordar por la landing — hazla
imposible de olvidar.
