# Enterprise Features

## 🏢 Enterprise-Specific Capabilities

Enterprise features require `import { AgCharts } from 'ag-charts-enterprise'` and a valid license.

## 🎯 Crosshairs & Highlighting

_Apply: 8 minutes, Impact: MEDIUM_ ⭐ **RECOMMENDED for data-heavy charts**

### Basic Crosshairs

```typescript
axes: {
    y: {
        type: 'number', // Required field
        position: 'left',
        crosshair: {
            enabled: true,
            label: {
                enabled: true,
                // Don't set color - theme handles it
            },
        },
    },
    x: {
        type: 'category', // Required field
        position: 'bottom',
        crosshair: {
            enabled: true,
        },
    },
};
```

### Advanced Crosshair Configuration

```typescript
crosshair: {
    enabled: true,
    snap: true, // Snap to data points
    strokeWidth: 1,
    lineDash: [5, 5],
    label: {
        enabled: true,
        xOffset: 5,
        yOffset: -5,
        renderer: (params) => ({
            text: formatValue(params.value),
            // Don't set color/backgroundColor - theme handles it
            opacity: 0.9,
        }),
    },
}
```

## 🔍 Zoom & Pan

_Apply: 5 minutes, Impact: HIGH for large datasets_ ⭐ **ESSENTIAL for time series**

### Basic Zoom

```typescript
zoom: {
    enabled: true,
    enableAxisDragging: true, // Drag on axes to zoom
    enablePanning: true, // Pan after zooming
    enableSelecting: true, // Box selection zoom
}
```

### Advanced Zoom with Aspect Ratio

```typescript
zoom: {
    enabled: true,
    enableSelecting: true,
    keepAspectRatio: true, // Maintain chart proportions
    panKey: 'shift', // Hold shift to pan
    axes: 'x', // Restrict to x-axis only
}
```

## 🧭 Navigator with Mini-Charts

_Apply: 8 minutes, Impact: VERY HIGH for time series_ ⭐⭐ **MANDATORY for long time series**

### Full Navigator Setup

```typescript
navigator: {
    enabled: true,
    height: 60,
    miniChart: {
        enabled: true,
        series: [
            {
                type: 'area',
                xKey: 'date',
                yKey: 'value',
                // Don't set fill/stroke - theme handles it
                fillOpacity: 0.3,
            },
        ],
    },
    mask: {
        // Don't set fill - theme handles mask colors
        fillOpacity: 0.1,
    },
    min: 0.3, // Default visible range (30%)
    max: 0.7, // Default visible range (70%)
}
```

## 📈 Financial Chart Presets

_Apply: 10 minutes, Impact: VERY HIGH for financial data_ ⭐⭐ **USE FOR ALL FINANCIAL DATA**

### Complete Financial Chart

```typescript
import { AgCharts } from 'ag-charts-enterprise';

// Use specialized API for financial charts
const chart = AgCharts.createFinancialChart({
    container: document.getElementById('myChart'),
    data: stockData,
    chartType: 'candlestick', // 'hollow-candlestick', 'ohlc', 'line'
    dateKey: 'date',
    openKey: 'open',
    highKey: 'high',
    lowKey: 'low',
    closeKey: 'close',
    volumeKey: 'volume',

    // Built-in features
    navigator: true, // Time range selection
    ranges: {
        buttons: [
            '1W',
            '1M',
            { type: 'fixed', count: 90, label: '90D' },
            { type: 'callback', label: 'YTD', callback: ({ setRange }) => setRange('yearToDate') },
        ],
    },
    statusBar: true, // Shows OHLC values
    volume: true, // Volume chart below main chart

    // Professional styling
    theme: 'ag-financial-dark', // or 'ag-financial'
    // ✅ Note: Financial charts automatically position price axis on right (industry standard)
});
```

_Tip_: Tailor `ranges.buttons` to match analyst workflows (earnings windows, YTD, custom callbacks) instead of relying on the default presets.

## 📊 Advanced Annotations

