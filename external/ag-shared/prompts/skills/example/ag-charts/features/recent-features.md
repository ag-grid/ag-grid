# Recent Feature Additions

Track the latest AG Charts capabilities to ensure gallery examples showcase cutting-edge features.

## 🆕 Recently Added Features (Post b12.2.0)

### ⚡ Quick Date/Price Measurement Overlay

> For base annotation setup, see `enterprise.md`. This section covers the quick measurement overlay added in Mar 2025.

_New Mar 2025 • Apply: 6 minutes • Impact: HIGH_ ⭐ **RECOMMENDED for financial timelines**

```typescript
annotations: {
    enabled: true,
},
initialState: {
    annotations: [
        {
            type: 'quick-date-price-range',
            start: { x: new Date('2025-01-06'), y: 98 },
            end: { x: new Date('2025-01-15'), y: 112 },
            text: { label: 'January rally' },
            up: {
                statistics: {
                    fillOpacity: 0.3, // Theme handles colors
                },
            },
            down: {
                statistics: {
                    fillOpacity: 0.15,
                },
            },
        },
    ],
},
```

_Highlights_: Instant measurement of both price and time deltas with theme-aware styling and directional `up`/`down` overrides.

### 🎯 Highlight Drawing Modes

_New Mar 2025 • Apply: 2 minutes • Impact: MEDIUM_

```typescript
series: [
    {
        type: 'line',
        xKey: 'date',
        yKey: 'close',
        highlight: {
            drawingMode: 'cutout', // or 'overlay' (default)
            highlightedItem: {
                strokeWidth: 3,
            },
        },
    },
];
```

_Use when_: You want hover states to punch through dense fills (`'cutout'`) or sit on top (`'overlay'`).

### 🔁 Lightweight Data Transactions

_New Mar 2025 • Apply: 3 minutes • Impact: MEDIUM_

```typescript
import type { AgDataTransaction } from 'ag-charts-types';

const newBars = getLatestRows();

const transaction: AgDataTransaction<(typeof newBars)[number]> = {
    append: newBars,
    remove: [{ quarter: '2022 Q1' }],
};

await chart.applyTransaction(transaction);
```

_Why_: Append, prepend, or remove data without rebuilding the chart—perfect for live dashboards.

### 🪄 Rich Text Formatters Everywhere

_New Mar 2025 • Apply: 5 minutes • Impact: HIGH_

```typescript
formatter: {
    y: ({ value }) => [
        { text: value >= 0 ? '+' : '', fontWeight: 'bold' },
        { text: value.toFixed(1) },
        { text: ' %', opacity: 0.7 },
    ],
},
axes: {
    x: {
        type: 'time',
        position: 'bottom',
        label: {
            formatter: ({ value }) => [
                { text: value.toLocaleString('en-US', { month: 'short' }) },
                { text: ` ${value.getFullYear()}`, opacity: 0.6 },
            ],
        },
    },
};
```

_Scope_: Works for axes, labels, navigator mini-chart labels, and chart-level captions.

### 🧭 Axis Cross Positioning

_New Mar 2025 • Apply: 4 minutes • Impact: MEDIUM_

```typescript
axes: {
    y: {
        type: 'number',
        position: 'left',
        crossAt: {
            value: 0,
            sticky: true, // Keep origin locked to the plotted domain
        },
    },
    x: {
        type: 'time',
        position: 'bottom',
        crossAt: { value: new Date('2025-01-01') },
    },
};
```

_Use for_: Center-origin charts, quadrant layouts, and custom axis intersections without manual offsets.

### 📊 Series Segmentation

_New Jan 2025 • Apply: 8 minutes • Impact: HIGH_ ⭐ **RECOMMENDED**

```typescript
// Style different segments of a series with different colors/patterns
series: [
    {
        type: 'bar',
        segmentation: {
            enabled: true,
            key: 'y', // Segment by y-axis values
            segments: [
                {
                    start: 0,
                    stop: 50,
                    // Don't set fill/stroke - theme handles segment colors
                },
                {
                    start: 50,
                    stop: 100,
                    // Different theme color automatically applied
                },
                {
                    start: 100,
                    // Extends to domain end
                    // Another theme color automatically applied
                },
            ],
        },
    },
];
```

