# Reference Lines & Annotations

## 📊 Reference Lines for Context

_Apply: 5 minutes, Impact: HIGH_ ⭐ **RECOMMENDED for data with targets/thresholds**

### Basic Reference Line

```typescript
// Add context with reference lines (averages, targets, thresholds)
initialState: {
    annotations: [
        {
            type: 'line',
            yValue: 75000, // Target or threshold value
            text: {
                label: 'Q4 Target',
                position: 'end',
                alignment: 'left',
                // Don't set fontSize or color - theme handles it
            },
            strokeWidth: 2,
            lineDash: [6, 4],
            // Don't set stroke color - theme provides it
        },
    ],
}
```

### Why Reference Lines Matter

- Provides instant context for data interpretation
- Shows performance against targets/benchmarks
- Highlights critical thresholds
- Guides viewer attention to important values
- Creates professional, analytical appearance

## 📈 Advanced Reference Line Patterns

### Multiple Reference Lines with Different Styles

```typescript
initialState: {
    annotations: [
        {
            type: 'line',
            yValue: averageValue, // Calculated average
            text: {
                label: 'Average',
                position: 'center',
            },
            strokeWidth: 1,
            lineDash: [4, 4],
        },
        {
            type: 'line',
            yValue: targetValue, // Business target
            text: {
                label: 'Target',
                position: 'end',
            },
            strokeWidth: 2,
            lineDash: [8, 4],
        },
        {
            type: 'line',
            yValue: criticalThreshold, // Critical threshold
            text: {
                label: 'Critical',
                position: 'start',
            },
            strokeWidth: 3,
            // Solid line for critical values
        },
    ],
}
```

### Dynamic Reference Lines Based on Data

```typescript
// Calculate reference values from your data
const data = getData();
const values = data.map(d => d.value);
const average = values.reduce((a, b) => a + b, 0) / values.length;
const percentile90 = calculatePercentile(values, 90);

initialState: {
    annotations: [
        {
            type: 'line',
            yValue: average,
            text: {
                label: `Avg: ${average.toFixed(0)}`,
                position: 'end',
            },
            strokeWidth: 1,
            lineDash: [4, 4],
        },
        {
            type: 'line',
            yValue: percentile90,
            text: {
                label: '90th Percentile',
                position: 'end',
            },
            strokeWidth: 2,
            lineDash: [8, 4],
        },
    ],
}
```

## 🎯 Reference Bands (Ranges)

_Apply: 6 minutes, Impact: HIGH for range-based analysis_

```typescript
// Highlight acceptable ranges or zones
initialState: {
    annotations: [
        {
            type: 'area',
            yValues: [60000, 80000], // Acceptable range
            label: {
                text: 'Target Range',
                position: 'top-right',
                // Don't set fontSize
            },
            // Don't set fill - theme provides appropriate opacity
        },
    ],
}
```

## 📍 Text Annotations

_Apply: 4 minutes, Impact: MEDIUM for storytelling_

```typescript
// Add contextual notes to specific data points
initialState: {
    annotations: [
        {
            type: 'text',
            xValue: 'Q2 2024',
            yValue: 95000,
            text: 'Product Launch',
            // Don't set fontSize or color
        },
        {
            type: 'text',
            xValue: 'Q4 2024',
            yValue: 120000,
            text: 'Holiday Peak',
        },
    ],
}
```

## 🔄 Combining Annotations for Maximum Impact

```typescript
// Professional annotation setup combining multiple types
initialState: {
    annotations: [
        {
            type: 'line',
            yValue: yearlyTarget,
            text: {
                label: `${new Date().getFullYear()} Target`,
                position: 'end',
            },
            strokeWidth: 2,
            lineDash: [8, 4],
        },
        {
            type: 'area',
            yValues: [minAcceptable, maxAcceptable],
            label: {
                text: 'Acceptable Range',
                position: 'top-left',
            },
        },
        {
            type: 'text',
            xValue: significantDate,
            yValue: significantValue,
            text: 'Key Event',
        },
    ],
}
```

