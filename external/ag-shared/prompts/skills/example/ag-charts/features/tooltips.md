# Tooltip Features

## 🔗 Shared Tooltips (Multi-Series MANDATORY)

_Apply: 2 minutes, Impact: CRITICAL_ ⭐⭐⭐ **HIGHEST PRIORITY**

### Basic Configuration

```typescript
// ALWAYS add this to multi-series charts - it's the #1 UX improvement
tooltip: {
    enabled: true,
    mode: 'shared',    // Shows all series at once - professional requirement
}
```

### When to Use (High Priority Decision Tree)

- ✅ **ANY chart with 2+ series** → MANDATORY
- ✅ **Stacked charts** → CRITICAL (like `stacked-horizontal-bar`)
- ✅ **Time series comparisons** → ESSENTIAL
- ✅ **Dashboard charts** → REQUIRED for professional UX
- ⚠️ **Single series** → Optional (standard tooltip is fine)

### Why This is #1 Priority

- **Instant professional appearance** - looks like expensive BI tools
- **Essential UX pattern** - users expect this behavior in modern dashboards
- **2-minute implementation** - highest impact-to-effort ratio
- **Works with all themes** - no compatibility issues
- **Executive expectation** - business users demand this interaction pattern

## Advanced Tooltip Configuration

### Shared Tooltips with Series-Level Custom Rendering

For charts where each series needs individual tooltip handling but still benefits from shared mode:

```typescript
// In theme.overrides.bar.series (or individual series config)
tooltip: {
    enabled: true,
    renderer: (params) => {
        const { datum, yKey, yName } = params;
        const [player, result] = yName?.split(' - ') ?? ['', ''];

        return {
            heading: datum.year, // Primary label at top of tooltip
            title: player || 'Player', // Series/player name
            data: [{
                label: result,
                value: String(Math.abs(datum[yKey])),
            }],
        };
    },
},

// Root-level shared tooltip coordination
tooltip: {
    mode: 'shared',
    position: {
        placement: ['top', 'bottom'],
    },
}
```

### Advanced Positioning for Complex Charts

```typescript
tooltip: {
    mode: 'shared',
    position: {
        anchorTo: 'pointer',           // Follow cursor for better UX
        placement: ['top', 'bottom'],  // Preferred positions
        xOffset: 10,                   // Fine-tune positioning
        yOffset: -10,
        constraints: 'flip-on-overflow', // Smart overflow handling
    },
    wrapping: 'hyphenate',            // Better text handling
}
```

## Implementation Priority by Chart Type

### 🔴 MANDATORY (Always implement)

- Stacked bar/column charts (like `stacked-horizontal-bar`)
- Multi-line time series
- Grouped bar charts with 3+ series
- Area charts comparing trends
- Any dashboard visualization

### 🟡 HIGHLY RECOMMENDED

- Scatter plots with multiple datasets
- Mixed chart types (line + bar combinations)
- Financial charts with OHLC + volume

## PREFERRED Tooltip Approach - Use data[] Elements

```typescript
// ❌ BAD: Missing heading causes empty line at top of tooltip!
tooltip: {
    renderer: (params) => {
        return {
            // MISSING heading - will show empty line!
            data: [
                { label: 'Revenue', value: `$${params.value.toLocaleString()}` },
                { label: 'Growth', value: `${params.datum.growth}%` },
            ],
        };
    };
}

// ✅ GOOD: Always include heading to avoid empty lines
tooltip: {
    renderer: (params) => {
        return {
            heading: params.datum.month || params.datum.category, // Primary label at top of tooltip (REQUIRED!)
            title: params.yName || params.title || 'Series', // Series name
            data: [
                { label: 'Revenue', value: `$${params.value.toLocaleString()}` },
                { label: 'Growth', value: `${params.datum.growth}%` },
                { label: 'Target', value: `$${params.datum.target.toLocaleString()}` },
            ],
        };
    };
}

// ❌ AVOID: Custom HTML (unless absolutely necessary)
tooltip: {
    renderer: (params) => {
        // Only use HTML for truly complex cases that data[] can't handle
        // If you must, ensure font consistency
        return `<div style="font-family: Verdana, sans-serif;">...</div>`;
    };
}
```

### Benefits of data[] approach

- Automatically uses theme-aware tooltip styling
- Proper spacing and alignment handled by AG Charts
- Dark mode compatibility built-in
- Simpler code that's easier to maintain

## ⚠️ CRITICAL: Always Include `heading` to Avoid Empty Lines!

**PROBLEM**: Missing `heading` in tooltip renderer causes an empty line at the top of the tooltip (as shown in your screenshot).

**SOLUTION**: ALWAYS include a `heading` property in your tooltip renderer return object.

### Understanding `heading`, `title`, and `data`:

- **`heading`**: The primary label at the top of the tooltip — the identifying value for the data point (e.g. month, category name, year). **REQUIRED** to avoid empty lines!
- **`title`**: The series name/label — shown below the heading
- **`data`**: The actual data points and values

**`heading` applies to ALL chart types:**
- Cartesian charts: the x-axis value (date, category, year, etc.)
- Pie/donut charts: the category/sector name (e.g. `params.datum.category`)
- Any chart: whatever identifies the data point being hovered

