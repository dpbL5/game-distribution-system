# Design — PlayPort

Locked design system. Future design and coding work reads this file first; pages defer to it. Amend intentionally — this file and `tokens.css` are the rule.

## System

- Genre · playful (restrained consumer retail) + utilitarian workbench for admin
- Macrostructure · Catalogue for storefront and library · Workbench for administration
- Theme · custom — “console night, blue signal, loot amber”
- Axes · dark rails / geometric-sans / blue + amber
- Product tone · Steam-like information density and purchase focus, translated into a darker game-commerce surface language

## Brand palette

| Role | Hex | RGB | Usage |
| --- | --- | --- | --- |
| Night Navy | `#0B1220` | `rgb(11 18 32)` | Header, sidebar, hero panel and primary text |
| Cloud Paper | `#F5F7FB` | `rgb(245 247 251)` | App background and readable content surface |
| Console Blue | `#2563EB` | `rgb(37 99 235)` | Primary action, links and active state |
| Loot Amber | `#F5A524` | `rgb(245 165 36)` | Discounts, sale badges and promotional emphasis |

Semantic extensions: surface `#E7EEF7`, raised `#D7E3F0`, secondary ink `#334155`, muted `#52627A`, strong functional border `#7F93AC`, soft rule `#C8D4E2`, accent ink `#F5F7FB`, amber ink `#0B1220`, success `#20B486`, success surface `#D9F7E8`, warning `#A16207`, danger `#B42318`.

## Contrast contract

- Night Navy on Cloud Paper · `17.46:1`.
- Muted text on Cloud Paper · `5.78:1`; secondary text remains above the body-text threshold.
- Console Blue with Cloud Paper label · `4.82:1`; use light labels on blue controls.
- Loot Amber with Night Navy label · `9.17:1`; reserve amber for sale/reward moments, not paragraphs.
- Success green with Night Navy label · `7.07:1`; success is semantic, not a second brand accent.
- Focus uses a 2–3 px `#0B1220` ring with 2 px offset and appears instantly.

## Typography

- Display · Space Grotesk 700, normal, tracking `-0.025em`; hero and section headings only.
- Body · Geist 400/500/600; interface copy and dense administration data.
- Outlier · Geist Mono 500; prices, order IDs, version/build metadata only.
- Scale · major-third (1.25); body floor 16 px, utility floor 12 px, display cap 84 px.
- Numbers in prices, totals, KPIs and tables use tabular figures.

## Spacing, shape and elevation

- 4-point spacing scale from `--space-3xs` (4 px) through `--space-4xl` (176 px). No raw spacing values in implementation.
- Card radius 10 px · hero radius 16 px · input/button radius 8 px · pills only for compact statuses.
- Control height 44 px desktop and 48 px on coarse pointers.
- Elevation is primarily Cloud Paper → Surface → Raised. Use `#C8D4E2` for quiet edges and reserve `#7F93AC` for controls, tables and focus-adjacent boundaries. One restrained navy shadow is allowed only on interactive raised cards and the featured hero.

## Component voice

- Primary CTA · Console Blue fill, Cloud Paper label, 8 px radius, 16/20 px horizontal padding. Use once per decision area and give it the largest visual weight in that decision area.
- Secondary CTA · Surface/Raised fill with functional border and ink text.
- Ghost action · no container at rest; blue underline or Raised fill on hover/focus.
- Inputs · visible label above, helper/error below, 1 px border fixed across all states, reserved right-edge status slot.
- Cards · image and information hierarchy first; avoid wrapping every row in a card. Storefront cards use quiet edges or surface contrast, never a dark outline on every card.
- Status · icon + text + colour. Amber marks sale/reward; green marks success/owned/released.
- Icons · Lucide only; 20 px default, 24 px primary navigation.

## Interaction and motion

- Eight states are required: default, hover, focus, active, disabled, loading, error, success.
- Hover is a single signal: 1 px lift or background change, never both plus scale/shadow.
- Silent success for visible updates. Reversible destructive actions use optimistic update + Undo.
- Workbench motion is limited to button press, row selection and one data-load reveal. No universal scroll fades.
- Reduced-motion fallback · opacity-only, ≤ 150 ms; focus state remains instantaneous.