_Replaces: Complex itemStyler logic for value-based coloring, manual data splitting_

### 🎨 Series-Level Stylers

_New Jan 2025 • Apply: 6 minutes • Impact: MEDIUM_

```typescript
// Apply consistent styling to entire series (vs individual items)
series: [
    {
        type: 'line',
        styler: (params) => {
            // Access series-level properties
            const { seriesId, seriesName, highlightState } = params;

            if (highlightState === 'highlighted-series') {
                return {
                    strokeWidth: 3,
                    // Don't hardcode colors - let theme handle it
                };
            }
            return {}; // Use defaults when not highlighted
        },
    },
];
```

_Replaces: Repetitive itemStyler implementations, manual series state management_

### 🏷️ Enhanced Axis Label Stylers

_New Jan 2025 • Apply: 5 minutes • Impact: MEDIUM_

```typescript
axes: {
    y: {
        type: 'number', // Required
        position: 'left',
        label: {
            itemStyler: (params) => {
                const { value, formattedValue } = params;

                // Style specific labels differently
                if (value === 0) {
                    return {
                        fontWeight: 'bold',
                        // Don't set color - theme handles contrast
                    };
                }
                return {};
            },
        },
    },
};
```

_Replaces: Complex label formatter workarounds, custom label rendering_

### 🎯 Pie Callout Line Stylers

_New Jan 2025 • Apply: 6 minutes • Impact: MEDIUM_

```typescript
series: [
    {
        type: 'pie',
        calloutLine: {
            itemStyler: (params) => {
                const { datum, angleKey, value } = params;

                // Emphasize high-value segments
                if (value > 1000000) {
                    return {
                        strokeWidth: 2,
                        length: 30,
                        // Don't set color - theme handles callout colors
                    };
                }
                return {};
            },
        },
    },
];
```

_Replaces: Manual callout line customization, complex label positioning logic_

### 🌊 Range Area Enhancements

_New Mar 2025 • Apply: 6 minutes • Impact: HIGH_

```typescript
series: [
    {
        type: 'range-area',
        xKey: 'date',
        yLowKey: 'low',
        yHighKey: 'high',
        styler: ({ itemType }) => {
            if (itemType === 'high') {
                return { lineDash: [6, 3] };
            }
            return {};
        },
        label: {
            enabled: true,
            formatter: ({ itemType, value }) => `${itemType === 'high' ? 'High' : 'Low'}: ${value.toFixed(0)}`,
        },
        invertedStyle: {
            fillOpacity: 0.35, // Theme picks fill color
        },
        highlight: {
            series: {
                item: {
                    strokeWidth: 2,
                },
            },
        },
    },
];
```

_Takeaway_: Use `styler`, `itemType` aware label callbacks, and `invertedStyle` to emphasise band flips without resorting to manual fills.

### 🪵 Range Bar Styling Hooks

_New Mar 2025 • Apply: 5 minutes • Impact: MEDIUM_

```typescript
series: [
    {
        type: 'range-bar',
        xKey: 'task',
        yLowKey: 'start',
        yHighKey: 'finish',
        direction: 'horizontal',
        cornerRadius: 8,
        styler: ({ highlightState }) => (highlightState === 'highlighted-item' ? { strokeWidth: 2 } : {}),
        label: {
            enabled: true,
            placement: 'outside',
            formatter: ({ itemType, value }) => `${itemType === 'high' ? 'Finish' : 'Start'}: ${value}`,
        },
    },
];
```

_Why_: Dedicated stylers and label params replace brittle tooltip hacks for Gantt-style visuals.

### 📦 Box Plot Precision Controls

_New Mar 2025 • Apply: 6 minutes • Impact: MEDIUM_

```typescript
series: [
    {
        type: 'box-plot',
        xKey: 'group',
        yNameKey: 'label',
        styler: ({ highlightState }) => (highlightState === 'highlighted-item' ? { strokeWidth: 3 } : {}),
        cap: { strokeWidth: 2 },
        whisker: { strokeWidth: 1 },
        legendItemName: 'Distribution',
    },
];
```