## 📊 Use Cases by Industry

### Financial/Sales

```typescript
initalState: {
    annotations: [
        { type: 'line', yValue: breakEvenPoint, text: { label: 'Break Even' } },
        { type: 'line', yValue: profitTarget, text: { label: 'Profit Target' } },
    ],
}
```

### Manufacturing/Quality

```typescript
initialState: {
    annotations: [
        { type: 'line', yValue: upperControlLimit, text: { label: 'UCL' } },
        { type: 'line', yValue: lowerControlLimit, text: { label: 'LCL' } },
        { type: 'line', yValue: centerLine, text: { label: 'CL' } },
    ],
}
```

### Performance Monitoring

```typescript
initialState: {
    annotations: [
        { type: 'line', yValue: slaThreshold, text: { label: 'SLA: 99.9%' } },
        { type: 'area', yValues: [warningLower, warningUpper], label: { text: 'Warning Zone' } },
    ],
}
```

## ⚠️ Best Practices

### Do's

- ✅ Use reference lines for important thresholds/targets
- ✅ Calculate dynamic values from actual data
- ✅ Keep labels concise and meaningful
- ✅ Use different line styles for visual hierarchy
- ✅ Position labels to avoid data overlap

### Don'ts

- ❌ Add too many lines (3-4 maximum)
- ❌ Use hardcoded colors
- ❌ Set fontSize or fontFamily
- ❌ Create visual clutter
- ❌ Overlap with critical data points

## 🎨 Visual Hierarchy Guidelines

```typescript
// Order of visual importance (strokeWidth and style)
initialState: {
    annotations: [
        // Most important - solid, thick
        { type: 'line', strokeWidth: 3, text: { label: 'Critical' } },

        // Important - dashed, medium
        { type: 'line', strokeWidth: 2, lineDash: [8, 4], text: { label: 'Target' } },

        // Context - dotted, thin
        { type: 'line', strokeWidth: 1, lineDash: [2, 2], text: { label: 'Average' } },
    ],
}
```

## 📋 Implementation Checklist

Before adding reference lines:

- [ ] Identified meaningful thresholds/targets in data
- [ ] Calculated dynamic values where appropriate
- [ ] Limited to 3-4 lines maximum
- [ ] Varied line styles for hierarchy
- [ ] Positioned labels to avoid overlap
- [ ] Tested with both light/dark themes
- [ ] Verified no color hardcoding
- [ ] Checked visual clarity at different scales

## Quick Decision Tree

1. **Does data have targets/thresholds?** → Add reference lines
2. **Need to show acceptable ranges?** → Add reference bands
3. **Important events to highlight?** → Add text annotations
4. **Comparing to average/baseline?** → Add calculated reference line
5. **Multiple comparison points?** → Use visual hierarchy (thickness/dash)

## Common Patterns

### Business Dashboard

```typescript
// Sales dashboard with target and average
initialState: {
    annotations: [
        { yValue: monthlyTarget, text: { label: 'Monthly Target' }, strokeWidth: 2 },
        { yValue: rollingAverage, text: { label: '3-Month Avg' }, strokeWidth: 1, lineDash: [4, 4] },
    ],
}
```

### Time Series with Events

```typescript
// Market data with significant events
initialState: {
    annotations: [
        { type: 'line', yValue: openingPrice, text: { label: 'Open' } },
        { type: 'text', xValue: eventDate, yValue: eventPrice, text: 'Earnings Release' },
    ],
}
```

### Quality Control Chart

```typescript
// Control chart with limits
initialState: {
    annotations: [
        { type: 'line', yValue: ucl, text: { label: 'UCL' }, strokeWidth: 1, lineDash: [4, 4] },
        { type: 'line', yValue: mean, text: { label: 'Mean' }, strokeWidth: 2 },
        { type: 'line', yValue: lcl, text: { label: 'LCL' }, strokeWidth: 1, lineDash: [4, 4] },
    ],
}
```
