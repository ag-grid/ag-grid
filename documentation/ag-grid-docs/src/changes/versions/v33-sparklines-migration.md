Sparklines are now rendered by AG Charts, so `sparklineOptions` (passed to `agSparklineCellRenderer` via `cellRendererParams`) now uses the AG Charts `AgSparklineOptions` type, imported from `ag-charts-community` or `ag-charts-enterprise`. Update each option as follows.

**Series type and orientation**

- `type: 'column'` no longer exists. Use `type: 'bar'` with `direction: 'vertical'`.
- `type: 'bar'` now defaults to `direction: 'vertical'` (vertical bars). Previously `type: 'bar'` produced horizontal bars, so to keep horizontal bars set `direction: 'horizontal'` explicitly.

**Per-type style objects**

- The per-type style sub-objects (e.g. `line: { stroke, strokeWidth }`) are removed. Set these properties directly on `sparklineOptions` instead (`stroke`, `strokeWidth`, `fill`, etc.).

**Per-item styling**

- `marker.formatter` is removed. For line and area sparklines use `marker.itemStyler`; for bar sparklines use the top-level `itemStyler`.
- `highlightStyle` is removed. Style the highlighted state with an `itemStyler`, which receives a `highlighted` flag in its params.

**Tooltips**

- A tooltip `renderer` returning `color`, `backgroundColor` or `opacity` no longer changes the tooltip appearance. Style the tooltip with CSS instead.
- `tooltip.xOffset` and `tooltip.yOffset` are removed. Position the tooltip with CSS.
- `tooltip.container` is removed; AG Charts manages tooltip placement.

**Axis and value domain**

- `valueAxisDomain: [min, max]` is removed. Use the top-level `min` and `max` properties.
- `paddingInner` and `paddingOuter` are removed from the top level; set them on the axis configuration (`axis.paddingInner` / `axis.paddingOuter`).

**Labels**

- `label.placement` values have changed: use `inside-start` (was `insideBase`), `inside-center` (was `center`), `inside-end` (was `insideEnd`) and `outside-end` (was `outsideEnd`).

**Other**

- The top-level `container` option is removed.

For the full option reference see the [Sparklines API](https://www.ag-grid.com/javascript-data-grid/sparklines-api-sparkline-options/) and the AG Charts [bar](https://www.ag-grid.com/charts/javascript/bar-series/), line and area series options.