```typescript
// ✅ CORRECT: heading = primary label, title = series name
tooltip: {
    renderer: (params) => {
        return {
            heading: params.datum.year,          // Primary label (REQUIRED — prevents empty line)
            title: params.yName || 'Series',     // Series name
            data: [
                { label: 'Value', value: params.value },
                { label: 'Change', value: `${params.datum.change}%` },
            ],
        };
    };
}

// ❌ WRONG: Duplicate headings cause redundant display
series: [
    {
        tooltip: {
            renderer: (params) => ({
                title: `Year: ${params.datum.year}`, // ❌ Will repeat for each series
                data: [{ label: 'Sales', value: params.value }],
            }),
        },
    },
    {
        tooltip: {
            renderer: (params) => ({
                title: `Year: ${params.datum.year}`, // ❌ Duplicate heading!
                data: [{ label: 'Profit', value: params.value }],
            }),
        },
    },
];
```

## Visual Verification for Custom Tooltips

```typescript
// MANDATORY: After implementing custom tooltips, verify visually:

// 1. Take screenshot with tooltip visible
await page.hover('[data-point-selector]');  // Hover over data point
await page.waitForTimeout(500);              // Wait for tooltip
await puppeteer_screenshot({ name: 'tooltip-check' });

// 2. Check for these common issues:
// - Duplicate titles (same title appearing multiple times)
// - Missing or redundant titles
// - Improper data grouping
// - Text overflow or truncation
// - Poor contrast in dark/light modes

// 3. Test with shared mode for multi-series
tooltip: {
    mode: 'shared',  // Essential for multi-series
    // Custom renderer should work well with shared mode
}
```

## Tooltip Best Practices

### Choosing the Right Values for tooltip.renderer result object

```typescript
// HEADING (REQUIRED) - The primary label at the top — prevents empty lines:

// For cartesian time series charts:
heading: params.datum.date || params.datum.year || params.datum.month;

// For cartesian category charts:
heading: params.datum.category || params.datum.name || params.datum.label;

// For pie/donut charts (use the sector/category name):
heading: params.datum.category || params.datum.name || params.datum.label;

// Default fallback for heading:
heading: params.xValue || params.datum[params.xKey];

// TITLE - The series name:
title: params.yName || params.title || 'Series';
```

### Pie/Donut Chart Tooltip Example

```typescript
// ✅ Pie/donut charts: heading = category name (NOT title!)
series: [{
    type: 'donut',
    angleKey: 'value',
    sectorLabelKey: 'category',
    tooltip: {
        renderer: ({ datum, angleKey }) => ({
            heading: datum.category,   // Category/sector name (REQUIRED!)
            data: [
                { label: 'Value', value: String(datum[angleKey]) },
            ],
        }),
    },
}],
```

### Key Properties Explained:

- **`heading`** (REQUIRED): The primary label at the top of the tooltip — identifies the data point (category name, date, year, etc.). **Omitting this causes an empty line!**
- **`title`**: The series name/label — shown below the heading
- **`data[]`**: Use for actual data points and values
- **Avoid HTML**: Stick to data[] elements unless absolutely necessary
- **Test visually**: Always verify tooltip rendering with screenshots
- **Check for duplicates**: Ensure headings aren't repeated unnecessarily

## Common Implementation Pattern for Gallery Examples

```typescript
// Most gallery examples should use this exact pattern:
const options: AgChartOptions = {
    // ... other config
    tooltip: {
        mode: 'shared', // ALWAYS for multi-series
        position: {
            placement: ['right', 'left', 'top', 'bottom'], // Smart fallbacks
        },
    },
    // ... rest of config
};
```

## 🎨 Tooltip Symbol Customization

_New Nov 2024 • Apply: 5 minutes • Impact: MEDIUM_

Customize the marker and line symbols shown in tooltips for better visual distinction:

```typescript
tooltip: {
    renderer: (params) => {
        return {
            heading: params.datum.category,
            title: params.yName || 'Series',
            symbol: {
                marker: {
                    enabled: true,
                    shape: 'circle', // 'circle' | 'square' | 'diamond' | 'plus' | 'cross' | 'triangle'
                    // Don't set fill/stroke - theme handles colors
                },
                line: {
                    enabled: true,
                    strokeWidth: 2,
                    lineDash: [4, 2], // Optional dashed line
                    // Don't set stroke - theme handles colors
                },
            },
            data: [
                { label: 'Value', value: params.value },
            ],
        };
    },
}
```

**Symbol Options:**

- `marker`: Configure the marker symbol shown next to series name
    - `enabled`: Toggle marker visibility
    - `shape`: Marker shape (circle, square, diamond, plus, cross, triangle, or custom function)
- `line`: Configure the line symbol shown for line/area series
    - `enabled`: Toggle line visibility
    - `strokeWidth`: Line thickness
    - `lineDash`: Optional dash pattern

**Use Cases:**

- ✅ Differentiate series visually in shared tooltips
- ✅ Match tooltip symbols to series marker styles
- ✅ Create consistent visual language between chart and tooltip
- ✅ Improve accessibility by providing visual cues alongside text

**Theme Compatibility:**

- Colors are automatically handled by the theme
- Works seamlessly in light/dark modes
- Don't hardcode fill/stroke colors - let theme manage them

## Pro Tip for Complex Data

When dealing with grouped data (like player wins/losses), the shared tooltip automatically groups all series at the same x-position, making it perfect for comparative analysis. This is why examples like `stacked-horizontal-bar` are so effective - users can instantly see all three players' performance for any given year.