## Responsive contract

- Validate 320, 375, 414, 768, 960 and 1440 px widths.
- Storefront becomes one content column with bottom navigation on mobile; admin tables collapse into labelled rows/cards.
- Touch targets are at least 44×44 px; clickable labels never wrap.
- Content grids use explicit minimums and must not create horizontal scrolling.

## Visual hierarchy rules

- Storefront header is the primary structural rail: Night Navy background, Cloud Paper text, Cloud Paper search field.
- Storefront hero is the merchandising anchor: artwork leads, copy panel carries title, price and one blue purchase action.
- Discovery filters are tabs, not a row of outlined pills. Only the active filter receives a filled treatment.
- Game cards should be image-led and quiet. Prefer three larger cards or one featured card plus supporting cards over four equal bordered boxes.
- Admin sidebar uses Night Navy as a navigation rail; the workspace stays Cloud Paper. KPI values form one scanline before the main table.
- Blue appears at moments of decision; amber appears at sale/reward moments; green appears at owned, released or completed states.

## What pages MUST share

- Wordmark, exact four-colour brand palette, semantic ink/rule colours and font pairing.
- CTA voice, control height, radius, focus ring and status semantics.
- Storefront prioritizes discovery → game detail → cart/checkout; admin prioritizes scanning → filtering → row action.

## What pages MAY differ on

- Storefront may use cinematic game artwork and asymmetric merchandising rhythm.
- Library uses denser list/card hybrids; management pages use tables and side navigation.
- Console Blue footprint may be lower in admin, while Loot Amber remains reserved for sale, reward and selected emphasis.

## Pencil bindings

Legacy aliases remain temporarily so current frames update without destructive rewiring: `store-backdrop` → Cloud Paper, `store-surface` → Surface, `store-surface-raised` → Raised, `store-rule-soft` → Soft rule, `store-cyan` → Console Blue, `store-cyan-ink` → Cloud Paper label, `store-green` → Success green, `brand-mint` → Loot Amber. New work uses canonical `brand-*`/semantic names.

## UI coverage against the project report

The Pencil file now covers the report's three actors and the critical flow `User → Cart → Order → Payment → LibraryItem` without adding out-of-scope social, recommendation, download, workshop or refund surfaces.

| Report capability | Pencil surface |
|---|---|
| Account, role and recovery | `Account · Profile & Security`, `Account · Access`, `Account · Password Recovery` |
| Browse, search, filter, sort and pagination | `Store · Home`, `Store · Browse & Search` |
| Game detail, price and promotion | `Store · Game Detail`, `Admin · Catalog & Taxonomy`, `Admin · Promotion Management` |
| Cart and payment | `Store · Cart & Checkout`, `Admin · Order Management` |
| Wishlist | `Customer · Wishlist` |
| Purchased library and ownership | `Account · Game Library`, order detail state in `Customer · Order History` |
| Customer reviews | `Customer · Review & Rating` |
| Admin user and access management | `Admin · User Management` |
| Catalog CRUD, taxonomy and media | `Admin · Catalog & Taxonomy` with Games/Categories/Developers/Publishers/Media tabs |
| Review moderation | `Admin · Review Moderation` |
| KPI, revenue, transactions and best sellers | `Admin · Dashboard`, `Admin · Reports` |

### Pencil cleanup

Removed from the reusable library because they were unused and did not map to the report: duplicate unnamed button/checkbox/alert nodes, accordion examples and tooltip. Kept form, table, pagination, modal, status, media-progress and navigation primitives because they support the report's CRUD, recovery, moderation and reporting states.

## Exports

`tokens.css` is the source of truth.

### Tailwind v4 `@theme`

