# Pitch deck + demo script — EquityAccess

Material listo para grabar el video de 2 minutos y armar el deck en
Tome / Pitch / Google Slides en menos de 30 minutos.

---

## Slide outline (8 láminas)

### 1 · Hero
**Visual**: nombre + logo a la izquierda, screenshot grande de la trading view a
la derecha. Fondo `#F1EFE8`.

> **EquityAccess**
>
> El Nasdaq de las empresas privadas en LatAm.
>
> Inversionistas atrapados en rondas pueden salir en 60 segundos. Empresas dan
> liquidez a empleados sin tender offer caro.

---

### 2 · El problema
**Visual**: 3 columnas de cifras, fondo blanco. Si encuentras una foto de un
inversionista latino (LinkedIn / press), úsala discreta a la derecha.

> ~2,400 startups LatAm en Series A–C sin liquidez secundaria.
>
> 7–10 años atrapado entre la entrada y la salida.
>
> $50–200k USD y 3–6 meses para vender un secundario en SPV con abogados.

---

### 3 · La solución
**Visual**: tres pasos en una línea cada uno. Iconos minimalistas (lucide).

> 1. Inversionista verifica su KYC una vez (queda atestado on-chain).
> 2. Compra fracciones de Kavak / Bitso / Clip / Arkangeles SPV en un orderbook on-chain.
> 3. Vende cuando quiera. Liquidez en 60 segundos vs 6 meses.

---

### 4 · Demo
**Visual**: screenshot grande del trading view (`/trade/kvk`) con el orderbook,
chart, y trade panel visibles. Si el video ya está, embed o QR al video.

