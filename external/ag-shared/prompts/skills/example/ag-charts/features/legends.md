# Legend Features

## 🎯 Legend Positioning Strategy

_Apply: 3 minutes, Impact: HIGH_ ⭐ **RECOMMENDED**

### Decision Tree for Legend Placement

```typescript
// 1. DEFAULT: Bottom position for most charts
legend: {
    position: 'bottom',
}

// 2. FLOATING: Only when space permits and data won't be obscured
legend: {
    position: 'top-right',  // or 'top-left' if right side has data
    maxWidth: 200,          // Constrain to prevent overflow
}

// 3. HIDDEN: For single series or when labels are sufficient
legend: {
    enabled: false,
}
```

### When to Use Each Position

#### Bottom Position (DEFAULT - 80% of cases)

- ✅ Multi-series charts with 2-8 series
- ✅ When horizontal space is available
- ✅ Standard business dashboards
- ✅ Safe choice that always works

#### Floating Positions (USE WITH CAUTION - 15% of cases)

- ✅ Large charts with ample whitespace
- ✅ When data doesn't reach chart edges
- ✅ Minimal series count (2-3 max)
- ⚠️ MUST verify no data overlap with screenshots

#### Right Position (RARE - 5% of cases)

- ✅ Very narrow charts
- ✅ When vertical space is premium (consider removing footnotes first before using right position)
- ✅ Long series names that need room

## ⚠️ CRITICAL: Floating Legend Verification

```typescript
// MANDATORY verification process for floating legends:

// Step 1: Apply floating legend
legend: {
    position: 'top-right',
    maxWidth: 200,
}

// Step 2: Take screenshot and verify
await puppeteer_screenshot({ name: 'floating-legend-check' });

// Step 3: Check these specific areas:
// - Top-right corner data points
// - Peak values that might extend upward
// - Axis labels and titles
// - Tooltip appearance near legend

// Step 4: If ANY overlap detected → REVERT to bottom
legend: {
    position: 'bottom',  // Safe fallback
}
```

## 📊 Advanced Legend Configuration

### Interactive Legend with Hover Effects

```typescript
legend: {
    position: 'bottom',
    item: {
        label: {
            // Don't set fontSize or fontFamily
            maxLength: 20,  // Truncate long names
        },
        marker: {
            size: 15,  // Slightly larger for better visibility
            strokeWidth: 0,  // Clean look
        },
    },
    spacing: 20,  // Better separation between items
    pagination: {
        marker: {
            size: 10,
        },
    },
}
```

### 🆕 Context-Aware Legend Formatters (b12.2.0)

_Apply: 5 minutes, Impact: MEDIUM_

```typescript
// Use context parameter for data-aware legend labels
legend: {
    position: 'bottom',
    item: {
        label: {
            formatter: (params) => {
                const { seriesId, itemId, value, datum, context } = params;

                // Access context data if provided
                if (context?.totalValue) {
                    const percentage = ((datum?.value / context.totalValue) * 100).toFixed(1);
                    return `${value} (${percentage}%)`;
                }

                // Format based on series-specific logic
                if (seriesId === 'revenue') {
                    return `${value}: $${(datum?.total / 1000000).toFixed(1)}M`;
                }

                return value; // Default formatting
            },
        },
    },
}
```

### Use Cases for Context in Legend

- **Percentage display**: Show relative values in legend
- **Aggregate information**: Display totals or averages
- **Dynamic formatting**: Adjust based on data characteristics
- **Custom metadata**: Include business-specific context
- **Replaces**: Manual legend generation with custom HTML

### Legend for Complex Multi-Series Charts

```typescript
// For charts with many series (6+)
legend: {
    position: 'bottom',
    orientation: 'horizontal',  // Better use of space
    maxHeight: 60,              // Prevent excessive height
    pagination: {
        enabled: true,          // Enable pagination for many items
    },
    item: {
        toggleSeriesVisible: true,  // Click to show/hide series
        label: {
            maxLength: 15,      // Shorter labels for space
        },
    },
}
```

### 🏷️ Shared Legend Items (Post b12.2.0)

_Apply: 4 minutes, Impact: MEDIUM_

