# AG Charts — Quality Rules

Mandatory rules for all AG Charts examples. Theme compatibility is the #1 priority.

## No Hardcoded Styling — ENFORCE WITHOUT EXCEPTION

1. **REMOVE ALL COLOUR PROPERTIES** — Delete every `color:`, `fill:`, `stroke:`, `backgroundColor:`
2. **NO HEX CODES** — Never use `#ffffff`, `#333333`, etc.
3. **NO RGB/RGBA** — Never use `rgb()`, `rgba()`, `hsl()`, etc.
4. **NO COLOUR NAMES** — Never use `'white'`, `'black'`, `'blue'`, etc. in colour properties
5. **NO FONT PROPERTIES** — NEVER set `fontSize`, `fontWeight`, `fontFamily`, `fontStyle`
6. **NO CUSTOM CSS** — NEVER create `styles.css` or add any CSS unless absolutely critical
7. **THEME HANDLES EVERYTHING** — The theme system manages ALL visual styling

**Exceptions (extremely rare):**

- Colour scales for heatmaps/specialised visualisations (MUST work in both light/dark themes)
- Even then, prefer theme-aware colour schemes

**Why this matters:** Gallery examples are copied by thousands of developers into different environments. Any hardcoded styling breaks portability across themes, design systems, and containers.

## Required Fields

- **`axes.*.type`** — MUST always be specified for every axis (axes are a dictionary: `axes: { x: { type: 'category' }, y: { type: 'number' } }`)
- All TypeScript types must be properly defined — NEVER use `any`
- Use specific chart types: `AgCartesianChartOptions` (cartesian), `AgPolarChartOptions` (polar), `AgFinancialChartOptions` (financial). Hierarchy charts (treemap, sunburst) use generic `AgChartOptions`.

## Tooltip Requirements

- When using a custom tooltip `renderer`, **ALWAYS include `heading`** in the return object — omitting it causes an empty line at the top. `heading` is the primary label (e.g. `heading: params.datum.month` for cartesian, `heading: datum.category` for pie/donut). Return `{ heading, title, data[] }`.
- `tooltip: { mode: 'shared' }` without a renderer is fine — the built-in shared tooltip handles heading automatically.
- Do NOT use custom tooltip HTML via `renderer()` — use `{ heading, title, data[] }` object instead (simpler + better styling)

## Formatter Best Practices

### NEVER use no-op formatters:

```typescript
// BAD — These add no value over built-in formatting
formatter: ({ value }) => value.toLocaleString();
formatter: ({ value }) => `$${value.toLocaleString()}`;
formatter: ({ value }) => `${value}`;
```

### AVOID deeply nested formatters:

```typescript
// BAD — Repetitive nested formatters
axes: [{ type: 'number', label: { formatter: ({ value }) => `$${(value / 1000).toFixed(0)}K` } }],
series: [{ label: { formatter: ({ value }) => `$${(value / 1000).toFixed(0)}K` } }],  // Same format!
```

### USE root-level formatters for consistency:

```typescript
// GOOD — Single formatter definition at root level
const options = {
    formatter: {
        y: ({ value }) => `$${(value / 1000).toFixed(0)}K`,
    },
    // All axes, series, labels, and tooltips use this formatter automatically
};

// GOOD — Root formatter with x and y
const options = {
    formatter: {
        x: ({ value }) => value.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        y: ({ value }) => `${value.toFixed(1)}%`,
    },
};
```

Only use nested formatters when they differ from the root formatter.

**Benefits:** DRY principle, consistency across axes/labels/tooltips, single place to update, cleaner code, AG Charts optimises root formatters.

## Never Do List

- Hardcode ANY colours — **BREAKS THEMES**
- Set font properties — theme handles ALL typography
- Add CSS files — NO `styles.css`, NO custom stylesheets
- Use inline styles in HTML
- Use `any` TypeScript type
- Change chart types or data structure during spruce-up (focus on visual enhancement only)
- Set explicit themes (`theme: 'ag-default'`) — gallery handles theme switching
- **For 'simple-*' examples**: Add more series or data — these showcase a single series type
- Over-decorate radial/polar charts — avoid cross lines, excessive grid lines, or axis labels
- Add unnecessary footnotes — only when essential (footnotes reduce vertical space)

## Deprecated API Patterns to Avoid

### `series[].highlightStyle` is deprecated — use `series[].highlight.*`:

```typescript
// DEPRECATED
series: [{ highlightStyle: { fill: 'yellow', strokeWidth: 3 } }];

// MODERN
series: [{ highlight: { highlightedItem: { strokeWidth: 3 } } }];
```

### `highlighted` boolean is deprecated — use `highlightState` string:

```typescript
// DEPRECATED
styler: (params) => {
    if (params.highlighted) return { strokeWidth: 3 };
};

// MODERN
styler: (params) => {
    if (params.highlightState === 'highlighted-item') return { strokeWidth: 3 };
};
```

**Available `highlightState` values:** `'highlighted-item'`, `'highlighted-series'`, `'unhighlighted-item'`, `'unhighlighted-series'`, `'highlighted-branch'`, `'unhighlighted-branch'`, `'none'`

### `itemId` is deprecated — use `itemType` for series item classification:

```typescript
// DEPRECATED (for waterfall, range-area, range-bar, OHLC series)
label: { formatter: ({ itemId, value }) => `${itemId === 'high' ? 'High' : 'Low'}: ${value}` }

// MODERN
label: { formatter: ({ itemType, value }) => `${itemType === 'high' ? 'High' : 'Low'}: ${value}` }
```

**Note:** `itemId` is still valid for legend events where it refers to legend item identifiers, not series datum types.

## Quick Reference — Chart Type Features

### Multi-series charts:
Shared tooltips (`mode: 'shared'`) → Legend positioning → Axis bands

### Single series charts:
Axis bands → Data labels → Series styling

### 'simple-*' examples:
Keep single series! → Focus on labels, formatting, bands, tooltips

### Time series:
Navigator + crosshairs + date formatting

### Financial data:
Conservative styling + currency formatters + reference lines + right-side Y-axis

### Radial/Polar charts:
MINIMAL axis decoration — maximise visualisation space, avoid footnotes