> Live ahora en Avalanche Fuji. 24 órdenes activas en el orderbook.
>
> Conecta tu wallet y opera tú mismo: [`tu-deploy.vercel.app`](https://example.com)

---

### 5 · Arquitectura técnica
**Visual**: diagrama de 3 capas (re-dibujar el mermaid del README en
excalidraw o como SVG nítido).

```
┌──────────────────────────────────────┐
│   Identity        IdentityRegistry   │
│   (KYC)           addIdentity        │
│                   isVerified         │
├──────────────────────────────────────┤
│   Compliance      SecurityToken      │
│   (per token)     _update hook       │
│                   ERC-3643 inspired  │
├──────────────────────────────────────┤
│   Trading         Orderbook          │
│                   placeOrder         │
│                   fillOrder (0.3%)   │
│                   cancelOrder        │
└──────────────────────────────────────┘
```

> Compliance enforced **dentro del token**, no en un proxy. Cada `transfer`
> consulta el registry. Modelo inspirado en ERC-3643 (Tokeny) y validado por
> BlackRock + Securitize en sus deals.

---

### 6 · Por qué Avalanche
**Visual**: 4 chips horizontales con logos de cada feature.

> - **L1 propia**: cada deal grande (Arkangeles, Kavak founders) puede tener
>   su propia subnet con compliance custom.
> - **eERC20** (encrypted ERC-20): privacy de holdings sin sacrificar
>   compliance.
> - **ICM** (Inter-Chain Messaging): un investor en C-Chain puede operar contra
>   un orderbook en una L1 sin bridges.
> - **Core Wallet**: la wallet nativa de Avalanche es la mejor UX para
>   institucionales latinoamericanos.

---

### 7 · Modelo de negocio
**Visual**: 3 líneas con el porcentaje + qué cubre.

> - **0.3% trading fee** sobre el volumen del orderbook (ya implementado en el
>   contrato, accumula a `feesAccrued`).
> - **1% listing fee** a las empresas que tokenizan una nueva ronda.
> - **KYC premium**: $0 para retail, $X/mes para family offices con
>   dashboards y reportes regulatorios.
>
> Sizing: si capturamos el 10% del mercado secundario LatAm proyectado a
> 2030 ($XB), el revenue anual recurring es $X M.

---

### 8 · Equipo + roadmap + CTA
**Visual**: foto del equipo + 3 hitos roadmap + un solo botón "Probar la demo".

> **Equipo**: Daniel (full stack, ex-X), [otros].
>
> **Roadmap 90 días**:
> - Pilot con 1 family office en CDMX (Q3 2026)
> - Integración Persona/SumSub para KYC real
> - Lanzar L1 propia con eERC20
>
> **CTA**: Pruébalo ahora en `tu-deploy.vercel.app` o escríbenos a
> daniel@equityaccess.lat para acceso al pilot.

---

## Demo script — 2 minutos

Graba con OBS o Loom. Una sola toma. Webcam abajo a la derecha (cabeza +
hombros). Voz directa, sin "uhm". Si te trabas, vuelve a empezar el tramo
desde la transición previa.

### 0:00 – 0:15 — Hook
> "Si invertiste en una startup LatAm en 2020, todavía estás esperando tu
> salida. Inversionistas atrapados 7 a 10 años, sin manera de monetizar
> hasta una IPO que puede no llegar. EquityAccess resuelve eso en 60
> segundos."

(Pantalla: `/` marketplace con las 4 empresas visibles.)

### 0:15 – 0:30 — Wallet + KYC sin
> "Conecto mi wallet de Avalanche Core. Como ven, mi badge dice 'KYC
> pendiente' — la wallet nueva no puede operar todavía."

(Click en ConnectButton → conecta Core. Apunta al pill rojo en la topbar.)

### 0:30 – 0:50 — KYC flow
> "Voy a /kyc. Tres pasos: nombre, documento, confirmación. El backend firma
> la transacción de `addIdentity` y mi address queda atestada en el
> IdentityRegistry on-chain. Listo, badge verde."

(Click en KYC pill → llena los 3 pasos rápido → confirmar → "Verificación
completa" → vuelve al marketplace, badge verde.)

### 0:50 – 1:20 — Marketplace + trading view
> "Marketplace muestra 4 empresas reales tokenizadas: Kavak, Bitso, Clip y
> un SPV de Arkangeles. Click en Kavak Premium. Esta es la vista que vende
> el producto: header con último precio on-chain, stats de market cap y
> volumen, price chart de 30 días, orderbook con bids verdes y asks rojos."

(Click en AssetCard de KVK → muestra trading view por 5 segundos completos.
Hover sobre el orderbook para mostrar las depth bars.)

### 1:20 – 1:40 — Place order
> "Voy a colocar una compra de 50 KVK a $17.85. El panel calcula fee y
> total en vivo. Confirmo — la wallet pide aprobación de USDC primero,
> luego placeOrder. En 5 segundos la orden aparece en el orderbook."

(Click en una fila de bids para prefill, ajusta cantidad a 50, click
"Confirmar compra" → aprueba en wallet → confirma orden → muestra el toast
de éxito → muestra la orden nueva en el orderbook.)

### 1:40 – 1:55 — Portfolio
> "Voy a /portfolio. Holdings actualizados — tengo USDC y la orden activa
> en la sección de abajo. Cuando se ejecute aparece en el historial con
> link a Snowtrace."

(Click en Portfolio en el header → scroll lento mostrando las 3 secciones.)

### 1:55 – 2:00 — Cierre
> "Inversionistas atrapados, ahora liberados. EquityAccess en Avalanche
> Fuji. Pruébalo tú mismo — link en la descripción."

(Volver a la home. Cortar.)

---

## Checklist pre-grabación

- [ ] Wallet conectada en Core con AVAX para gas (~0.05 AVAX)
- [ ] Wallet **sin verificar** todavía (para que el KYC flow se vea)
- [ ] `pnpm dev` corriendo en `localhost:3500`
- [ ] Browser en **modo incógnito** o limpia el localStorage para que el
      ConnectButton arranque desconectado
- [ ] Pantalla 1920×1080, browser zoom al 100%, dock/taskbar oculto
- [ ] Devtools cerrados, sin notificaciones del sistema
- [ ] OBS configurado a 1080p 30fps, mic con noise gate
- [ ] Si grabas en Mac: `Hide Menu Bar` activado
