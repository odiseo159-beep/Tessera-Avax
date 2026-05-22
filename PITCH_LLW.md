# Pitch — Ledger Leaders Week
### Tessera · Hackathon LatAm Institucional 2026

Audiencia: panel legal, compliance y regulatorio. Foco distinto al pitch
builder/VC en [PITCH.md](./PITCH.md): aquí el argumento es **"compliance
enforced en el bytecode"**, no "tokenizamos equity".

Tiempo total: **5 min pitch + 3 min Q&A**.

---

## Tesis en una línea

> Tessera es un mercado secundario para equity privado LatAm y equity
> público US, sobre Avalanche, con **compliance enforced dentro del token
> mismo** vía ERC-3643 — no en un proxy, no en un acuerdo, en el bytecode.

---

## Estructura del pitch (slide × slide)

### Slide 1 · Hook regulatorio (15s)

> "El equity privado tiene 10 años de iliquidez por una razón: no existe
> infraestructura de compliance que un regulador acepte. AMMs no
> cumplen; SPV secundarios fragmentan KYC; brokers retail no reportan
> a CNBV. Tessera resuelve eso poniendo compliance dentro del token."

**Visual**: logo Tessera + dos universos (Private LatAm · Public US)
unidos por un único token de identidad. Una sola línea de texto.

### Slide 2 · El gap (45s)

Dos columnas paralelas, en lenguaje regulatorio:

**Equity privado LatAm**
- Mercado secundario: SPV / tender offer / broker-dealer ad-hoc.
- KYC fragmentado: el inversionista re-onboarda cada deal.
- Sin audit trail unificado; reportes manuales a CNBV / UIAF.
- Tiempos: 3–6 meses, costos: $50–200k USD.

**Equity público US para retail LatAm**
- Brokers domésticos compran ADRs con comisión 1–2%, T+2.
- Sin reporting a CNBV de operaciones del retail mexicano en US equity.
- AML on-flow inexistente; el inversionista es black box para el regulador.

> Ambos mercados comparten el mismo defecto: **el compliance vive fuera
> del activo**. Cuando vive fuera, se puede saltar.

### Slide 3 · El stack de compliance (la lámina más fuerte — 90s)

```
┌──────────────────────────────────────────────────────────────┐
│  IDENTIDAD                                                   │
│  IdentityRegistry on-chain  ·  ERC-3643 attested            │
│  Una sola identidad sirve a los 10 tokens (4 Priv + 6 Pub)   │
├──────────────────────────────────────────────────────────────┤
│  ENFORCEMENT                                                  │
│  SecurityToken._update() llama IdentityRegistry.isVerified() │
│  Cada transferencia se valida on-chain. Sin proxy externo.   │
├──────────────────────────────────────────────────────────────┤
│  MONITOREO CONTINUO                                          │
│  Wavy Node → risk score real-time + reportes auto-generados │
│  Jurisdicciones: MX (LFPIORPI) · CO (UIAF) · SV (UIF) · GT (IVE)│
├──────────────────────────────────────────────────────────────┤
│  SETTLEMENT                                                  │
│  Orderbook on-chain · escrow pull-style · 0.3% fee          │
│  Mismo contrato sirve Private y Public                       │
└──────────────────────────────────────────────────────────────┘
```

> Comparativa con el estado del arte:
> - **ERC-3643** es el estándar que usan **Securitize** y **BlackRock BUIDL**.
>   No es ciencia ficción regulatoria, es lo que ya está en producción.
> - **Wavy Node** es nuestra capa CNBV / UIAF / UIF / IVE específica de
>   LatAm — el partner del hackathon, integración cableada extremo a
>   extremo (ver `/admin/reports` en el demo).

### Slide 4 · Demo live (120s)

Audiencia legal va a creer cuando vea reverts on-chain. El demo es:

**a. Compliance bites (30s)**
Conecto wallet **sin KYC** → intento `transfer()` desde la consola →
**la transacción revierte en el bytecode**. No es un gate UI, no es
una API que valida; es el propio `_update` del SecurityToken
preguntando a `IdentityRegistry.isVerified()`.

> Tagline: "Esto no se puede bypassear desde la UI porque el guard vive
> en el contrato."

**b. KYC + risk score (30s)**
Verifico KYC en `/kyc` → tx en Snowtrace → la wallet queda atestada en
IdentityRegistry → pill verde aparece en el header → risk score de
Wavy Node carga (modo demo activo).

**c. Dual-universe trading (30s)**
Voy a Private → pongo orden de compra de KVK · click. Voy a Public →
misma wallet, mismo KYC → pongo orden de NVDA. Mismo orderbook
contract sirve ambas operaciones.

**d. Reportes regulatorios (30s)**
Abro `/admin/reports` → 11 reportes auto-generados, 4 jurisdicciones,
formatos reales (SAT-AOR / UIAF-ROS / UIF / IVE-RTS). Banner inocultable
"DEMO" porque la API key real de Wavy aún no llega — la integración
ya está cableada de extremo a extremo.

### Slide 5 · Roadmap regulatorio 90 días (30s)

| Hito | Cuándo | Por qué importa |
|---|---|---|
| Sandbox CNBV (México) | Q3 2026 | Validación regulatoria local antes de prod |
| Persona / SumSub real KYC | Q3 2026 | Reemplaza el issuer mock por proveedor regulado |
| Halborn / OZ audit | Q4 2026 | Pre-prod de los 4 contratos |
| Pilot 1 fondo regulado CDMX | Q4 2026 | Live tx en mainnet con un AFORE / family office |

