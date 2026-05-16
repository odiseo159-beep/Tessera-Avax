# Pitch deck + demo script — Tessera

Material listo para grabar el video de 2 minutos y armar el deck en
Tome / Pitch / Google Slides en menos de 30 minutos.

---

## Slide outline (8 láminas)

### 1 · Hero
**Visual**: nombre + logo (T morado en cuadro) a la izquierda, screenshot
grande de la landing page con las dos product cards a la derecha. Fondo
`#F1EFE8`.

> **Tessera**
>
> Una sola identidad. Dos universos de activos. Liquidez en 60 segundos.
>
> Equity privado LatAm y equity público US en un solo marketplace sobre
> Avalanche, con KYC reusable on-chain.

---

### 2 · El problema (lado dual)
**Visual**: dos columnas paralelas, una por problema.

> **Privado** — ~2,400 startups LatAm en Series A–C sin liquidez. 7–10 años
> atrapado. Vender en SPV: $50–200k USD y 3–6 meses.
>
> **Público** — un inversionista mexicano que quiere AAPL paga ~1.5% al
> broker, espera T+2, no opera fracciones < 1 acción, suma fricción FX.
>
> Ambos exigen onboarding KYC duplicado en plataformas distintas.

---

### 3 · La solución
**Visual**: tres pasos en una línea cada uno + diagrama mínimo.

> 1. Verificas KYC una vez en Tessera → tu wallet queda atestada on-chain.
> 2. Eliges universo: **Private** (Kavak / Bitso / Clip / SPV Arkangeles) o
>    **Public** (AAPL / MSFT / NVDA / GOOGL / AMZN / META, powered by Dinari).
> 3. Operas con el mismo orderbook + las mismas reglas de compliance.

---

### 4 · Demo
**Visual**: dos screenshots side-by-side — `/private/trade/kvk` y
`/public/trade/aapl`. Caption: "Mismo UX, dos universos."

