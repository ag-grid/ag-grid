# Axes Features

## 🌈 Axis Bands & Grid Fills

_Apply: 6 minutes, Impact: VERY HIGH_ ⭐ **STRONGLY RECOMMENDED**

### Basic Configuration

```typescript
// Add visual depth with alternating background bands
axes: {
    y: {
        type: 'number', // ⚠️ REQUIRED - axes.*.type must always be specified
        position: 'left',
        gridLine: {
            style: [
                {
                    // Don't set stroke/fill colors - theme handles them
                    strokeWidth: 1,
                    lineDash: [2, 2],
                },
                {
                    // Alternating bands - theme provides appropriate colors
                    strokeWidth: 0, // No grid line
                },
            ],
        },
    },
};
```

### Why this matters

- Creates visual rhythm and improves data readability
- Helps users track values across the chart
- Adds professional polish without being distracting
- Works perfectly with dark/light mode themes

## ✨ Axis Band Highlighting

_Apply: 4 minutes, Impact: HIGH_ ⭐ **RECOMMENDED**

### Configuration

```typescript
// Add interactive hover highlighting to axis bands
axes: {
    x: {
        type: 'category', // ⚠️ REQUIRED - always specify axes.*.type
        position: 'bottom',
        bandHighlight: {
            enabled: true,
            // Don't set fill - theme provides appropriate highlight color
        },
    },
};
```

### Visual Benefits

- Provides instant visual feedback on hover
- Helps users focus on specific data points
- Creates a more interactive, engaging experience
- Particularly effective for bar/column charts with category axes
- Works seamlessly with axis bands for layered visual depth

## 🏷️ Axis Label Formatting & Styling

_Apply: 5 minutes, Impact: High_

### ✅ PREFERRED: Root-level formatters (DRY approach)

```typescript
// Define formatters once at the root level
const options = {
    formatter: {
        y: ({ value }) => `$${(value / 1000).toFixed(0)}K`, // Applied to all y-values
        x: ({ value }) =>
            value.toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric',
            }), // Applied to all x-values (dates)
    },
    axes: {
        y: {
            type: 'number', // ⚠️ REQUIRED field
            position: 'left',
            // Automatically uses root formatter.y
        },
        x: {
            type: 'time', // ⚠️ REQUIRED field
            position: 'bottom',
            // Automatically uses root formatter.x
        },
    },
    series: [
        // All series labels and tooltips also use root formatters
    ],
};
```

### Only use axis-specific formatters when they differ:

```typescript
axes: {
    y: {
        type: 'number', // ⚠️ REQUIRED field
        position: 'left',
        label: {
            // Only override if this axis needs different formatting
            formatter: (params) => `${params.value}%`, // Specific to percentage axis
        },
    },
};
```

### 🎨 NEW: Axis Label Item Styler (b12.2.0)

_Apply: 6 minutes, Impact: MEDIUM_

```typescript
// Style specific axis labels based on value or position
axes: {
    y: {
        type: 'number', // ⚠️ REQUIRED field
        position: 'left',
        label: {
            itemStyler: (params) => {
                const { value, formattedValue } = params;

                // Emphasize baseline (0) or target values
                if (value === 0) {
                    return {
                        fontWeight: 'bold',
                        // Don't set color - theme handles contrast
                    };
                }

                // Highlight target thresholds
                if (value === 100000) {
                    return {
                        fontWeight: 'bold',
                        fontSize: 14, // Slightly larger for targets
                        // Don't set color - theme handles it
                    };
                }

                return {}; // Default styling for other labels
            },
        },
    },
};
```

### Use Cases for Label Stylers

- **Emphasize key values**: Zero baseline, targets, thresholds
- **Visual hierarchy**: Make important values stand out
- **Context-aware styling**: Different styles for different value ranges
- **Replaces**: Complex DOM manipulation or custom label rendering

## 🪄 Rich Text Axis Labels (Post b12.2.0)

