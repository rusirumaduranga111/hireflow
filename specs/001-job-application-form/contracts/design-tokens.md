# Contract: Design tokens (`frontend/src/styles/tokens.css`)

**Source of truth**: `Design/HireFlow Style Sheet.dc.html` ("Visual language"). Rows marked
**page** come from `Design/Job Application Page.dc.html`, and the reason for each is in
[research.md](../research.md) R8. Component styles may use only `var(--hf-*)`. The literal values
below appear **only** in `tokens.css`.

## Colour

| Token | Value | Role (from the style sheet) |
|---|---|---|
| `--hf-color-primary` | `#1D4ED8` | Primary actions, links, focus rings (7.0:1 on white) |
| `--hf-color-primary-hover` | `#1E40AF` | Hover and pressed state of primary surfaces |
| `--hf-color-primary-tint` | `#EFF6FF` | Quiet badges, avatar and drop-zone hover fills |
| `--hf-color-on-primary` | `#FFFFFF` | Text on primary |
| `--hf-color-text` | `#1C1A17` | Headings and body (16.6:1) |
| `--hf-color-text-muted` | `#57534B` | Secondary copy, helper text (7.3:1) |
| `--hf-color-text-subtle` | `#78716A` | Labels and captions, 12px minimum (4.6:1) |
| `--hf-color-surface` | `#FFFFFF` | Cards, inputs |
| `--hf-color-background` | `#FAF9F7` | App canvas; drop-zone fill |
| `--hf-color-border` | `#E7E5E0` | Dividers, card edges |
| `--hf-color-border-strong` | `#D6D3CD` | Input outlines, secondary button border |
| `--hf-color-border-hover` | `#A8A29B` | Input and secondary button hover border (style sheet components) |
| `--hf-color-error` | `#B91C1C` | Invalid fields, error text (6.4:1) |
| `--hf-color-error-tint` | `#FEF2F2` | Error alert background |

## Focus

| Token | Value |
|---|---|
| `--hf-focus-ring` | `0 0 0 2px var(--hf-color-surface), 0 0 0 4px var(--hf-color-primary)` (buttons and links) |
| `--hf-focus-halo` | `inset 0 0 0 1px var(--hf-color-primary), 0 0 0 3px rgb(29 78 216 / 0.32)` (inputs) |
| `--hf-focus-halo-error` | `inset 0 0 0 1px var(--hf-color-error), 0 0 0 3px rgb(185 28 28 / 0.28)` (invalid inputs) |

These are focus indicators, not drop shadows, so the "no heavy drop-shadows" rule does not apply.

## Typography

| Token group | Size / line-height / weight / tracking | Use |
|---|---|---|
| `--hf-font-family` | `Inter, system-ui, sans-serif` | everywhere |
| `--hf-type-page-title-*` | 32px / 1.2 / 700 / -0.02em | h1 |
| `--hf-font-size-page-title-compact` | 28px | h1 at ≤420px (style sheet: "steps down to 28px") |
| `--hf-font-size-display` **page** | 40px | h1 at ≥900px |
| `--hf-type-section-title-*` | 24px / 1.33 / 600 / -0.01em | "Apply for this role", "Application sent" |
| `--hf-type-subtitle-*` | 18px / 1.55 / 600 | Description headings |
| `--hf-type-body-*` | 16px / 1.6 / 400 | Body, inputs, fact values and brand name (15px values snapped to 16px) |
| `--hf-line-height-reading` **page** | 1.7 | Description paragraphs, confirmation body |
| `--hf-type-body-small-*` | 14px / 1.6 / 400 | Intro line, alerts, file name |
| `--hf-type-label-*` | 13px / 1.55 / 500 | Labels; small button text |
| `--hf-type-caption-*` | 12px / 1.5 / 400 | Helper and error text, fact labels, privacy line, footer |
| `--hf-font-weight-semibold` and `--hf-font-weight-bold` | 600 / 700 | emphasis |

## Spacing (8px grid)

| Token | Value | Use |
|---|---|---|
| `--hf-space-0-5` | 2px | Name and role pairs (style sheet card) |
| `--hf-space-1` | 4px | Label to field |
| `--hf-space-2` | 8px | Base unit; button gaps |
| `--hf-space-control-x` | 12px | Input and quiet-button horizontal padding (style sheet controls) |
| `--hf-space-3` | 16px | Between fields; alert padding; mobile gutter and card padding (20px snapped to 16px) |
| `--hf-space-4` | 24px | Card padding; gutter; facts list gap (20px snapped to 24px) |
| `--hf-space-5` | 32px | Between content blocks |
| `--hf-space-layout-40` **page** | 40px | Main top padding; gap between description and form |
| `--hf-space-6` | 48px | Section spacing |
| `--hf-space-layout-56` **page** | 56px | Column gap at ≥900px |
| `--hf-space-7` | 64px | Page top and bottom |
| `--hf-space-layout-80` **page** | 80px | Main bottom padding |

## Shape, size, layout and motion

| Token | Value |
|---|---|
| `--hf-radius-control` | 6px (buttons, inputs, alerts) |
| `--hf-radius-card` | 8px |
| `--hf-radius-pill` | 9999px (avatars, the ✓ badge) |
| `--hf-border-width` | 1px |
| `--hf-border-width-dropzone` **page** | 1.5px (dashed) |
| `--hf-size-control-sm` / `-md` / `-lg` | 32px / 40px / 48px (48px is the touch minimum; form controls use lg) |
| `--hf-size-avatar` / `-lg` | 32px / 40px |
| `--hf-size-button-min` **page** | 176px (minimum width of "Send application", design line 156) |
| `--hf-layout-max-width` **page** | 1040px |
| `--hf-layout-facts-width` **page** | 280px |
| `--hf-duration-fast` | 120ms |

## Breakpoints (the only literals allowed outside `tokens.css`)

`@media` conditions cannot read custom properties. These values are documented here and repeated
literally in media queries only:

- `(max-width: 420px)`: compact gutter (`--hf-space-3`), title `--hf-font-size-page-title-compact`,
  card padding `--hf-space-3`.
- `(min-width: 900px)`: two columns (main plus `--hf-layout-facts-width` sticky facts), title
  `--hf-font-size-display`, Name and Email side by side.
