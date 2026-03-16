# Data Labels

## 📊 Data Labels for Direct Value Display

_Apply: 3 minutes, Impact: HIGH for single series_ ⭐ **RECOMMENDED**

### ✅ PREFERRED: Use root-level formatters

```typescript
// Define formatter once at root level
const options = {
    formatter: {
        y: ({ value }) => `${(value / 1000).toFixed(1)}K`, // Applied everywhere
    },
    series: [
        {
            type: 'bar',
            xKey: 'category',
            yKey: 'value',
            label: {
                enabled: true,
                placement: 'outside', // 'inside' for stacked/area charts
                // Automatically uses root formatter.y
                // Don't set fontSize or color - theme handles it
            },
        },
    ],
};
```

### Only use label-specific formatters when needed:

```typescript
// Override only if this series needs different label formatting
series: [
    {
        type: 'bar',
        label: {
            enabled: true,
            // Only if different from root formatter:
            formatter: (params) => `${params.value.toFixed(0)}%`, // Specific format
        },
    },
];
```

### When to Use Data Labels

#### ✅ PERFECT FOR:

- Single series bar/column charts
- Small datasets (< 20 points)
- When exact values matter
- Executive dashboards
- Print/export scenarios

#### ⚠️ AVOID FOR:

- Dense time series (> 30 points)
- Multi-series line charts (use tooltips instead)
- Overlapping data points
- Small chart areas

## 🎯 Smart Label Placement

### Bar/Column Charts

**NOTE**: Prefer root-level formatters over nested ones - see examples above!

```typescript
// ❌ AVOID - Nested formatter (repetitive if used elsewhere)
label: {
    enabled: true,
    placement: 'outside',
    formatter: (params) => { /* ... */ },
}

// ✅ BETTER - Use root formatter.y which applies everywhere
const options = {
    formatter: {
        y: ({ value }) => {
            // Smart formatting based on magnitude
            if (Math.abs(value) >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
            if (Math.abs(value) >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
            return value.toFixed(0);
        },
    },
    series: [{
        label: {
            enabled: true,
            placement: 'outside', // Automatically uses root formatter
        },
    }],
};
```

### Stacked Charts

```typescript
// For stacked bars/columns
label: {
    enabled: true,
    placement: 'inside', // Must be inside for stacked
    minSize: 20, // Hide labels for small segments
    // Theme handles color contrast automatically
}
```

### Line/Area Charts

```typescript
// Show labels only for key points
label: {
    enabled: true,
    formatter: (params) => {
        // Only show min/max values
        const allValues = params.seriesData.map(d => d[params.yKey]);
        const value = params.value;
        const isExtreme = value === Math.max(...allValues) ||
                         value === Math.min(...allValues);
        return isExtreme ? value.toLocaleString() : '';
    },
}
```

## 📈 Advanced Label Strategies

### Conditional Display

```typescript
// Show labels only for significant values
label: {
    enabled: true,
    formatter: (params) => {
        const threshold = 10000;
        return params.value > threshold
            ? `${(params.value / 1000).toFixed(0)}K`
            : '';
    },
}
```

### Smart Abbreviation

```typescript
// Intelligent number formatting
label: {
    enabled: true,
    formatter: (params) => {
        return formatValue(params.value);
    },
}

function formatValue(value: number): string {
    const absValue = Math.abs(value);
    if (absValue >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
    if (absValue >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
    if (absValue >= 1e3) return `${(value / 1e3).toFixed(0)}K`;
    if (absValue < 1 && absValue > 0) return value.toFixed(2);
    return value.toFixed(0);
}
```

### Percentage Labels

```typescript
// For percentage-based data
label: {
    enabled: true,
    formatter: (params) => {
        const percentage = (params.value / params.sum) * 100;
        return `${percentage.toFixed(1)}%`;
    },
}
```

## 🎨 Label Styling Best Practices