_Benefit_: Fine-tune caps/whiskers and share legend entries across grouped series.

### 📈 Histogram Themeable Options

_New Mar 2025 • Apply: 4 minutes • Impact: MEDIUM_

```typescript
theme: {
    overrides: {
        histogram: {
            series: {
                areaPlot: true,
                binCount: 20,
                aggregation: 'sum',
            },
        },
    },
},
```

_Use_: Move bin configuration into `theme.overrides` so multiple histogram instances stay in sync.

### 🧭 Radar Series Stylers

_New Mar 2025 • Apply: 5 minutes • Impact: MEDIUM_

```typescript
series: [
    {
        type: 'radar-line',
        angleKey: 'metric',
        radiusKey: 'score',
        styler: ({ highlightState }) => (highlightState === 'highlighted-item' ? { strokeWidth: 4 } : {}),
        highlight: {
            series: {
                item: { strokeWidth: 3 },
            },
        },
    },
];
```

_Outcome_: Polar charts now share the same styler/highlight APIs as cartesian series—leverage them for interactive dashboards.

### 🏷️ Legend Item Grouping

_New Mar 2025 • Apply: 3 minutes • Impact: MEDIUM_

```typescript
series: [
    {
        type: 'range-area',
        legendItemName: 'Projected Range',
    },
    {
        type: 'line',
        legendItemName: 'Projected Range', // Shares toggle with range area
        showInLegend: true,
    },
];

chart.addEventListener('legendItemClick', ({ itemId, enabled }) => {
    console.log('Legend toggled', itemId, enabled);
});
```

_Goal_: Synchronise multiple series under one legend toggle and react to legend events using the new name.

### 🌉 Sankey Layout Controls

_New Mar 2025 • Apply: 6 minutes • Impact: HIGH_

```typescript
series: [
    {
        type: 'sankey',
        sort: 'descending', // 'data', 'ascending', 'descending', 'auto'
        node: {
            spacing: 24,
            minSpacing: 12,
            alignment: 'center',
            verticalAlignment: 'center',
            label: {
                placement: 'right',
                edgePlacement: 'outside',
            },
        },
    },
];
```

_Result_: Control spacing, alignment, sorting, and label placement without custom layers.

### 💹 Custom Financial Range Buttons

_New Mar 2025 • Apply: 4 minutes • Impact: HIGH_

```typescript
const chart = AgCharts.createFinancialChart({
    // ...base options
    ranges: {
        buttons: [
            '1W',
            '1M',
            { type: 'fixed', count: 90, label: '90D' },
            { type: 'callback', label: 'YTD', callback: ({ setRange }) => setRange('yearToDate') },
        ],
    },
});
```

_Best for_: Tailoring toolbars to analyst workflows (earnings windows, YTD, custom presets).

### 🔄 Zoom Data Change Strategy

> For base zoom setup, see `enterprise.md`. This section covers the data-change strategy added in Nov 2024.

_New Nov 2024 • Apply: 3 minutes • Impact: MEDIUM_

```typescript
zoom: {
    enabled: true,
    onDataChange: {
        strategy: 'preserveDomain', // 'reset' | 'preserveDomain' | 'preserveRatios'
    },
}
```

**Strategy Options:**

- `'reset'`: Reset zoom to show all data when data changes
- `'preserveDomain'` (default): Keep current zoom domain when data changes
- `'preserveRatios'`: Adjust zoom to fit new data range while maintaining zoom level

_Use for_: Live data updates where you want to control how zoom behaves when new data arrives.

### 🌳 Hierarchy Highlight States

_New Nov 2024 • Apply: 5 minutes • Impact: MEDIUM_

```typescript
series: [
    {
        type: 'treemap',
        sizeKey: 'value',
        labelKey: 'name',
        styler: (params) => {
            const { highlightState } = params;

            // Differentiate between directly hovered items and branch items
            if (highlightState === 'highlighted-item') {
                return { strokeWidth: 3 }; // Directly hovered
            }
            if (highlightState === 'highlighted-branch') {
                return { strokeWidth: 2, opacity: 0.8 }; // Same branch
            }
            if (highlightState === 'unhighlighted-branch') {
                return { opacity: 0.3 }; // Different branch
            }
            return {};
        },
    },
];
```