_Apply: 6 minutes, Impact: HIGH_

```typescript
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
        title: {
            formatter: ({ defaultValue }) => [
                { text: defaultValue, fontWeight: 'bold' },
                { text: ' (local time)', opacity: 0.7 },
            ],
        },
    },
};
```

### Why this matters

- Return `TextOrSegments` arrays to combine emphasis and supporting text without HTML overlays.
- Works for axis labels, axis titles, navigator mini-chart labels, captions, and series label callbacks.
- Keep styling subtle—use opacity or font weight tweaks rather than manual colors to preserve theme contrast.

## ✚ Axis Cross Positioning (Post b12.2.0)

_Apply: 5 minutes, Impact: MEDIUM_

```typescript
axes: {
    y: {
        type: 'number',
        position: 'left',
        crossAt: {
            value: 0,
            sticky: true, // Keep the horizontal axis locked to domain 0
        },
    },
    x: {
        type: 'time',
        position: 'bottom',
        crossAt: {
            value: new Date('2025-01-01'),
        },
    },
};
```

### When to use crossAt

- Quadrant or centre-origin charts where axes should intersect at a specific domain value.
- Mixed-scale dashboards that require aligning axes to meaningful thresholds (e.g. baseline zero).
- Sticky origins remove the need for manual padding tweaks when data updates.

## 📐 Snug Data Fitting with `nice: false`

_Apply: 2 minutes, Impact: Medium_

```typescript
// For continuous axes (number, time, log), control axis range padding
axes: {
    y: {
        type: 'number', // ⚠️ REQUIRED field
        position: 'left',
        nice: false, // ✅ Data fits exactly to min/max (no padding)
        // Default nice: true adds padding for round numbers
    },
    x: {
        type: 'time', // ⚠️ REQUIRED field
        position: 'bottom',
        nice: false, // ✅ Time scale starts/ends at data boundaries
        // Useful for showing exact date ranges
    },
};
```

### When to use `nice: false`

- ✅ When you want the axis to start/end exactly at your data boundaries
- ✅ For time series that should show a specific date range
- ✅ When showing percentages that should end at exactly 100%
- ✅ For tightly controlled visualizations where padding looks awkward

### When to keep `nice: true` (default)

- ✅ Most financial/business charts benefit from round numbers
- ✅ When axis labels should be "nice" values (0, 50, 100 vs 0, 47, 94)
- ✅ For better readability with clean axis tick values

## 🎯 Preferred Min/Max (Soft Bounds)

_New Nov 2024 • Apply: 3 minutes • Impact: MEDIUM_

```typescript
axes: {
    y: {
        type: 'number', // ⚠️ REQUIRED field
        position: 'left',
        preferredMin: 0, // Soft lower bound - can be extended by data or nice
        preferredMax: 100, // Soft upper bound - can be extended by data or nice
        // These are "preferred" values that will be used unless:
        // - Data extends beyond them
        // - nice: true rounds beyond them
    },
}
```

**Difference from `min`/`max`:**

- `min`/`max`: Hard bounds that take priority - axis will never go beyond these values
- `preferredMin`/`preferredMax`: Soft bounds that can be extended by data or `nice` option

**When to use `preferredMin`/`preferredMax`:**

- ✅ When you want a suggested range but allow data to extend beyond it
- ✅ For axes where you want to start near zero but allow negative values if data has them
- ✅ When `nice: true` should be able to round beyond your preferred bounds

**When to use `min`/`max` instead:**

- ✅ When you need strict bounds that must never be exceeded
- ✅ For percentage axes that must stay 0-100
- ✅ When you need guaranteed axis limits regardless of data

## 📏 Axis Enhancement

_Apply: 10 minutes, Impact: HIGH_

