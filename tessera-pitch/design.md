# Tessera · design system

## Palette

Background: `#F1EFE8` (cream warm)
Surface: `#FAF8F0` (paper white, for cards)
Foreground: `#1A1D21` (near-black)
Soft foreground: `#5C6066`
Faint foreground: `#9CA0A8`
Border: `#D3D1C7` (muted)
Muted block: `#E6E2D6`

Primary: `#0F6E56` (institutional green — Private universe accent)
Primary soft: `rgba(15, 110, 86, 0.10)`
Primary border: `rgba(15, 110, 86, 0.24)`

Accent: `#3C3489` (deep purple — Public universe accent)
Accent soft: `rgba(60, 52, 137, 0.10)`
Accent border: `rgba(60, 52, 137, 0.24)`

Destructive (sparingly): `#C03737`
Warning amber: `#D08816`

## Typography

Sans: `Inter`, fallback `-apple-system, BlinkMacSystemFont, Segoe UI`.
Mono: `JetBrains Mono`, fallback `ui-monospace, SFMono-Regular, Menlo`.

Display: 120px, 600 weight, letter-spacing -0.02em.
Heading: 60px, 600.
Body: 24px, 400, line-height 1.5.
Eyebrow: 14px, 500, uppercase, letter-spacing 0.2em.
Mono small: 18px, 500.

## Motion

Easing default: `power3.out` for entrances, `power2.in` for exits.
Spring for pills / chips: `stiffness: 500, damping: 36`.
Duration: 0.5–0.7s for hero entrances; 0.25–0.35s for chips and badges.
Stagger: 80–120ms across word-by-word headlines.

## Corner radius

8–12px on cards, 4px on small chips, 999px on pills.

## Density / spacing

Comfortable institutional density — 32–48px gap between major sections.
Padding 18–24px inside cards. 0.5px borders.

## Depth

Flat-leaning: subtle 1px borders + tiny drop shadow (0 2px 8px rgba(26,29,33,0.06)).
No glows, no neon, no big colored shadows.

## What NOT to do

- ❌ Gradients across full-screen backgrounds (use solid bg + localized accents)
- ❌ Heavy drop shadows or glow rings (kill the institutional feel)
- ❌ Neon / cyberpunk / DeFi-bro aesthetics
- ❌ Title Case in body copy (Spanish neutral, sentence case)
- ❌ ALL CAPS except for tiny eyebrow / mono chips
- ❌ Emojis anywhere
- ❌ More than 3 colors per scene
- ❌ Gradient text fills (use solid + subtle weight contrast)

## Brand voice (for narration)

Fintech-institutional. Calm authority. Spanish neutral, sentence case.
"Compliance enforced en el bytecode" — not "DeFi" or "Web3 nativo".
Refer to "Avalanche", "ERC-3643", "Wavy Node", "Dinari" by their proper names.
