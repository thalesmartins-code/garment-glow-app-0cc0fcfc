# Design System

Single source of truth for visual tokens, components, and patterns used across the app.

## Tokens (HSL semantic)

All colors live in `src/index.css` under `:root` / `.dark`. **Never** use raw color classes
(`text-white`, `bg-black`, `text-red-500`) in components — always go through tokens.

| Token | Use |
|-------|-----|
| `--background` / `--foreground` | App-level surfaces and primary text |
| `--card` / `--card-foreground` | Cards, panels |
| `--muted` / `--muted-foreground` | Secondary text, subdued hovers |
| `--primary` / `--primary-foreground` | Primary actions, focus rings |
| `--accent` / `--accent-foreground` | Highlights (charts, KPI deltas) |
| `--destructive` / `--destructive-foreground` | Destructive buttons, errors |
| `--border` / `--input` / `--ring` | Lines, form fields, focus |

Tailwind classes: `bg-card`, `text-foreground`, `text-muted-foreground`, `border-border`,
`bg-primary text-primary-foreground`, `bg-destructive text-destructive-foreground`, etc.

### Brand colors

Marketplace identity colors live in `src/config/storeColors.ts`. Do not inline brand hex values
anywhere else.

## Typography

- Display & body: **Plus Jakarta Sans** (loaded globally).
- KPI titles: `text-sm font-medium text-foreground` — no icons (see card-headers standard).
- Tabular numbers: `tabular-nums` for KPI values and tables.

## Spacing patterns

- Page wrapper: `px-4 md:px-6 py-4 md:py-6`
- Card body: `p-4` (compact) or `p-6` (default)
- Grid gap between cards: `gap-3` or `gap-4`

## Components

| Component | Where |
|-----------|-------|
| `Button` | `ui/button.tsx` — variants: `default`, `secondary`, `ghost`, `outline`, `destructive`, `link` |
| `Card` | `ui/card.tsx` — wrap with `<div className="px-4 pt-4 pb-3"><span className="text-sm font-medium text-foreground">Title</span></div>` for the standard header |
| `KPICard` | `dashboard/KPICard.tsx` — variant `tv` for big screens (`text-3xl`) |
| `Tooltip`, `Popover`, `Dialog` | `ui/*` shadcn primitives — never roll your own |

## Hover & state conventions

- Hover backgrounds: `hover:bg-muted`
- Selected items: `bg-muted` + `border-primary/40` outline
- Destructive confirmations: `Button variant="destructive"` + `AlertDialog`

## Utilities

- `formatCurrency`, `formatPercent`, `formatDate`, `formatCompactNumber` → `src/lib/formatters.ts`
- `logger.debug/info/warn/error` → `src/lib/logger.ts` (debug silenced in production)

## When in doubt

1. Reach for an existing shadcn component before building your own.
2. Use semantic tokens, never literal colors.
3. Match spacing of neighboring pages — consistency wins over novelty.