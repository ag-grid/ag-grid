# Theme Overrides Best Practices

## 🎨 When to Use Theme Overrides

Use `theme.overrides` to avoid repetition and improve maintainability when multiple series or axes share identical configuration.

## ✅ GOOD: Using Theme Overrides for Shared Config

### Series Configuration

```typescript
// When all series share visual properties
theme: {
    overrides: {
        bar: {
            series: {
                cornerRadius: 4,
                strokeWidth: 1,
                label: {
                    enabled: true,
                },
            },
        },
    },
},
series: [
    { type: 'bar', xKey: 'x', yKey: 'y1', yName: 'Series 1' },
    { type: 'bar', xKey: 'x', yKey: 'y2', yName: 'Series 2' },
    // Series automatically inherit cornerRadius, strokeWidth, and label config
]
```

### ❌ AVOID: Repeating Config

```typescript
// Repetitive and harder to maintain
series: [
    {
        type: 'bar',
        xKey: 'x',
        yKey: 'y1',
        cornerRadius: 4, // ❌ Repeated
        strokeWidth: 1, // ❌ Repeated
        label: { enabled: true }, // ❌ Repeated
    },
    {
        type: 'bar',
        xKey: 'x',
        yKey: 'y2',
        cornerRadius: 4, // ❌ Repeated
        strokeWidth: 1, // ❌ Repeated
        label: { enabled: true }, // ❌ Repeated
    },
];
```

## 📊 Common Use Cases

### 1. Series Styling

```typescript
theme: {
    overrides: {
        bar: {
            series: {
                cornerRadius: 4,
                strokeWidth: 1
            }
        },
        line: {
            series: {
                strokeWidth: 2,
                marker: {
                    enabled: true,
                    size: 6
                }
            }
        },
        area: {
            series: {
                fillOpacity: 0.7,
                strokeWidth: 2
            }
        },
    },
}
```

### 2. Axis Configuration

```typescript
// Note: Axes typically configured directly, not through overrides
axes: {
    x: {
        type: 'category', // Required field
        position: 'bottom',
        bandHighlight: { enabled: true },
        // Don't set label fontSize - theme handles it
    },
    y: {
        type: 'number', // Required field
        position: 'left',
        gridLine: {
            style: [
                { strokeWidth: 1, lineDash: [2, 2] },
                { strokeWidth: 0 }, // Bands
            ],
        },
    },
};
```

### 3. Complex Shared Behaviors

```typescript
theme: {
    overrides: {
        bar: {
            series: {
                itemStyler: ({ datum, yKey }) => ({
                    fillOpacity: calculateOpacity(datum[yKey]),
                }),
                label: {
                    formatter: ({ value }) => formatValue(value),
                },
            },
        },
    },
}
```

## 🎯 Decision Criteria

### When to Use Theme Overrides ✅

- **3+ series/axes** share identical configuration
- **Consistent visual styling** across chart elements
- **Centralized formatter/styler functions**
- **Improved maintainability** and readability

### When NOT to Use Theme Overrides ❌

- **Series-specific data bindings** (xKey, yKey, yName)
- **Only 1-2 elements** share config (not worth the indirection)
- **One-off custom behaviors** specific to a single series
- **Simple examples** where clarity is more important

## 🔧 Root-Level Formatters

### Preserve Existing Formatters

If an example already has a root-level `formatter`, enhance rather than remove it:

```typescript
// If example already has this:
formatter: (params) => {
    return params.value.toLocaleString();
};

// Enhance it instead of removing:
formatter: (params) => {
    const { value, type } = params;

    if (type === 'number') {
        // Add abbreviations for large numbers
        if (Math.abs(value) >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
        if (Math.abs(value) >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
        return value.toLocaleString();
    }

    return String(value);
};
```

**Preferred style:** Use the object syntax `formatter: { y: ..., x: ... }` as documented in `quality-rules.md`. The function syntax `formatter: (params) => ...` is supported but less consistent across axes/labels/tooltips.

### Root-Level Format Configuration