**Available States:**

- `'highlighted-item'`: The directly hovered node
- `'highlighted-branch'`: Nodes sharing the same root branch as the hovered item
- `'unhighlighted-branch'`: Nodes in different branches
- `'unhighlighted-item'`: Other items not in the hovered branch
- `'none'`: Default state

_Use for_: Treemap and sunburst charts where you want to highlight related nodes in the same hierarchy branch.

### 📊 Series Axis Binding

_New Nov 2024 • Apply: 4 minutes • Impact: MEDIUM_

```typescript
series: [
    {
        type: 'bar',
        xKey: 'category',
        yKey: 'volume',
        xKeyAxis: 'category', // Default: 'x'
        yKeyAxis: 'volume', // Bind to volume axis
    },
    {
        type: 'line',
        xKey: 'category',
        yKey: 'price',
        xKeyAxis: 'category', // Same x-axis
        yKeyAxis: 'price', // Bind to price axis
    },
],
axes: {
    category: { type: 'category', position: 'bottom' },
    price: { type: 'number', position: 'left' },
    volume: { type: 'number', position: 'right' }, // Secondary axis
}
```

_Use for_: Multi-axis charts where different series need to be bound to different axes, or polar charts with multiple angle/radius axes.

## 🆕 Recently Added Features (Past 6 Months)

### 🔧 Global Font Theme Settings

_New Dec 2024 • Apply: 3 minutes • Impact: Low_ ❌ **GENERALLY AVOID**

```typescript
// ⚠️ ONLY use if you MUST override ALL fonts globally
// ❌ PREFER letting theme handle fonts automatically
theme: {
    params: {
        // ❌ AVOID setting fontSize - breaks theme consistency
        // ❌ AVOID setting fontWeight - unnecessary
        foregroundColor: '#333333',  // Only if absolutely needed
    }
}
```

_Note: Theme defaults are almost always better than manual font overrides_

### 🎯 Enhanced Marker Styling

_New Dec 2024 • Apply: 4 minutes • Impact: Medium_

```typescript
series: [
    {
        marker: {
            lineDash: [4, 2], // Dashed marker borders
            lineDashOffset: 2,
            // Don't set stroke - use theme colors
            strokeWidth: 2,
        },
        // Use the newer highlight options instead of deprecated highlightStyle
        highlight: {
            highlightedItem: {
                // Don't hardcode colors
                strokeWidth: 3,
            },
        },
    },
];
```

_Replaces: Simple solid marker borders, custom marker implementations_

### 📊 Zoom Aspect Ratio Control

> For base zoom setup, see `enterprise.md`. This section covers the aspect-ratio control added in Dec 2024.

_Enterprise • New Dec 2024 • Apply: 6 minutes • Impact: Medium_

```typescript
zoom: {
    enabled: true,
    enableSelecting: true,
    keepAspectRatio: true, // Maintain chart proportions during zoom selection
}
```

_Replaces: Manual aspect ratio calculations in zoom implementations_

### 🔍 Enhanced Series Visibility Events

_New Dec 2024 • Apply: 5 minutes • Impact: Low_

```typescript
listeners: {
    seriesVisibilityChange: (event) => {
        const { itemId, legendItemName, visible } = event;
        console.log(`${legendItemName} (${itemId}) is now ${visible ? 'visible' : 'hidden'}`);
    },
}
```

_Replaces: Manual series state tracking and visibility detection_

### ⚡ Field Dot Notation Control

_New Nov 2024 • Apply: 2 minutes • Impact: Medium_

```typescript
data: getData(),
suppressFieldDotNotation: true, // Improves performance for complex nested data
```

_Replaces: Manual data flattening and performance optimization workarounds_

## 📅 Previously Added Features (6-12 Months)

### 🔄 Donut Series Inner Labels

_New Aug 2024 • Apply: 8 minutes • Impact: High_