```css
@theme {
  --color-paper: oklch(97.58% 0.0057 264.53);
  --color-paper-2: oklch(94.64% 0.0143 254.61);
  --color-paper-3: oklch(91.07% 0.0220 250.22);
  --color-ink: oklch(18.31% 0.0309 263.38);
  --color-ink-2: oklch(37.17% 0.0392 257.29);
  --color-muted: oklch(49.22% 0.0434 258.35);
  --color-rule: oklch(65.63% 0.0439 254.14);
  --color-rule-soft: oklch(86.50% 0.0234 252.19);
  --color-accent: oklch(54.61% 0.2152 262.88);
  --color-amber: oklch(78.19% 0.1585 72.33);
  --color-accent-ink: oklch(97.58% 0.0057 264.53);
  --color-focus: oklch(18.31% 0.0309 263.38);
  --font-display: "Space Grotesk", "Geist", sans-serif;
  --font-body: "Geist", "IBM Plex Sans", sans-serif;
  --font-outlier: "Geist Mono", "JetBrains Mono", monospace;
  --spacing-3xs: 0.25rem; --spacing-2xs: 0.5rem; --spacing-xs: 0.75rem;
  --spacing-sm: 1rem; --spacing-md: 1.5rem; --spacing-lg: 2rem;
  --spacing-xl: 3rem; --spacing-2xl: 4.5rem; --spacing-3xl: 7rem;
  --radius-card: 10px; --radius-hero: 16px; --radius-input: 8px; --radius-pill: 999px;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
}
```

### DTCG `tokens.json`

```json
{
  "$schema": "https://design-tokens.github.io/community-group/format/",
  "color": {
    "paper": { "$value": "oklch(97.58% 0.0057 264.53)", "$type": "color" },
    "paper-2": { "$value": "oklch(94.64% 0.0143 254.61)", "$type": "color" },
    "paper-3": { "$value": "oklch(91.07% 0.0220 250.22)", "$type": "color" },
    "ink": { "$value": "oklch(18.31% 0.0309 263.38)", "$type": "color" },
    "rule-soft": { "$value": "oklch(86.50% 0.0234 252.19)", "$type": "color" },
    "accent": { "$value": "oklch(54.61% 0.2152 262.88)", "$type": "color" },
    "amber": { "$value": "oklch(78.19% 0.1585 72.33)", "$type": "color" },
    "accent-ink": { "$value": "oklch(97.58% 0.0057 264.53)", "$type": "color" },
    "focus": { "$value": "oklch(18.31% 0.0309 263.38)", "$type": "color" }
  },
  "font": {
    "display": { "$value": "Space Grotesk, Geist, sans-serif", "$type": "fontFamily" },
    "body": { "$value": "Geist, IBM Plex Sans, sans-serif", "$type": "fontFamily" }
  },
  "space": { "md": { "$value": "1.5rem", "$type": "dimension" } },
  "radius": { "hero": { "$value": "16px", "$type": "dimension" } },
  "duration": { "short": { "$value": "220ms", "$type": "duration" } }
}
```

### shadcn/ui CSS variables

```css
:root {
  --background: 97.58% 0.0057 264.53;
  --foreground: 18.31% 0.0309 263.38;
  --card: 94.64% 0.0143 254.61;
  --card-foreground: 18.31% 0.0309 263.38;
  --popover: 97.58% 0.0057 264.53;
  --popover-foreground: 18.31% 0.0309 263.38;
  --primary: 54.61% 0.2152 262.88;
  --primary-foreground: 97.58% 0.0057 264.53;
  --secondary: 91.07% 0.0220 250.22;
  --secondary-foreground: 18.31% 0.0309 263.38;
  --muted: 94.64% 0.0143 254.61;
  --muted-foreground: 49.22% 0.0434 258.35;
  --accent: 94.64% 0.0143 254.61;
  --accent-foreground: 18.31% 0.0309 263.38;
  --destructive: 50.03% 0.1821 29.51;
  --destructive-foreground: 97.58% 0.0057 264.53;
  --border: 65.63% 0.0439 254.14;
  --input: 65.63% 0.0439 254.14;
  --ring: 18.31% 0.0309 263.38;
  --radius: 8px;
}
```