### Avoid Overlap

```typescript
label: {
    enabled: true,
    avoidCollisions: true, // Automatically prevent overlap
    minSize: 15, // Hide labels that don't fit
}
```

### Rotation for Dense Labels

```typescript
// Only for horizontal bar charts with long labels
label: {
    enabled: true,
    rotation: -90, // Vertical labels
    placement: 'outside',
}
```

## 📊 Chart-Specific Patterns

### Waterfall Charts

```typescript
label: {
    enabled: true,
    placement: 'outside',
    formatter: (params) => {
        const sign = params.value >= 0 ? '+' : '';
        return `${sign}${params.value.toLocaleString()}`;
    },
}
```

### Pie/Donut Charts

```typescript
label: {
    enabled: true,
    minAngle: 5, // Hide labels for tiny slices
    formatter: (params) => {
        const percentage = (params.value / params.sum) * 100;
        return percentage > 5 ? `${percentage.toFixed(0)}%` : '';
    },
}
```

### Scatter Plots

```typescript
// Label only outliers or specific points
label: {
    enabled: true,
    formatter: (params) => {
        // Label points of interest
        const datum = params.datum;
        return datum.isOutlier ? datum.name : '';
    },
}
```

## ⚠️ Performance Considerations

### Label Density Guidelines

```typescript
// Calculate appropriate label display
const dataPointCount = data.length;
const chartWidth = 800; // Approximate
const pointsPerPixel = dataPointCount / chartWidth;

// Decision logic
const labelConfig = {
    enabled: pointsPerPixel < 0.05, // Show if sparse enough
    // Alternative: show every Nth label
    formatter: (params) => {
        return params.index % Math.ceil(pointsPerPixel * 20) === 0 ? params.value.toLocaleString() : '';
    },
};
```

## 📋 Implementation Checklist

Before adding data labels:

- [ ] Dataset has < 30 points (or using selective display)
- [ ] Values are important enough to show directly
- [ ] No overlap issues at target resolution
- [ ] Formatting is appropriate for data type
- [ ] Performance impact is acceptable
- [ ] Works with both themes
- [ ] Mobile/responsive view considered

## 🎯 Quick Decision Guide

```typescript
// For most cases, use this approach:
const shouldUseLabels = dataPoints.length <= 20 && !isMultiSeries && chartType !== 'line';

const labelConfig = shouldUseLabels
    ? {
          enabled: true,
          placement: 'outside',
          formatter: (params) => formatValue(params.value),
      }
    : undefined;
```

## Common Anti-Patterns to Avoid

### ❌ DON'T: Label everything

```typescript
// WRONG - Creates visual chaos
label: {
    enabled: true, // On 100+ point time series
}
```

### ✅ DO: Be selective

```typescript
// RIGHT - Show only key values
label: {
    enabled: true,
    formatter: (params) => {
        // Only peaks and valleys
        return isLocalExtreme(params) ? params.value : '';
    },
}
```

### ❌ DON'T: Use long decimals

```typescript
// WRONG
formatter: (params) => params.value.toString(); // "12345.678901234"
```

### ✅ DO: Format appropriately

```typescript
// RIGHT
formatter: (params) => params.value.toFixed(1); // "12345.7"
```

## Priority by Chart Type

### High Priority

- Single series bar/column charts
- Waterfall charts
- Small pie/donut charts
- KPI cards

### Medium Priority

- Stacked charts (inside placement)
- Bubble charts (selective)
- Gantt charts (task names)

### Low Priority

- Multi-series line charts
- Dense scatter plots
- Time series with many points
- Area charts

## Integration with Other Features

Data labels work best when combined with:

- **Axis formatting**: Consistent number formatting
- **Tooltips**: Details on hover, summary in labels
- **Reference lines**: Context for labeled values
- **Animations**: Smooth label appearance

Remember: Less is more with data labels. When in doubt, use tooltips instead.
