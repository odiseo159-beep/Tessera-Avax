# Plan de desarrollo EquityAccess — 24 horas

Tiempo total efectivo: ~22h con 2h de buffer. Cada fase tiene criterios de aceptación claros y un tiempo objetivo. Si una fase se desvía más del 50% del tiempo, simplificar o saltar lo opcional.

---

## Fase 0 — Setup (1h)

**Objetivo**: Repo inicializado con estructura, dependencias, "hello world" funcional en ambos lados.

**Tareas**
- [ ] Crear estructura `contracts/` y `web/` desde la raíz `equity-access/`
- [ ] Inicializar Hardhat en `contracts/` con TypeScript template
- [ ] Instalar OpenZeppelin v5 + dotenv en contracts
- [ ] Configurar `hardhat.config.ts` con red Fuji (chainId 43113, RPC desde env)
- [ ] Inicializar Next.js 14 en `web/` con TS + Tailwind v3 + App Router + import alias `@/`
- [ ] Inicializar shadcn/ui (`new-york` style, color base neutral)
- [ ] Añadir componentes shadcn base: button, input, card, dialog, tabs, badge, table, toast/sonner, skeleton, separator, select
- [ ] Instalar wagmi v2, viem, @rainbow-me/rainbowkit v2, @tanstack/react-query, lightweight-charts
- [ ] Crear `web/lib/wagmi.ts` con config para Fuji + Core Wallet + MetaMask
- [ ] Crear `web/app/providers.tsx` con WagmiProvider + RainbowKitProvider + QueryClientProvider
- [ ] Envolver `app/layout.tsx` con Providers
- [ ] Crear `app/page.tsx` mínimo con título + ConnectButton
- [ ] `.gitignore` correcto en raíz (incluye `.env`, `node_modules`, `deployments/*.json`)
- [ ] Crear `.env.example` en ambos folders
- [ ] Commit inicial

**Aceptación**
- `cd contracts && npx hardhat compile` se ejecuta sin error (aunque no haya contratos aún)
- `cd web && pnpm dev` levanta la app en localhost:3000 con el botón Connect Wallet funcional
- Conectar Core Wallet en Fuji funciona end-to-end

---

## Fase 1 — Smart contracts (4h)

**Objetivo**: Todos los contratos compilados, testeados y listos para deployar.

**Tareas**
- [ ] `IdentityRegistry.sol`
  - Mappings: `verified: address => bool`, `country: address => string`
  - `claimIssuer` con modifier `onlyClaimIssuer`
  - Funciones: `addIdentity`, `removeIdentity`, `isVerified`, `setClaimIssuer`
  - Events: `IdentityAdded`, `IdentityRemoved`
- [ ] `SecurityToken.sol`
  - Hereda ERC20 (OZ v5) + Ownable
  - Constructor: `name`, `symbol`, `identityRegistry`, `lockupEnd`, `totalSupply`, `companyName`, `sector`, `vintageRound`
  - Override `_update`: si transfer entre direcciones reales, requerir `isVerified(to)` y `block.timestamp >= lockupEnd`
  - Mintea totalSupply al deployer
- [ ] `MockUSDC.sol`
  - ERC20 con 6 decimales, función `mint(to, amount)` pública (para testnet)
- [ ] `Orderbook.sol`
  - Struct `Order`: id, maker, token, isBuy, amount, price, active
  - `placeOrder(token, isBuy, amount, price)` — escrowea activos, retorna id
  - `fillOrder(id)` — ejecuta el trade, cobra fee 0.3%
  - `cancelOrder(id)` — devuelve fondos al maker
  - `getOrder(id)` view
  - `getOrdersForToken(token)` view (limitado, opcional — mejor leer events)
  - Convención: price con 6 decimales (igual que USDC), token con 18 decimales, `totalUsdc = amount * price / 1e18`
  - Events: `OrderPlaced`, `OrderFilled`, `OrderCancelled`
- [ ] Tests en `contracts/test/`:
  - `IdentityRegistry.test.ts`: solo claimIssuer agrega, isVerified ok
  - `SecurityToken.test.ts`: transfer falla a no-verificado, ok a verificado, lockup respetado
  - `Orderbook.test.ts`: placeOrder + fillOrder happy path, cancel devuelve fondos, fee se cobra correctamente
- [ ] `scripts/deploy.ts` que deploye en este orden y guarde addresses en `deployments/fuji.json`:
  1. MockUSDC
  2. IdentityRegistry (deployer = claimIssuer)
  3. 4 SecurityTokens: KVK (Kavak), BTS (Bitso), CLP (Clip), ARK1 (Arkangeles deal)
  4. Orderbook

**Aceptación**
- `npx hardhat test` pasa todos los tests
- `npx hardhat compile` sin warnings

---

## Fase 2 — Deploy + seed (1.5h)

**Objetivo**: Contratos vivos en Fuji con datos realistas para que el frontend tenga algo que mostrar.