_Apply: 20 minutes, Impact: HIGH for analysis_ ⭐ **POWERFUL for technical analysis**

### Interactive Annotation Toolbar

```typescript
annotations: {
    enabled: true,
    initial: [], // Pre-configured annotations
    toolbar: {
        enabled: true,
        position: 'top',
        buttons: [
            'line',
            'horizontal-line',
            'vertical-line',
            'parallel-channel',
            'text',
            'shape',
            'measure',
            'fibonacci-retracement',
            'trend-line',
        ],
    },
}
```

### Programmatic Annotations

```typescript
annotations: {
    enabled: true, // Make annotations visible.
    toolbar: {
        enabled: false, // Don't show UI buttons for adding more annotations.
    },
},
initialState: {
    annotations: [
        {
            type: 'line',
            xStart: 'Q1 2024',
            yStart: 100000,
            xEnd: 'Q4 2024',
            yEnd: 150000,
            text: {
                label: 'Growth Trend',
                position: 'center',
            },
            strokeWidth: 2,
            lineDash: [8, 4],
            locked: true, // Don't allow editing of this annotation.
        },
        {
            type: 'text',
            x: 'Q2 2024',
            y: 120000,
            text: 'Product Launch',
            // Don't set color - theme handles it
            locked: true, // Don't allow editing of this annotation.
        },
    ],
}
```

## 🗺️ Geographic Visualizations

_Apply: 15 minutes, Impact: VERY HIGH for regional data_ ⭐⭐ **IMPRESSIVE for executive dashboards**

### Map Shape Series

```typescript
import { worldMapData } from './map-data';

// Your topology data

series: [
    {
        type: 'map-shape',
        topology: worldMapData,
        idKey: 'countryCode',
        idName: 'countryName',

        // Data binding
        data: salesByCountry,
        colorKey: 'revenue',
        colorRange: ['lightblue', 'darkblue'], // Semantic colors
        colorName: 'Revenue',

        // Interactivity
        highlight: {
            highlightItem: {
                item: {
                    strokeWidth: 2,
                },
            },
        },

        // Labels
        label: {
            enabled: true,
            // Don't set fontSize or color
        },

        // Tooltips
        tooltip: {
            renderer: (params) => ({
                title: params.datum.countryName,
                data: [
                    { label: 'Revenue', value: `$${params.datum.revenue.toLocaleString()}` },
                    { label: 'Growth', value: `${params.datum.growth}%` },
                ],
            }),
        },
    },
];
```

## 🔄 Multi-Chart Synchronization

_Apply: 7 minutes, Impact: HIGH for dashboards_ ⭐ **ESSENTIAL for multi-chart dashboards**

### Synchronized Charts

```typescript
// Chart 1 - Main metrics
const chart1 = AgCharts.create({
    // ... chart config
    sync: {
        enabled: true,
        groupId: 'dashboard-metrics',
        axes: 'x', // Sync x-axis
        nodeInteraction: true, // Sync hover
        zoom: true, // Sync zoom/pan
    },
});

// Chart 2 - Secondary metrics (automatically synced)
const chart2 = AgCharts.create({
    // ... chart config
    sync: {
        enabled: true,
        groupId: 'dashboard-metrics', // Same group
    },
});
```

## 📏 Error Bars

_Apply: 6 minutes, Impact: HIGH for scientific data_ ⭐ **PROFESSIONAL for research data**

### Complete Error Bar Configuration

```typescript
series: [
    {
        type: 'line',
        xKey: 'x',
        yKey: 'y',
        yName: 'Measurement',

        errorBar: {
            visible: true,
            yLowerKey: 'yMin', // Lower bound
            yUpperKey: 'yMax', // Upper bound

            // Can also use symmetric errors
            // yErrorKey: 'yError', // ± error value

            strokeWidth: 1,
            // Don't set stroke - theme handles it

            cap: {
                visible: true,
                length: 6,
                lengthRatio: 0.3, // Relative to marker size
                strokeWidth: 1,
            },

            // Whiskers (lines connecting caps)
            whisker: {
                strokeWidth: 1,
                lineDash: [2, 2],
            },
        },
    },
];
```