```typescript
series: [
    {
        type: 'range-area',
        xKey: 'month',
        yLowKey: 'low',
        yHighKey: 'high',
        legendItemName: 'Projected Range',
    },
    {
        type: 'line',
        xKey: 'month',
        yKey: 'forecast',
        legendItemName: 'Projected Range', // Shares toggle with the range band
    },
];

listeners: {
    legendItemClick: ({ itemId, legendItemName, enabled }) => {
        console.log(`Legend '${legendItemName}' toggled`, { itemId, enabled });
    },
};
```

### Why this matters

- Coordinate multiple visual encodings (band + line) under a single legend toggle.
- `legendItemName` now flows through legend events, making cross-chart sync trivial.
- Avoid duplicate legend rows by grouping related series logically.

## 🎨 Legend Styling Best Practices

### Shape and Size Optimization

```typescript
legend: {
    item: {
        marker: {
            shape: 'square',     // Better for bar charts
            // or 'circle' for line charts
            size: 12,           // Standard size
            strokeWidth: 0,     // Clean appearance
        },
        paddingX: 16,          // Horizontal spacing
        paddingY: 8,           // Vertical spacing
    },
}
```

### Responsive Legend for Different Chart Types

#### Line Charts

```typescript
legend: {
    position: 'bottom',
    item: {
        marker: {
            shape: 'circle',
            size: 8,
        },
    },
}
```

#### Bar/Column Charts

```typescript
legend: {
    position: 'bottom',
    item: {
        marker: {
            shape: 'square',
            size: 12,
        },
    },
}
```

#### Scatter/Bubble Charts

```typescript
legend: {
    position: 'right',  // Often better for scatter
    item: {
        marker: {
            shape: 'circle',
            size: 10,
        },
    },
}
```

## 🚫 Common Legend Mistakes to Avoid

### ❌ DON'T: Float without verification

```typescript
// WRONG - No verification
legend: {
    position: 'top-right',
}
```

### ✅ DO: Verify floating legends

```typescript
// RIGHT - With verification
legend: {
    position: 'top-right',
    maxWidth: 200,  // Constrain size
}
// Then take screenshot and verify no overlap
```

### ❌ DON'T: Use floating for dense data

```typescript
// WRONG - Will likely overlap data
// For time series with 100+ points
legend: {
    position: 'top-left',  // Data will reach here!
}
```

### ✅ DO: Use bottom for dense data

```typescript
// RIGHT - Safe position
legend: {
    position: 'bottom',
}
```

## 📋 Legend Implementation Checklist

Before implementing floating legend:

- [ ] Chart has significant whitespace in target corner
- [ ] Data points don't reach chart edges
- [ ] Maximum values leave room at top
- [ ] Series count is minimal (2-3)
- [ ] Screenshot taken to verify placement
- [ ] No overlap with any chart element confirmed
- [ ] Tooltips tested near legend area
- [ ] Different viewport sizes checked

If ANY check fails → Use `position: 'bottom'`

## 🎯 Quick Decision Guide

```typescript
// For 90% of cases, this is all you need:
const legendConfig = {
    position: 'bottom', // Safe, professional, always works
    item: {
        toggleSeriesVisible: true, // Interactive
    },
};

// Only consider floating if:
// 1. Chart has tons of empty space
// 2. You've verified with screenshots
// 3. PREVis score improves
// 4. No data/label overlap exists
```

## Legend Priority by Chart Type

### High Priority (Always configure)

- Multi-series line charts
- Grouped bar charts
- Stacked area charts
- Combination charts

### Medium Priority (Configure if helpful)

- Scatter plots with categories
- Bubble charts with groups
- Pie/donut with many slices

### Low Priority (Often not needed)

- Single series charts
- Simple bar charts with labeled axes
- Charts with direct labels

## Important Notes

- **Never hardcode colors** in legend configuration
- **Always verify floating positions** with screenshots
- **Default to bottom position** when in doubt
- **Minimize footnotes first** - Before using right position for vertical space, consider removing non-essential footnotes
- **Test legend interaction** (clicking to hide/show series)
- **Consider mobile viewports** for responsive design