### Slide 6 · Ask + cierre (30s)

> "La pregunta no es si el equity privado se va a tokenizar. Es **quién
> lo va a hacer cumpliendo**. Tessera ya tiene la versión cero
> funcionando en Avalanche Fuji."

**Lo que pedimos al panel**:
- Las 2h de mentoría legal/compliance del premio LLW
- Conexión con el equipo de Startups de Oracle para evaluar créditos
- Si alguien tiene línea directa con el sandbox regulatorio de CNBV,
  esa es la palanca que más nos mueve

---

## Q&A prep — las 5 preguntas que van a hacer

### 1. "¿Qué framework regulatorio están cumpliendo, específicamente?"

ERC-3643 a nivel de protocolo (estándar Tokeny, en producción con
Securitize y BlackRock BUIDL). A nivel jurisdicción: **LFPIORPI**
(México, art. 17–19 sobre actividades vulnerables), **Resolución 314
de 2021** (Colombia, UIAF para PSAV), **Ley contra el Lavado** (El
Salvador, UIF), y **Ley contra el Lavado de Dinero u Otros Activos**
(Guatemala, IVE). Todas mapeadas a tipos de reporte específicos
(AOR / AOI / AOP / ROS / ROT / RTS) que Wavy Node auto-genera.

### 2. "¿Quién es la entidad legal que emite el security token?"

Honesto: Tessera **el protocolo** es la infraestructura. El emisor
legal es per-deal y enchufable:
- Para equity privado mexicano: estructuras CKD / FIBRA-E existentes
- Para equity colombiano: figuras de la Resolución 314
- Para US equity vía Dinari: Dinari es el broker-dealer registrado SEC,
  Tessera distribuye el wrapper tokenizado

En la versión 0 (demo del hackathon), el issuer es el deployer wallet
que firma claims de KYC. En producción ese rol pasa a un HSM bajo
multisig de un trustee fiduciario.

### 3. "¿Cómo manejan refresh de KYC y listas de sanciones?"

Wavy Node monitorea las wallets atestadas en tiempo real (no batch).
Cuando el risk score de una wallet excede un umbral o aparece en OFAC,
Wavy emite un webhook firmado a Tessera. El agente del IdentityRegistry
(servicio server-side bajo control del trustee) puede llamar
`removeIdentity(address)` y la wallet pierde permiso de transferir
**en el bloque siguiente**. Sin migración de contrato, sin freezar
fondos del usuario, sin tocar el token.

### 4. "¿Qué pasa si el emisor desaparece? ¿El inversionista queda
atrapado?"

El emisor desapareciendo es un caso de **continuidad de protocolo**, no
de bricking. Como el balance vive en el ERC20 estándar, el inversionista
mantiene su saldo independiente del emisor. El `IdentityRegistry` está
bajo un rol de `agent` que en producción es un multisig de un trustee
fiduciario, no del emisor — si el emisor se va, el trustee mantiene el
registry y los inversionistas siguen operando entre sí. La única vía a
fiat la provee el emisor en su rampa específica; eso sí se interrumpe,
pero el activo on-chain no se pierde.

### 5. "¿Por qué orderbook on-chain y no AMM, dado que es más caro y
menos eficiente?"

Tres razones, en orden de peso regulatorio:
1. **Los reguladores no aceptan AMMs para securities**. La SEC ha sido
   explícita (caso Uniswap, Howey aplicado a LP positions). Los AMMs
   diluyen price discovery, lo cual rompe el requisito de "fair pricing"
   de muchos frameworks regulatorios.
2. **MEV exposure**. AMMs son inherentemente vulnerables a
   sandwiching; un mercado de securities no puede tolerar eso desde un
   punto de vista de "best execution".
3. **Es lo que ya hace el state-of-the-art**. BlackRock, Securitize y
   Tokeny usan limit orderbooks. Si los actores serios ya eligieron este
   modelo, no es momento de innovar contra el regulador.

---

## Material de apoyo durante el pitch

- **Browser tab 1**: la landing de Tessera en producción (Vercel)
- **Browser tab 2**: `/admin/reports?country=MX` (la slide más fuerte
  para LLW)
- **Browser tab 3**: Snowtrace del Orderbook contract
- **Terminal abierto**: `pnpm preflight:fuji` corrido 5 min antes para
  confirmar que la demo wallet tiene gas + USDC

## Checklist mental — pre-pitch (T-15 min)

- [ ] Wallet conectada en Core con la cuenta del deployer
- [ ] `pnpm preflight:fuji` ejecutado, output all green
- [ ] `.env.local` con `WAVY_DEMO_MODE=true` (sin la API key real
      todavía)
- [ ] Browser zoom 100%, dock oculto, notificaciones silenciadas
- [ ] Una wallet **secundaria sin KYC** lista en MetaMask para
      demostrar el revert on-chain
- [ ] Backup: video grabado del demo en caso de falla del WiFi del venue

## Anti-patrones a evitar en este pitch

- ❌ Hablar de "tokenizar" sin enmarcar como infraestructura de compliance
- ❌ Usar "DeFi" — la audiencia legal asocia eso con casos como FTX / 3AC
- ❌ Comparar con CoinList o Polymath (caídos en desgracia regulatoria)
- ❌ Decir "el contrato es la ley" — los abogados levantan ceja
- ❌ Defender AMMs como alternativa "más moderna"
- ❌ Prometer mainnet timelines sin la auditoría firmada
