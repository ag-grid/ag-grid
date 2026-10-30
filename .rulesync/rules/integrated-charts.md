---
targets: ['*']
description: 'Integrated Charts: establishing effective AG Charts option values, testing the format panel, and escalating suspected AG Charts bugs'
globs: ['packages/ag-grid-enterprise/src/charts/**/*.ts', 'testing/behavioural/src/charts/**/*.ts']
---

# Integrated Charts

The format panel binds each widget to an AG Charts option by **string expression**, resolved at runtime against the chart's processed options. Nothing in that path is type-checked, so an option AG Charts has renamed, moved, or left unset yields a control that silently reads the wrong value, writes nothing, or both.

## Establishing what the chart actually renders

An option's effective value is whatever the live chart resolves it to. The processed options are not that value: they carry only what the theme configures, so anything left at an AG Charts property default is absent from them.

- Probe a **live chart** through the behavioural harness (`TestGridsManager` → `api.createRangeChart` → `await chartRef.chart.waitForUpdate()`) and read the value off the chart. In descending order of preference: the processed options, then `series[].properties`, then `properties.toJson()` for a value a series inherits from a sibling, then whichever subsystem owns it (`ctx.legendManager.getData()` for legend symbols).
- **Do not read `node_modules/ag-charts-*/dist` to decide what a value is,** and do not infer it from a `??` default found there. Such a fallback fires only when the caller supplies nothing, which is the uncommon case — the value usually arrives from the series.
- **Effective values are frequently per-series.** A chart-wide control can only honestly show a value every series agrees on: the agreed value, or blank when they differ. Verify across chart families (column, line, scatter, pie, polar, statistical), never from a single chart type.
- Reads of AG Charts internals are declared on `AgChartActual` in `chartComp/utils/integration.ts` and used through it, never via an inline cast.

## Masking to be aware of

Several helpers substitute a plausible value for a missing read, which turns a broken binding into a control that merely looks correct: `getDefaultSliderParams` coerces with `?? 0`, `addEnableParams` with `?? false`, and `FontPanel` invents a font family, weight, and style. A control displaying one of these proves nothing about the binding behind it.

## Testing the format panel

- Widget values are **not queryable through `document`** in the headless behavioural environment. Assert them by instrumenting the `ChartMenuParamsFactory` factory methods and reading `params.value` once the panel has built — panels amend the params object after the factory returns, so the recorded object holds the final value.
- The `format-panel-options-*.test.ts` suites walk every binding on every chart type and are the gate for this class of drift. They share `formatPanelOptions.ts`, and take a chart family each so the 37 chart builds run in parallel.

## Suspected AG Charts bugs

This repo holds only the grid side of Integrated Charts. Rendering, layout, axes, series, legend, tooltips and animation belong to AG Charts, which cannot be fixed from here. Before changing `packages/ag-grid-enterprise/src/charts/`, establish which side owns the defect:

- Capture the options the grid hands AG Charts (`chartRef.chart.getOptions()` on the live chart, or `window.agChartsDebug = 'opts'`) and check they are what the grid intends. If they are wrong, the bug is the grid's: fix it here.
- If the options are right and the chart still renders wrongly, the bug is AG Charts'. **Do not work around it in the grid** with option overrides, post-processing or reads of chart internals: that hides the defect from the Charts team and breaks when AG Charts changes.

To escalate a Charts bug:

1. Build a standalone AG Charts Plunker from the captured options, with no grid bundle, pinned to the `ag-charts-*` version in `packages/ag-grid-enterprise/package.json`. Follow `/ag-product:plunker` (its `integrated-to-standalone.md` covers the integrated-only options and data shape). Confirm the Plunker shows the same defect; if it does not, the grid is involved after all, so compare what differs before concluding either way.
2. Hand back to a human instead of opening a PR. In the AI Workflow pipeline, end with `escalate-to-human`. Include the Plunker, the options at fault, and expected versus actual output, so the ticket can be moved to the Charts team or linked to a Charts ticket.
