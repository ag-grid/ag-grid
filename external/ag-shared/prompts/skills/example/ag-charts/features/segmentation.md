# Series Segmentation Features

## 📊 Visual Value Segmentation

_Apply: 8-12 minutes • Impact: HIGH_ ⭐ **RECOMMENDED FOR VALUE-BASED VISUALIZATIONS**

Series segmentation allows you to style different portions of a series based on axis values, creating powerful visual thresholds and ranges without complex data manipulation.

## ✨ Bar Series Segmentation

### Basic Value-Based Segmentation

```typescript
series: [
    {
        type: 'bar',
        xKey: 'month',
        yKey: 'sales',
        segmentation: {
            enabled: true,
            key: 'y', // Segment based on y-axis values
            segments: [
                {
                    start: 0,
                    stop: 50000,
                    // Theme automatically applies different colors
                    // Don't hardcode colors - let theme handle it
                },
                {
                    start: 50000,
                    stop: 100000,
                    // Another theme color for mid-range values
                },
                {
                    start: 100000,
                    // High values get distinct theme styling
                    // Extends to domain maximum
                },
            ],
        },
    },
];
```

### Why This Matters

- **Visual thresholds**: Instantly communicate performance levels
- **No data splitting**: One series, multiple visual segments
- **Theme-aware**: Works perfectly with light/dark themes
- **Clean implementation**: Replaces complex itemStyler logic

## 📈 Line Series Segmentation

### Time-Based Segmentation

```typescript
series: [
    {
        type: 'line',
        xKey: 'date',
        yKey: 'value',
        segmentation: {
            enabled: true,
            key: 'x', // Segment based on x-axis (time)
            segments: [
                {
                    start: new Date('2024-01-01'),
                    stop: new Date('2024-06-30'),
                    strokeWidth: 2,
                    lineDash: [4, 2], // Historical data dashed
                },
                {
                    start: new Date('2024-07-01'),
                    stop: new Date('2024-12-31'),
                    strokeWidth: 3,
                    // Current period solid and bolder
                },
                {
                    start: new Date('2025-01-01'),
                    strokeWidth: 2,
                    lineDash: [2, 2], // Projected data dotted
                },
            ],
        },
    },
];
```

### Use Cases

- **Historical vs Current**: Differentiate time periods
- **Actual vs Projected**: Show data confidence levels
- **Seasonal patterns**: Highlight specific time ranges

## 🏔️ Area Series Segmentation

### Performance Zone Segmentation

```typescript
series: [
    {
        type: 'area',
        xKey: 'quarter',
        yKey: 'revenue',
        segmentation: {
            enabled: true,
            key: 'y',
            segments: [
                {
                    start: 0,
                    stop: 1000000,
                    // Below target - theme applies warning color
                    fillOpacity: 0.3,
                },
                {
                    start: 1000000,
                    stop: 2000000,
                    // On target - theme applies success color
                    fillOpacity: 0.5,
                },
                {
                    start: 2000000,
                    // Above target - theme applies accent color
                    fillOpacity: 0.7,
                },
            ],
        },
    },
];
```

## 🎯 Best Practices

### DO's ✅

- **Use for meaningful thresholds**: Performance targets, warning levels, etc.
- **Let theme handle colors**: Never hardcode fill/stroke colors
- **Consider accessibility**: Use opacity/patterns alongside colors
- **Keep segments logical**: 3-5 segments maximum for clarity

### DON'Ts ❌

- **Don't over-segment**: Too many segments reduce clarity
- **Don't hardcode colors**: Breaks theme compatibility
- **Don't segment without purpose**: Only when it adds meaning
- **Don't mix segment types**: Keep x or y consistent per series

## 📋 When to Use Segmentation

### Perfect For:

1. **Performance dashboards**: Show targets and thresholds
2. **Time-based analysis**: Historical vs current vs projected
3. **Risk visualization**: Green/amber/red zones
4. **Comparative analysis**: Below/at/above average
5. **Trend indication**: Growth phases

### Not Suitable For:

- Simple data visualization without thresholds
- Charts with many series (becomes visually complex)
- Mobile-first designs (segments may be too subtle)

## 🔄 Migration from ItemStyler

### Before (Complex ItemStyler):

```typescript
// ❌ OLD WAY - Complex and repetitive
itemStyler: (params) => {
    const { datum, yValue } = params;
    if (yValue < 50000) {
        return { fill: '#ff6b6b' }; // Hardcoded color
    } else if (yValue < 100000) {
        return { fill: '#feca57' }; // Another hardcoded color
    }
    return { fill: '#48dbfb' }; // Yet another hardcoded color
};
```

### After (Clean Segmentation):

```typescript
// ✅ NEW WAY - Clean and theme-aware
segmentation: {
    enabled: true,
    key: 'y',
    segments: [
        { start: 0, stop: 50000 },
        { start: 50000, stop: 100000 },
        { start: 100000 }
    ]
}
```

## 🚀 Advanced Combinations

### Segmentation + Patterns (Enterprise)

```typescript
segmentation: {
    enabled: true,
    key: 'y',
    segments: [
        {
            start: 0,
            stop: 50000,
            fill: {
                type: 'pattern',
                pattern: 'diagonal-lines',
                // Theme handles pattern colors
            }
        },
        {
            start: 50000,
            // Solid fill for normal range
        }
    ]
}
```

## 📝 Implementation Checklist

When implementing segmentation:

- [ ] Identify meaningful value thresholds
- [ ] Choose appropriate segment key (x or y)
- [ ] Define 3-5 clear segments maximum
- [ ] Remove any hardcoded colors
- [ ] Test with both light and dark themes
- [ ] Verify segment boundaries align with business logic
- [ ] Consider adding legend or annotation for segment meanings

## 🎨 Visual Impact

Segmentation transforms flat charts into information-rich visualizations that immediately communicate:

- Performance against targets
- Risk levels
- Time-based phases
- Value distributions
- Trend changes

This feature is particularly powerful for executive dashboards and analytical applications where quick visual assessment is critical.