```typescript
// Replace manual center text with native inner labels
innerLabels: [
    {
        text: 'Total Sales',
        // ❌ Don't set fontSize/fontWeight - theme handles it
        // Don't set color - theme handles contrast
    },
    {
        text: '$1.2M',
        // ❌ Don't set fontSize/fontWeight - theme handles it
        // Don't set color - theme handles contrast
    },
];
```

_Replaces: Manual HTML overlays or canvas text drawing_

### 🎯 Enhanced Legend Positioning Strategy

_New Jul 2024 • Apply: 5 minutes • Impact: VERY HIGH_ ⭐

```typescript
// DECISION GUIDE FOR LEGEND POSITIONING:

// For MULTI-SERIES charts (consider floating with verification):
legend: {
    position: 'bottom', // Safe default
    // OR if space permits and verified:
    position: 'top-right',
    border: {
        enabled: true, // ALWAYS add border for floating
        strokeWidth: 1,
    },
    cornerRadius: 8,
    padding: 12,
}
```

_Replaces: Complex CSS positioning and manual legend placement_

### 🎨 Advanced Grid Line Styling

_New Jun 2024 • Apply: 6 minutes • Impact: HIGH_ ⭐ **RECOMMENDED**

```typescript
// Professional alternating bands - STRONGLY consider using this!
gridLine: {
    style: [
        {
            // Primary grid lines
            strokeWidth: 1,
            lineDash: [3, 3],
            // Don't set stroke - theme handles grid colors
        },
        {
            // Alternating background bands for visual clarity
            strokeWidth: 0, // No line, just fill
            // Don't set fill - theme provides appropriate band colors
        },
    ],
}
```

_Replaces: Manual background bands and custom grid implementations_

### 📏 Spacing vs Padding Standardization

_New May 2024 • Apply: 3 minutes • Impact: Medium_

```typescript
// Context-specific usage of spacing and padding
legend: {
    spacing: 16, // Between legend and chart
    padding: 12, // Internal legend padding
}
```

_Replaces: Inconsistent padding properties across components_

### 🔧 Enhanced Tooltip Positioning

_New Apr 2024 • Apply: 8 minutes • Impact: High_

```typescript
tooltip: {
    position: {
        anchorTo: 'pointer', // 'node', 'cursor', 'pointer'
        placement: ['top', 'bottom'], // Fallback order
        xOffset: 10,
        yOffset: -10,
        constraints: 'never-flip', // 'flip-on-overflow'
    },
    wrapping: 'hyphenate', // 'normal', 'break-word', 'anywhere'
}
```

_Replaces: Manual tooltip positioning calculations and HTML-based tooltips_

### 🎭 Pattern & Gradient Enhancements

_New Mar 2024 • Apply: 10 minutes • Impact: Medium_

```typescript
fill: {
    type: 'pattern',
    pattern: 'forward-slanted-lines', // New stock patterns
    // Don't set fill/backgroundFill - theme handles pattern colors
    scale: 1.5,
    rotation: 45,
}
```

_Replaces: Custom SVG pattern definitions and manual pattern creation_

### 📊 Crosshair Label Enhancements

> For base crosshair setup, see `enterprise.md`. This section covers label enhancements added in Feb 2024.

_Enterprise • New Feb 2024 • Apply: 7 minutes • Impact: Medium_

```typescript
crosshair: {
    label: {
        enabled: true,
        xOffset: 5,
        yOffset: -5,
        renderer: (params) => ({
            text: `${params.value}`,
            // Don't set color/backgroundColor - theme handles crosshair styling
            opacity: 0.9,
        }),
    },
}
```

_Replaces: Manual crosshair label positioning and custom hover indicators_

## 📜 Historic Feature Additions (1-2 Years)

### 🎬 Series Load Animations

_New May 2023 • Apply: 5 minutes • Impact: High_

```typescript
animation: {
    enabled: true,
    duration: 1200, // Animation duration in milliseconds
}
// Works across all series types with different entrance effects
```

_Replaces: Static chart loading and manual animation implementations_

### 📏 Axis Title Formatting

_New May 2023 • Apply: 8 minutes • Impact: Medium_

```typescript
axes: {
    y: {
        type: 'number', // Required
        position: 'left',
        title: {
            formatter: (params) => {
                const { defaultValue, boundSeries, domain } = params;
                return `${defaultValue} (${boundSeries.length} series)`;
            },
        },
    },
};
```