```typescript
// Good - consistent formatting across all chart elements
formatter: (params) => {
    const { value, property, type } = params;

    if (type === 'number') {
        if (property === 'y') return `$${value.toLocaleString()}`;
        if (property === 'x') return value.toFixed(1);
        return value.toLocaleString();
    }

    if (type === 'date') {
        const date = value as Date;
        return date.toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric'
        });
    }

    return String(value);
}

// Or use property-specific formatters
formatter: {
    y: (params) => `$${params.value.toLocaleString()}`,
    x: (params) => params.value.toFixed(1),
    label: (params) => `${params.value}%`,
}

// Need richer text? Return segments via RichFormatter-compatible callbacks
formatter: {
    y: ({ value }) => [
        { text: value >= 0 ? '+' : '', fontWeight: 'bold' },
        { text: value.toFixed(1) },
        { text: ' %', opacity: 0.6 },
    ],
}
```

## 📏 Significant Figures Guidelines

### Appropriate Precision

```typescript
// Good - appropriate precision based on context
formatter: (params) => {
    const { value, type, property } = params;

    if (type === 'number') {
        // Currency values - 2 decimals
        if (property === 'y' && params.source === 'axis-label') {
            return `$${value.toFixed(2)}`;
        }

        // Percentages - 1 decimal
        if (property === 'size' || property === 'angle') {
            return `${(value * 100).toFixed(1)}%`;
        }

        // General numbers - 1 decimal or locale formatting
        if (Math.abs(value) >= 1000) {
            return value.toLocaleString(undefined, {
                maximumFractionDigits: 1,
            });
        }

        return value.toFixed(1);
    }

    return String(value);
};

// Avoid - too many decimals
label: {
    formatter: (params) => params.value.toFixed(6);
} // Unnecessary precision
```

### Precision Guidelines

- **3-4 significant figures** for most business data
- **Avoid redundant precision** (e.g., "$1,234.5678" → "$1,235")
- **Match precision to context**:
    - Financial: 2 decimal places for currency
    - Percentages: 1 decimal place typically sufficient
    - Scientific: Match the measurement precision

## 🎨 Theme Parameter Usage

### When Custom Palette is Required

```typescript
// Only customize palette when specific colors are required
theme: {
    palette: {
        // These will be automatically adjusted for dark mode
        fills: ['blue', 'green', 'orange'],    // ✅ Theme handles adaptation
        strokes: ['darkblue', 'darkgreen', 'darkorange'],

        // For traffic-light scales with clear good/bad direction:
        // fills: ['green', 'yellow', 'red'],  // ✅ Green = good, Red = bad
    }
}

// NEVER do this:
series: [
    { fill: '#4285f4' },                       // ❌ Hardcoded
    { fill: '#34a853' },                       // ❌ Won't adapt
]
```

## 📋 Implementation Strategy

### Step 1: Identify Repetition

Look for properties repeated across 3+ elements:

- Corner radius
- Stroke width
- Label configuration
- Formatters
- Markers

### Step 2: Extract to Overrides

Move common properties to theme.overrides:

```typescript
theme: {
    overrides: {
        [seriesType]: {
            series: {
                // Common properties here
            }
        }
    }
}
```

### Step 3: Keep Specific Config

Leave series-specific properties in place:

- Data bindings (xKey, yKey)
- Names and titles
- Unique behaviors

### Step 4: Test Thoroughly

Verify that:

- All series inherit correctly
- No visual changes occur
- Theme switching still works
- Dark mode compatibility maintained

## ⚠️ Important Notes

- **Don't override fonts**: Let themes handle typography
- **Don't set colors**: Theme handles all color properties
- **Test both themes**: Ensure overrides work in light/dark mode
- **Keep it simple**: Don't over-engineer for small examples

## 🎯 Quick Reference

```typescript
// Template for common overrides
theme: {
    overrides: {
        // Bar series defaults
        bar: {
            series: {
                cornerRadius: 4,
                strokeWidth: 1,
                label: { enabled: true },
            },
        },
        // Line series defaults
        line: {
            series: {
                strokeWidth: 2,
                marker: {
                    enabled: true,
                    size: 6,
                },
            },
        },
        // Area series defaults
        area: {
            series: {
                fillOpacity: 0.7,
                strokeWidth: 2,
            },
        },
    },
}
```

Remember: Theme overrides are about **reducing repetition**, not adding complexity. Use them when they make the code cleaner and more maintainable.