## 📊 Gauge Charts

_Apply: 10 minutes, Impact: HIGH for KPIs_ ⭐ **PERFECT for executive KPIs**

### Radial Gauge

```typescript
import { AgCharts } from 'ag-charts-enterprise';

const gauge = AgCharts.createGauge({
    container: document.getElementById('myChart'),
    type: 'radial-gauge',
    value: 75,
    min: 0,
    max: 100,

    // Visual configuration
    startAngle: -90,
    endAngle: 90,

    // Bands for ranges
    bands: [
        { from: 0, to: 50, color: 'red', label: 'Poor' },
        { from: 50, to: 80, color: 'yellow', label: 'Good' },
        { from: 80, to: 100, color: 'green', label: 'Excellent' },
    ],

    // Needle configuration
    needle: {
        enabled: true,
        strokeWidth: 2,
        length: 0.8, // 80% of radius
    },

    // Labels
    label: {
        enabled: true,
        formatter: (params) => `${params.value}%`,
    },

    // Center text
    innerText: [{ text: 'Performance' }, { text: '75%' }],
});
```

## 🔀 Sankey Diagrams

_Apply: 12 minutes, Impact: VERY HIGH for flow visualization_ ⭐⭐ **EXCELLENT for process flows**

### Complete Sankey Configuration

```typescript
series: [
    {
        type: 'sankey',
        sort: 'descending',
        fromKey: 'source',
        toKey: 'target',
        sizeKey: 'value',

        // Node configuration
        node: {
            width: 20,
            spacing: 30,
            minSpacing: 12,
            alignment: 'justify', // 'left', 'right', 'center', 'justify'
            verticalAlignment: 'center',
            label: {
                enabled: true,
                placement: 'right',
                edgePlacement: 'outside',
                // Don't set fontSize or color
            },
        },

        // Link configuration
        link: {
            // Don't set fill - theme handles gradient colors
            fillOpacity: 0.5,
            highlight: {
                highlightItem: {
                    item: {
                        fillOpacity: 0.8,
                        strokeWidth: 1,
                    },
                },
            },
            itemStyler: ({ size }) => (size > 1_000 ? { strokeWidth: 2 } : {}),
        },

        // Tooltips
        tooltip: {
            renderer: (params) => {
                if (params.type === 'node') {
                    return {
                        title: params.datum.id,
                        data: [{ label: 'Total', value: params.datum.value }],
                    };
                } else {
                    return {
                        title: `${params.datum.source} → ${params.datum.target}`,
                        data: [{ label: 'Flow', value: params.datum.value }],
                    };
                }
            },
        },
    },
];
```

## 🎯 Feature Priority by Use Case

### Financial/Trading Applications

1. **Financial chart presets** - MANDATORY
2. **Navigator** - MANDATORY
3. **Crosshairs** - HIGHLY RECOMMENDED
4. **Annotations** - RECOMMENDED
5. **Zoom & Pan** - RECOMMENDED

### Executive Dashboards

1. **Gauge charts** - HIGHLY RECOMMENDED
2. **Map visualizations** - HIGHLY RECOMMENDED
3. **Multi-chart sync** - RECOMMENDED
4. **Navigator** - RECOMMENDED

### Scientific/Research

1. **Error bars** - MANDATORY
2. **Crosshairs** - HIGHLY RECOMMENDED
3. **Zoom & Pan** - HIGHLY RECOMMENDED
4. **Annotations** - RECOMMENDED

### Process/Flow Analysis

1. **Sankey diagrams** - MANDATORY
2. **Annotations** - RECOMMENDED
3. **Interactive features** - RECOMMENDED

## ⚠️ Enterprise License Note

All features in this module require:

```typescript
import { AgCharts } from 'ag-charts-enterprise';

// License key must be set before creating charts
AgCharts.setLicenseKey('your-license-key');
```

Without a valid license, these features will display a watermark or may not function.