_Replaces: Static axis titles and manual title generation logic_

### 📐 Axis Label Rotation

_New Apr 2023 • Apply: 4 minutes • Impact: Low_

```typescript
axes: {
    x: {
        type: 'category', // Required
        position: 'bottom',
        label: {
            // ❌ Don't set fontSize - theme handles it
            rotation: 0, // Keep horizontal when possible (if needed)
            // ❌ Don't set fontFamily - breaks consistency
            // Don't set color - theme handles label colors
        },
    },
};
```

_Note: Only use rotation if labels truly overlap, otherwise leave default_

### 📊 Series Area Padding

_New Feb 2023 • Apply: 3 minutes • Impact: Medium_

```typescript
seriesAreaPadding: {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20,
}
// Provides breathing room around the chart data area
```

_Replaces: Manual margin calculations and CSS-based spacing_

### 🎯 Node Click Range Enhancement

_New Feb 2023 • Apply: 6 minutes • Impact: Medium_

```typescript
series: [
    {
        nodeClickRange: 'nearest', // 'exact', 'nearest'
        nodeClickRangeParams: {
            distance: 15, // Pixel tolerance for clicks
        },
    },
];
```

_Replaces: Complex hit-testing logic and manual click area calculations_

### 🖱️ Node Double Click Handlers

_New Mar 2023 • Apply: 7 minutes • Impact: Low_

```typescript
series: [
    {
        listeners: {
            nodeDoubleClick: (event) => {
                console.log('Double clicked:', event.datum);
                // Custom double-click behavior
            },
        },
    },
];
```

_Replaces: Manual double-click detection and timing logic_

## 🔍 Feature Discovery Process

### Quarterly Updates (Every 3 months)

1. **Analyze Recent Commits**:

```bash
# In repository root, analyze recent ag-charts-types changes
git log --format="%h %ad %s" --date=short --since="3 months ago" -- "packages/ag-charts-types/" | head -30

# Look for feature additions in community package
git log --format="%h %ad %s" --date=short --since="3 months ago" -- "packages/ag-charts-community/" | grep -E "(add|Add|new|New)" | head -20
```

2. **Feature Discovery**:
    - Examine new TypeScript interfaces in `packages/ag-charts-types/src/`
    - Focus on options that enhance visual appeal
    - Check for new series types, styling options, or interaction features
    - Identify Enterprise vs Community feature classification

3. **Validation Requirements**:
    - API Contract Compliance: Verify against TypeScript interfaces
    - API Entrypoint Accuracy: Ensure correct usage
    - Enterprise Licensing: Clearly mark features requiring commercial license
    - Working Code: Test examples work as documented

## 📝 Maintenance Notes

### When Adding New Features

Use this format:

```markdown
### 🎯 Feature Name

_New MMM YYYY • Apply: X minutes • Impact: High/Medium/Low_ _(Enterprise if applicable)_

\`\`\`typescript
// Clear, working example
const chart = AgCharts.create({
// Feature-specific properties
});
\`\`\`

_Replaces: What manual implementations this native feature can replace_
```

### Section Organization

1. **Recently Added** (0-6 months): Latest cutting-edge features
2. **Previously Added** (6-12 months): Established recent features
3. **Historic** (1-2 years): Well-established foundational features

### Review Checklist

- [ ] API Accuracy: Validated against `packages/ag-charts-types/src/`
- [ ] Correct Entrypoints: Proper API calls specified
- [ ] Enterprise Classification: Clear licensing requirements
- [ ] Implementation Times: Realistic estimates
- [ ] Impact Ratings: Based on visual enhancement
- [ ] Replacement Value: Clear description of what this replaces

## 🎯 Priority Implementation

When updating examples, prioritize:

1. **High Impact + Low Effort** features first
2. **Visual improvements** over functional additions
3. **Theme-compatible** features (no hardcoded colors)
4. **Enterprise features** when they add significant value
5. **Recent additions** to showcase latest capabilities

Remember: The goal is to demonstrate AG Charts' latest capabilities while maintaining clean, professional examples.