> Live en Avalanche Fuji. **48 órdenes** activas en el orderbook (24
> private + 24 public). Conecta tu wallet y opera tú mismo:
> [`tu-deploy.vercel.app`](https://example.com)

---

### 5 · Arquitectura técnica
**Visual**: diagrama de 3 capas, marcando "shared" en cada capa que se
reutiliza entre private y public.

```
┌──────────────────────────────────────────────┐
│ Identity (shared)    IdentityRegistry        │
│                      addIdentity / isVerified│
├──────────────────────────────────────────────┤
│ Compliance (per token) SecurityToken (10x)   │
│                        _update hook ERC-3643 │
├──────────────────────────────────────────────┤
│ Trading (shared)     Orderbook · 0.3% fee    │
│                      escrow pull-style       │
├──────────────────────────────────────────────┤
│ Data layer           Private: on-chain only  │
│                      Public: Dinari API +    │
│                              on-chain orderbook│
└──────────────────────────────────────────────┘
```

> Compliance enforced **dentro del token**, no en un proxy. La misma
> IdentityRegistry sirve a los 10 tokens — KYC reusable es el value prop
> diferenciador.

---

### 6 · Por qué Dinari + Avalanche
**Visual**: dos logos arriba (Dinari + Avalanche), tres bullets debajo.

> - **Dinari** ya tokeniza ~100 acciones públicas US con cumplimiento SEC
>   y bridge con un broker real (Alpaca). Tessera proporciona la **capa
>   secundaria** que les falta para LatAm — surface, KYC institucional,
>   orderbook en Avalanche.
> - **Avalanche** ofrece L1 propia (cada deal grande puede tener su
>   subnet), **eERC20** (privacy de holdings), **ICM** (cross-L1) y **Core
>   Wallet** (UX top para institucionales LatAm).
> - **Juntos**: Dinari emite, Tessera distribuye con compliance LatAm,
>   Avalanche provee la rail. Stack completo para una bolsa privada
>   regional.

---

### 7 · Modelo de negocio
**Visual**: 3 fuentes de revenue, tabla simple.

> - **0.3% trading fee** sobre el volumen del orderbook (ya implementado;
>   accumula a `feesAccrued`).
> - **1% listing fee** a empresas que tokenizan una nueva ronda en el
>   lado privado.
> - **Rev-share con Dinari** sobre orders ejecutadas en el lado público.
> - **Premium tier** para family offices: dashboard, reportes regulatorios,
>   white-label compliance.
>
> Sizing: si capturamos 10% del mercado secundario LatAm + 5% del flujo
> retail LatAm hacia US equities a 2030, el revenue anual es **$XX M
> recurring**.

---

### 8 · Equipo + roadmap + CTA
**Visual**: foto del equipo + 3 hitos roadmap + un botón "Probar la demo".

> **Equipo**: Daniel (full stack, ex-X), [otros].
>
> **Roadmap 90 días**:
> - Pilot con 1 family office en CDMX (Q3 2026)
> - Persona/SumSub para KYC real
> - Migración public side a Dinari nativo cuando ship a Avalanche
>
> **CTA**: Pruébalo en `tu-deploy.vercel.app` o escríbenos a
> daniel@tessera.lat para acceso al pilot.

---

## Demo script — 2 minutos

Graba con OBS o Loom. Una toma. Webcam abajo a la derecha. Voz directa, sin
"uhm".

### 0:00 – 0:15 — Hook
> "Si invertiste en Kavak en 2020, todavía estás esperando salir. Si vives
> en México y quieres exposure a NVIDIA, pagas comisión del broker y
> esperas T+2. Tessera resuelve ambos en el mismo marketplace, con la
> misma verificación KYC."

(Pantalla: landing `/` con las dos product cards visibles.)

### 0:15 – 0:30 — Wallet + KYC
> "Conecto mi wallet de Avalanche Core. Badge dice 'KYC pendiente'.
> Tres pasos en /kyc y mi address queda atestada en el IdentityRegistry
> on-chain. Listo, badge verde."

(Click ConnectButton → conecta → KYC pill → llena los 3 pasos → success.)

### 0:30 – 0:50 — Lado privado
> "Voy a Private. Cuatro empresas reales LatAm tokenizadas. Click en
> Kavak. Header, stats, chart de 30 días, y un orderbook con seis órdenes
> on-chain. Coloco una compra de 50 KVK a $17.85."

(Click Private en topbar → marketplace → click Kavak → trade view →
muestra orderbook por 3 seg → coloca orden → toast.)

### 0:50 – 1:15 — Lado público (Dinari)
> "Ahora voy a Public. Estos son seis tickers US — Apple, Microsoft,
> NVIDIA, Google, Amazon, Meta. Pero las descripciones y los precios
> son reales — vienen directo del sandbox de Dinari. Click en NVIDIA.
> El header tiene el precio live de Dinari, el chart tiene 30 días de
> historicals reales, y el orderbook secundario corre sobre el mismo
> contrato en Avalanche que el lado privado."

(Click Public → muestra el grid de 6 cards con logos reales →
click NVDA → muestra el header con precio live → muestra el chart →
muestra el orderbook.)

### 1:15 – 1:40 — Place order público + ver settlement
> "Coloco una compra de NVDA a $223.50. Mismo flow que el privado —
> approve USDC, placeOrder. Cinco segundos después aparece en el
> orderbook on-chain. **La misma wallet, la misma KYC, ahora operó en
> dos universos distintos**. Eso es Tessera."

(Coloca orden en NVDA → confirma en wallet → toast success → muestra
orderbook actualizado.)

### 1:40 – 1:55 — Portfolio
> "Voy a Portfolio. Veo USDC + holdings de Kavak Y de NVIDIA en una
> sola tabla. Una sola cuenta, dos universos."

(Click Portfolio → muestra holdings de ambos productos en una tabla.)

### 1:55 – 2:00 — Cierre
> "Tessera: dual asset secondary market sobre Avalanche, powered by
> Dinari. Pruébalo — link en la descripción."

(Volver a la home. Cortar.)

---

## Checklist pre-grabación

- [ ] Wallet conectada en Core con AVAX para gas (~0.05 AVAX)
- [ ] Wallet **sin verificar** todavía (para que el KYC flow se vea)
- [ ] `pnpm dev` corriendo en `localhost:3500`
- [ ] Browser en **modo incógnito** o limpia el localStorage
- [ ] Pantalla 1920×1080, browser zoom al 100%, dock/taskbar oculto
- [ ] Devtools cerrados, sin notificaciones del sistema
- [ ] OBS configurado a 1080p 30fps, mic con noise gate
- [ ] Dinari credentials en `web/.env.local` para que los precios live
      funcionen durante la demo