**Tareas**
- [ ] Fondear wallet de deploy con AVAX del faucet de Avalanche (https://core.app/tools/testnet-faucet/)
- [ ] Correr `npx hardhat run scripts/deploy.ts --network fuji`
- [ ] Copiar addresses a `web/.env.local`
- [ ] Crear `scripts/seed.ts`:
  - Generar 3 wallets de prueba con `ethers.Wallet.createRandom()`, fondearlas con AVAX desde la deployer
  - Guardar wallets en `deployments/test-wallets.json` (gitignored)
  - Verificar las 3 en IdentityRegistry
  - Mintear 100,000 MockUSDC a cada una
  - Transferir 1,000 tokens de cada SecurityToken a cada wallet
  - Approve del Orderbook desde cada wallet para tokens y USDC
  - Colocar 3 órdenes de compra y 3 de venta por cada token (precios alrededor de $10-$20)
- [ ] Correr el seed
- [ ] Verificar manualmente con un read call que `getOrder(0)` retorna data esperada
- [ ] Verificar contratos en Snowtrace (opcional, suma puntos en la entrega)

**Aceptación**
- `web/.env.local` tiene todas las addresses
- Los logs muestran que las 24 órdenes fueron colocadas exitosamente

---

## Fase 3 — Foundation del frontend (3h)

**Objetivo**: Layout, navegación, wallet connect, datos mock listos y conectados a chain.

**Tareas**
- [ ] Layout global (`app/layout.tsx`) con topbar: logo "EquityAccess", links a Marketplace/Portfolio, ConnectButton, badge de KYC status
- [ ] `lib/contracts.ts` con ABIs (importadas de los artifacts de Hardhat) y addresses tipados
- [ ] `lib/mock-companies.ts` con info estática de las 4 empresas:
  ```ts
  { symbol: 'KVK', name: 'Kavak Premium', sector: 'Mobility', round: 'Serie D', country: 'México', logoBg: '#FAECE7', logoColor: '#993C1D', description: '...' }
  ```
- [ ] Página `/` (marketplace):
  - Hero pequeño con stats agregados (TVL, # empresas, volumen 24h, # inversionistas)
  - Grid de `<AssetCard />` con las 4 empresas
  - Cada card muestra: logo + símbolo + nombre + sector + última price + change 24h (mockeado) + botón "Trade"
- [ ] Hook `useKycStatus(address)` que lee `IdentityRegistry.isVerified`
- [ ] Hook `useLastPrice(tokenAddress)` que lee el último OrderFilled event o el midprice del orderbook
- [ ] Loading skeletons y empty states

**Aceptación**
- Marketplace muestra las 4 empresas con datos reales del contrato
- Click en una card lleva a `/trade/[token]`
- Wallet connect funciona con Core y MetaMask
- Badge "KYC verificado" o "KYC pendiente" aparece según corresponda

---

## Fase 4 — KYC flow (2h)

**Objetivo**: Usuario completa KYC mock y queda verificado on-chain. Es el momento "magic" del demo.

**Tareas**
- [ ] Página `/kyc` con stepper de 3 pasos:
  1. **Datos personales**: nombre, email, país (select)
  2. **Documento**: upload de "ID" (mock — solo simula, no procesa el archivo)
  3. **Confirmación**: review + botón "Verificar"
- [ ] API route `/api/kyc/verify` que:
  - Recibe `{ wallet, country }` 
  - Usa `KYC_ISSUER_PRIVATE_KEY` (server-only) para mandar tx `IdentityRegistry.addIdentity(wallet, country)`
  - Retorna `{ txHash }`
- [ ] Tras éxito: confetti sutil o toast de success, redirige a marketplace, badge cambia a "KYC verificado"
- [ ] Middleware: si entras a `/trade/*` sin estar verificado, redirige a `/kyc`

**Aceptación**
- Wallet nueva sin verificar entra a `/kyc`, llena 3 pasos, ve confirmación de tx
- `useKycStatus()` retorna `true` después
- Una orden de compra contra un wallet NO verificado falla con mensaje claro

---

## Fase 5 — Trading view (4h)

**Esta es la página que va a vender el proyecto. Inviértele tiempo y cariño visual.**

**Objetivo**: La vista del mockup funcionando con datos reales.

**Tareas**
- [ ] `/trade/[token]` con layout vertical:
  1. Header del asset: logo, nombre, símbolo, sector/ronda/país, último precio + change 24h, badges (KYC, ERC-3643)
  2. Stats row con 4 métricas (market cap, volumen 24h, holders, default rate mock)
  3. `<PriceChart />` con `lightweight-charts` y 30 puntos mock (con variación realista)
  4. Grid 2 columnas: `<Orderbook />` a la izquierda, `<TradePanel />` a la derecha
- [ ] Componente `<Orderbook />`:
  - Lee orders activas del contrato (puede ser via `getOrder(0..N)` o reading events + estado local)
  - Agrupa por precio, muestra asks (rojos arriba), spread en el medio, bids (verdes abajo)
  - Click en una row prellena el panel de trade con ese precio
- [ ] Componente `<TradePanel />`:
  - Tabs Comprar / Vender
  - Inputs: cantidad, precio
  - Cálculo en vivo: subtotal, fee 0.3%, total
  - Botón "Confirmar orden" que:
    - Si es buy: aprueba USDC → llama `placeOrder(token, true, amount, price)`
    - Si es sell: aprueba SecurityToken → llama `placeOrder(token, false, amount, price)`
  - Toast de éxito con hash de tx + link a Snowtrace
  - Refetch del orderbook después

**Aceptación**
- Puedes colocar una orden y verla aparecer en el orderbook en <5s
- Otra wallet puede ver esa orden y rellenarla con `fillOrder`
- El "última price" del header se actualiza al precio del último fill
- Sentir premium: animaciones sutiles, fonts correctos, espaciado generoso

---

## Fase 6 — Portfolio + polish (3h)

**Objetivo**: Cerrar el loop visual y pulir todo lo que se va a demostrar en el video.

**Tareas**
- [ ] Página `/portfolio`:
  - Tabla de holdings: token (con logo), cantidad, precio actual, valor en USDC, % del cap table
  - Sección "Mis órdenes activas" con botón Cancelar (llama `cancelOrder`)
  - Tabla "Historial de trades" leyendo eventos `OrderFilled` filtrados por mi address (como maker o taker)
- [ ] Polish del marketplace:
  - Badges de sector con colores diferenciados
  - Indicador de cambio 24h en verde/rojo
  - Animación de hover en cards
- [ ] Polish del trading view:
  - Animación sutil cuando el precio cambia
  - Visual feedback en el botón mientras la tx está pending
- [ ] Loading skeletons en TODAS las páginas
- [ ] Estados vacíos con mensaje claro (ej: "No tienes holdings aún — ve al marketplace")
- [ ] Mensajes de error legibles (parsear errores comunes de viem)
- [ ] Favicon + meta tags + og:image (puede ser un screenshot)

**Aceptación**
- Cualquier persona que abre el sitio entiende qué es en 5 segundos
- No hay bugs en el happy path completo: KYC → marketplace → trade → portfolio
- Se ve premium

---

## Fase 7 — Pitch + entrega (3h)

**Objetivo**: Cumplir todos los requisitos del submission form.

**Tareas**
- [ ] `README.md` completo con:
  - Nombre + 1-liner + screenshot
  - Problema (con cifras)
  - Solución (cómo lo resolvemos)
  - Stack técnico
  - Tracks del hackathon cubiertos
  - Cómo correr local (4 comandos)
  - Demo video link
  - Addresses de contratos deployados en Fuji
- [ ] **Slides** (8 láminas — usar Tome, Pitch o Google Slides):
  1. Hero: nombre + 1-liner ("El Nasdaq de las empresas privadas en LatAm")
  2. Problema: 3 bullets con cifras + foto de un inversionista atrapado
  3. Solución: 3 pasos en 1 línea cada uno
  4. Demo (screenshot grande del trading view) 
  5. Arquitectura técnica: diagrama de 3 capas (Identity / Compliance / Trading)
  6. Por qué Avalanche: L1 propia + eERC20 + ICM + Core Wallet
  7. Modelo de negocio: 0.3% trading + 1% listing + premium KYC
  8. Equipo + roadmap + CTA
- [ ] Diagrama de arquitectura (excalidraw o mermaid)
- [ ] Grabar demo de 2 minutos siguiendo este guion:
  - 0:00–0:15 — Problema en 1 frase ("Inversionistas atrapados 7-10 años")
  - 0:15–0:30 — Conectar wallet, mostrar badge sin KYC
  - 0:30–0:50 — KYC flow rápido, badge cambia a verificado
  - 0:50–1:20 — Marketplace, click en Kavak, trading view aparece
  - 1:20–1:40 — Colocar orden, ver aparecer en orderbook, ejecutarla
  - 1:40–1:55 — Portfolio actualizado, holdings + historial
  - 1:55–2:00 — Cierre con tagline
- [ ] Subir demo a YouTube como unlisted
- [ ] Push final del repo a GitHub público
- [ ] Submit en https://build.avax.network/events/8a8ee2e9-d91d-4087-adba-c1221b72e407

**Aceptación**: Submission confirmada antes de las 9:00 AM CDMX del domingo 17 de mayo.

---

## Reglas de oro durante el hackathon

1. **Cada feature termina en demo.** Si no se puede demostrar en el video, no se construye.
2. **Mocks > integraciones reales.** El jurado evalúa visión, no servicios externos.
3. **UI > backend.** Una UI premium con mock smart logic gana a un backend perfecto con UI fea.
4. **Commit cada fase.** Si algo se rompe, rollback rápido.
5. **Si una tarea toma más del doble de lo estimado**, simplifica o salta.
6. **Última hora SOLO para grabar demo + submit.** No tocar código.
7. **Duerme 3 horas mínimo.** El pitch lo das despierto, no acabando un PR a las 8:55 AM.