```typescript
axes: {
    y: {
        type: 'number', // ⚠️ REQUIRED field
        position: 'left',
        nice: false, // ✅ Data fits snugly to scale (no extra padding)
        title: {
            text: 'Revenue ($M)', // ❌ Don't set fontSize
            // Theme handles all font properties
        },
        label: {
            // ❌ Don't set fontSize - theme handles it
            formatter: (params) => `$${params.value}M`,
        },
        gridLine: { style: [{ lineDash: [2, 3] }] }, // Don't set stroke color
        tick: { width: 1 }, // Don't set stroke color
    },
    x: {
        type: 'category', // ⚠️ REQUIRED field
        position: 'bottom',
        bandHighlight: {
            enabled: true,
            // Don't set fill - theme provides the color
        },
        label: {
            rotation: 45, // Angle labels if really needed
            // ❌ Don't set fontSize
        },
    },
};
```

## 🎨 Advanced Grid Line Styling

_Apply: 6 minutes, Impact: HIGH_ ⭐ **RECOMMENDED**

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
    ];
}

// Even more sophisticated with multiple styles:
gridLine: {
    style: [
        { strokeWidth: 2 }, // Major grid lines (every 5th)
        { strokeWidth: 0 }, // Subtle bands
        { strokeWidth: 1, lineDash: [2, 2] }, // Minor grid lines
    ];
}

// BEST PRACTICE: Combine with bandHighlight for maximum impact
axes: {
    x: {
        type: 'category', // ⚠️ REQUIRED field
        position: 'bottom',
        gridLine: {
            style: [
                { strokeWidth: 1, lineDash: [2, 2] },
                { strokeWidth: 0 }, // Background bands
            ],
        },
        bandHighlight: {
            enabled: true,
        },
    },
};
```

### Visual Impact

Axis bands dramatically improve chart readability by:

- Creating visual lanes that guide the eye
- Making it easier to estimate values between grid lines
- Adding depth without cluttering the data
- Working seamlessly with all themes and dark mode

### Combined with bandHighlight

Creates a layered visual experience where:

- Static bands provide consistent visual structure
- Hover highlighting adds interactive feedback
- Users can easily track and compare values
- Professional appearance suitable for dashboards

## Common Axis Configuration Patterns

### Financial Charts

```typescript
axes: {
    y: {
        type: 'number',
        position: 'left',
        label: {
            formatter: (params) => `$${(params.value / 1e6).toFixed(1)}M`,
        },
        gridLine: {
            style: [
                { strokeWidth: 1, lineDash: [2, 2] },
                { strokeWidth: 0 }, // Bands
            ],
        },
    },
};
```

### Financial Chart Axis Positioning Convention

_Apply: 2 minutes, Impact: VERY HIGH for financial data_ ⭐⭐ **INDUSTRY STANDARD**

For financial and monetary data, follow standard industry conventions:

```typescript
axes: {
    y: {
        type: 'number',
        position: 'right', // ✅ PREFERRED for price/monetary values
        label: {
            formatter: (params) => `$${(params.value / 1e6).toFixed(1)}M`,
        },
        title: {
            text: 'Price ($)',
        },
        gridLine: {
            style: [
                { strokeWidth: 1, lineDash: [2, 2] },
                { strokeWidth: 0 }, // Background bands
            ],
        },
    },
    x: {
        type: 'time',
        position: 'bottom',
        // Date/time axis configuration
    },
};
```

### Why right-side positioning for financial data:

- **Industry standard convention** (Bloomberg, Reuters, trading platforms)
- **Users expect price values on the right** - matches professional tools
- **Aligns with reading direction** for price movements and trends
- **Consistent with financial charting tools** users are familiar with
- **Better for dual-axis charts** where volume often goes on the left

### When to use right-side Y-axis:

✅ **Stock prices, currency values, trading data**  
✅ **Financial performance metrics (revenue, profit)**  
✅ **Economic indicators and market data**  
✅ **Any chart where the primary value represents money/price**

### When to keep left-side positioning:

✅ **Non-financial numerical data** (counts, percentages, measurements)  
✅ **Charts with mixed data types** where money is secondary  
✅ **Legacy charts** that users are accustomed to reading on the left

### Time Series

```typescript
axes: {
    x: {
        type: 'time',
        position: 'bottom',
        nice: false, // Exact date range
        label: {
            formatter: (params) => {
                const date = params.value;
                return date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                });
            },
        },
    },
};
```

### Category Axes with Many Items

```typescript
axes: {
    x: {
        type: 'category',
        position: 'bottom',
        bandHighlight: { enabled: true },
        label: {
            rotation: 45, // Only if labels overlap
            autoRotate: true, // Automatic rotation when needed
        },
    },
};
```

### 📋 Grouped Category Axis Label Options

_New Nov 2024 • Apply: 4 minutes • Impact: MEDIUM_

```typescript
axes: {
    x: {
        type: 'grouped-category',
        position: 'bottom',
        label: {
            wrapping: 'on-space', // 'always' | 'hyphenate' | 'on-space' | 'never'
            truncate: true, // Add ellipsis when text is truncated
        },
    },
}
```

**Wrapping Options:**

- `'always'`: Always wrap text to fit within `maxWidth`
- `'hyphenate'`: Similar to `'always'`, but inserts a hyphen (`-`) if forced to wrap mid-word
- `'on-space'` (default): Only wrap on whitespace. If no space available and `maxWidth` can't be satisfied, text will be truncated
- `'never'`: Disable text wrapping

**Truncate:**

- When `truncate: true`, text that exceeds available space will be truncated with an ellipsis (`...`)
- Works in combination with `wrapping` - if wrapping can't fit the text, truncation applies

**Use Cases:**

- ✅ Long category names that need to fit in limited space
- ✅ Multi-level grouped categories where labels can be lengthy
- ✅ Responsive charts where label space varies

## ⚠️ Special Considerations for Radial/Polar Charts

### Keep It Clean!

Radial and polar charts can quickly become cluttered. Follow these guidelines:

```typescript
// ❌ AVOID - Too many axis elements in radial charts
axes: {
    angle: {
        type: 'angle-category',
        gridLine: { enabled: true, style: [...] }, // Often clutters
        label: { enabled: true, formatter: ... },  // Can overlap
        crossLines: [...],                          // Usually overkill
    },
    radius: {
        type: 'radius-number',
        gridLine: { enabled: true },               // Multiple circles can overwhelm
        label: { enabled: true },                  // Often unnecessary
    },
};

