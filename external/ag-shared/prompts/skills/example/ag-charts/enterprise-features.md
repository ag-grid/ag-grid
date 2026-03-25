# AG Charts — Enterprise vs Community Features

Use this to determine whether an example needs the enterprise or community package.

## Feature Matrix

| Category | Enterprise-only | Community |
|----------|----------------|-----------|
| **Series** | box-plot, candlestick, ohlc, heatmap, range-area, range-bar, waterfall, funnel, cone-funnel, nightingale, radar-area, radar-line, radial-bar, radial-column, map-shape, map-line, map-marker, pyramid, linear-gauge, radial-gauge, sunburst, treemap, chord, sankey | bar, line, area, scatter, bubble, pie, donut, histogram |
| **Axes** | ordinal-time, angle-category, angle-number, radius-category, radius-number | number, log, time, unit-time, category, grouped-category |
| **Plugins** | annotations, zoom, navigator, scrollbar, crosshair, animation, context-menu, toolbar, sync, ranges, gradient-legend, error-bars, data-source | legend, locale |
| **Presets** | financial charts (price-volume), gauge | sparkline |

**Rule of thumb:** If it's a specialised chart type (financial, statistical, hierarchical, geographic) or an interactive plugin (zoom, annotations, navigator), it's enterprise.

## Import Patterns

### Enterprise — Single import (re-exports all community modules)

```typescript
import {
    AgCartesianChartOptions,
    AgCharts,
    AnimationModule,
    BarSeriesModule,
    ModuleRegistry,
} from 'ag-charts-enterprise';
```

### Community

```typescript
import {
    AgCartesianChartOptions,
    AgCharts,
    BarSeriesModule,
    ModuleRegistry,
} from 'ag-charts-community';
```

**Never mix imports** from both `ag-charts-community` and `ag-charts-enterprise`.

## UMD / CDN (Plunker context)

### Community
```html
<script src="https://cdn.jsdelivr.net/npm/ag-charts-community@13.0.0/dist/umd/ag-charts-community.js"></script>
```

### Enterprise
```html
<script src="https://cdn.jsdelivr.net/npm/ag-charts-enterprise@13.0.0/dist/umd/ag-charts-enterprise.js"></script>
```

The community bundle will **silently skip** enterprise features — no errors, just missing functionality.

## Decision Logic

1. Does the example use any enterprise-only series type? → Enterprise
2. Does the example use any enterprise axis (ordinal-time, angle-*, radius-*)? → Enterprise
3. Does the example use any enterprise plugin (zoom, navigator, annotations, etc.)? → Enterprise
4. Otherwise → Community

## Plugin Examples vs Financial Chart Preset

**Enterprise plugins** (`ranges`, `zoom`, `navigator`, `annotations`, `toolbar`, `scrollbar`, etc.) work on **ordinary cartesian charts** created with `AgCharts.create()`. They are _not_ tied to the financial chart preset.

Use `AgCharts.createFinancialChart()` **only** when the example specifically demonstrates the **financial chart preset** itself — i.e. candlestick/OHLC price-volume layout, the `rangeButtons` convenience flag, or the built-in financial toolbar.

| Scenario | Creation method |
|----------|----------------|
| Demonstrating `ranges`, `zoom`, `navigator` on a line/bar/area chart | `AgCharts.create()` |
| Demonstrating the financial price-volume preset, OHLC/candlestick series | `AgCharts.createFinancialChart()` |

> **Common mistake:** The `ranges` plugin is listed under Plugins, not Presets. A "range buttons" feature on a line chart uses `AgCharts.create()` with `ranges: { ... }` in the options — not `createFinancialChart()`.