// ✅ BETTER - Minimal, focused approach
axes: {
    angle: {
        type: 'angle-category',
        gridLine: { enabled: false },              // Clean look
        label: {
            enabled: true,                         // Only if essential
            // Keep labels short to avoid overlap
        },
    },
    radius: {
        type: 'radius-number',
        gridLine: {
            enabled: true,
            style: [{ strokeWidth: 1 }],           // Subtle single style
        },
        label: { enabled: false },                 // Often not needed
    },
};
```

### Guidelines for Radial/Polar Charts:

- **Default to minimal**: Start with no grid lines or labels, add only if needed
- **Avoid cross lines**: They rarely add value in circular coordinates
- **Limit grid circles**: Too many concentric circles create visual noise
- **Consider removing axis labels**: The data itself often provides sufficient context
- **Maximize visualization space**: Avoid footnotes unless absolutely essential (circular layouts already have constrained vertical space)
- **Use tooltips instead**: Let tooltips provide precise values rather than cluttering with labels

## Important Notes

- **Always specify `type`**: This is a required field for all axes
- **Never hardcode colors**: Let the theme handle all color properties
- **Avoid font overrides**: Don't set fontSize, fontWeight, or fontFamily
- **Test with both themes**: Ensure bands and highlights work in light/dark mode
- **For radial/polar charts**: Less is more - minimize axis decorations and avoid non-essential footnotes
