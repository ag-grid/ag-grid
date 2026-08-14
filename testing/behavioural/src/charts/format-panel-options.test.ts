import { AgChartsEnterpriseModule } from 'ag-charts-enterprise';

import type { ChartType, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, setupAgTestIds } from 'ag-grid-community';
import { CellSelectionModule, IntegratedChartsModule, PivotModule, RowGroupingModule } from 'ag-grid-enterprise';

import { ChartMenuParamsFactory } from '../../../../packages/ag-grid-enterprise/src/charts/chartComp/menu/chartMenuParamsFactory';
import { FontPanel } from '../../../../packages/ag-grid-enterprise/src/charts/chartComp/menu/format/fontPanel';
import type { ChartOptionsProxy } from '../../../../packages/ag-grid-enterprise/src/charts/chartComp/services/chartOptionsService';
import { ChartOptionsService } from '../../../../packages/ag-grid-enterprise/src/charts/chartComp/services/chartOptionsService';
import { canSwitchDirection } from '../../../../packages/ag-grid-enterprise/src/charts/chartComp/utils/seriesTypeMapper';
import { TestGridsManager, canvasPolyfill } from '../test-utils';

/**
 * The format panel binds each of its widgets to an AG Charts option by *string expression*, resolved at
 * runtime against `chart.chartOptions.processedOptions`. Nothing in that path is type-checked, so an
 * option AG Charts has renamed or moved leaves a control that silently reads nothing, writes nothing, or
 * both. These tests exercise every binding on every chart type to catch that drift.
 */

type WidgetKind = 'colour' | 'number' | 'slider' | 'boolean' | 'select' | 'enable' | 'value' | 'font';

interface Widget {
    /** Which `ChartOptionsService` proxy the binding goes through, e.g. `getCartesianAxisOptionsProxy(xAxis)`. */
    scope: string;
    expression: string;
    kind: WidgetKind;
    /** For selects, the values the dropdown offers - the only legal things to write. */
    choices?: unknown[];
    /** Sliders flagged `isArray` write `[value]`, so a probe has to match that shape. */
    isArray?: boolean;
    proxy: ChartOptionsProxy;
    /** The params object handed to the widget. Panels may still amend it after the factory returns. */
    params: { value?: unknown };
}

const PROXY_FACTORY_METHODS = [
    'getChartThemeOverridesProxy',
    'getAxisThemeOverridesProxy',
    'getCartesianAxisOptionsProxy',
    'getCartesianAxisThemeOverridesProxy',
    'getCartesianAxisAppliedThemeOverridesProxy',
    'getPolarAxisThemeOverridesProxy',
    'getSeriesOptionsProxy',
] as const;

/**
 * Widget factories that resolve their own value. The two `addValueParams` wrappers are listed so the
 * widget kind is known; while one is on the stack the inner `addValueParams` must not record a second,
 * less specific entry for the same expression.
 */
const WRAPPER_FACTORIES: [string, WidgetKind][] = [
    ['getDefaultColorPickerParams', 'colour'],
    ['getDefaultNumberInputParams', 'number'],
];

const LEAF_FACTORIES: [string, WidgetKind][] = [
    ['getDefaultSliderParams', 'slider'],
    ['getDefaultCheckboxParams', 'boolean'],
    ['getDefaultToggleParams', 'boolean'],
    ['getDefaultSelectParams', 'select'],
    ['addValueParams', 'value'],
    ['addEnableParams', 'enable'],
];

/**
 * A panel may resolve a value the option itself doesn't hold, in which case the binding is doing its job.
 * `getDefaultSliderParams` masks a missing read with `?? 0` and `addEnableParams` with `?? false`, so a
 * widget still showing the masked value proves nothing - anything else was put there by the panel.
 */
function hasRecoveredValue(widget: Widget): boolean {
    const { value } = widget.params;
    // `fontStyle` has no widget of its own - the weight/style select folds it into its options and falls
    // back to `normal`, which is the default AG Charts itself applies, so the control agrees with the chart.
    if (widget.kind === 'font' && widget.expression.endsWith('.fontStyle')) {
        return true;
    }
    if (value == null || value === '') {
        return false;
    }
    if (widget.kind === 'slider') {
        return value !== '0';
    }
    return widget.kind !== 'enable';
}

interface Instrumentation {
    widgets: Widget[];
    setRecording(recording: boolean): void;
    restore(): void;
}

/**
 * Records every option the tool panels bind a widget to, tagged with the widget's kind and holding onto
 * both the proxy and the params object. The kind is what makes a type-correct write probe possible: a
 * slider means a number, a select carries its own legal values.
 *
 * Must be installed before the chart is created - `GridChartComp` builds the chart-level and axis-level
 * proxies while constructing the chart, long before any panel is opened.
 */
function instrumentPanels(): Instrumentation {
    const widgets: Widget[] = [];
    const scopes = new Map<ChartOptionsProxy, string>();
    const originals: [any, string, any][] = [];
    let recording = false;
    let insideWrapper = 0;

    for (const method of PROXY_FACTORY_METHODS) {
        const original = ChartOptionsService.prototype[method] as (...args: any[]) => ChartOptionsProxy;
        originals.push([ChartOptionsService.prototype, method, original]);
        (ChartOptionsService.prototype as any)[method] = function (...args: any[]): ChartOptionsProxy {
            const proxy = original.apply(this, args);
            const scopeArgs = args.filter((arg) => typeof arg === 'string');
            scopes.set(proxy, `${method}(${scopeArgs.join(',')})`);
            return proxy;
        };
    }

    const record = (
        factory: ChartMenuParamsFactory,
        expression: string,
        kind: WidgetKind,
        args: any[],
        params: any
    ) => {
        const proxy = (factory as any).chartOptionsProxy as ChartOptionsProxy;
        const choices = kind === 'select' && Array.isArray(args[2]) ? args[2].map((o: any) => o?.value) : undefined;
        const isArray = kind === 'slider' && args[3] === true;
        widgets.push({ scope: scopes.get(proxy) ?? 'unknown', expression, kind, choices, isArray, proxy, params });
    };

    for (const [method, kind] of WRAPPER_FACTORIES) {
        const original = (ChartMenuParamsFactory.prototype as any)[method];
        originals.push([ChartMenuParamsFactory.prototype, method, original]);
        (ChartMenuParamsFactory.prototype as any)[method] = function (...args: any[]) {
            ++insideWrapper;
            let params;
            try {
                params = original.apply(this, args);
            } finally {
                --insideWrapper;
            }
            if (recording && typeof args[0] === 'string') {
                record(this, args[0], kind, args, params);
            }
            return params;
        };
    }

    // `FontPanel` builds its family, weight and size selects through
    // `getDefaultSelectParamsWithoutValueParams`, which carries no expression, so the factory hooks below
    // never see them. Hook the panel's own read instead - it is where the binding actually lives.
    const originalFontValue = (FontPanel.prototype as any).getInitialFontValue;
    originals.push([FontPanel.prototype, 'getInitialFontValue', originalFontValue]);
    (FontPanel.prototype as any).getInitialFontValue = function (fontKey: string) {
        const value = originalFontValue.call(this, fontKey);
        if (recording) {
            record(this.params.chartMenuParamsFactory, this.params.keyMapper(fontKey), 'font', [], { value });
        }
        return value;
    };

    for (const [method, kind] of LEAF_FACTORIES) {
        const original = (ChartMenuParamsFactory.prototype as any)[method];
        originals.push([ChartMenuParamsFactory.prototype, method, original]);
        (ChartMenuParamsFactory.prototype as any)[method] = function (...args: any[]) {
            const params = original.apply(this, args);
            if (recording && insideWrapper === 0 && typeof args[0] === 'string') {
                record(this, args[0], kind, args, params);
            }
            return params;
        };
    }

    return {
        widgets,
        setRecording: (value) => {
            recording = value;
        },
        restore: () => {
            for (const [target, method, original] of originals) {
                target[method] = original;
            }
        },
    };
}

/** Captures AG Charts' own option validation output, which names the offending option and its successor. */
function captureWarnings() {
    const messages: string[] = [];
    const originalWarn = console.warn;
    const originalError = console.error;
    const record = (...args: unknown[]) => {
        messages.push(args.map((arg) => String(arg)).join(' '));
    };
    console.warn = record;
    console.error = record;
    return {
        take: () => messages.splice(0, messages.length),
        restore: () => {
            console.warn = originalWarn;
            console.error = originalError;
        },
    };
}

/**
 * A binding the panels construct but leave hidden for this chart type. The option behind it need not
 * resolve, and writing to it proves nothing, because the user has no way to reach the control.
 */
function isHidden(expression: string, chartType: ChartType): boolean {
    // `cartesianAxisPanel` reveals the label format only for a time axis, and this fixture has none.
    if (expression === 'label.format') {
        return true;
    }
    // Both are revealed by `chartSpecificDataPanel` for a subset of chart types.
    if (expression === 'direction') {
        return !canSwitchDirection(chartType);
    }
    if (expression === 'series.reverse') {
        return chartType !== 'pyramid';
    }
    return false;
}

const COLUMN_DEFS: GridOptions['columnDefs'] = [
    { field: 'country', chartDataType: 'category' },
    { field: 'product', chartDataType: 'category' },
    { field: 'gold', chartDataType: 'series' },
    { field: 'silver', chartDataType: 'series' },
    { field: 'bronze', chartDataType: 'series' },
];

const ROW_DATA = [
    { country: 'Russia', product: 'Wheat', gold: 3, silver: 1, bronze: 5 },
    { country: 'USA', product: 'Wheat', gold: 4, silver: 2, bronze: 3 },
    { country: 'Russia', product: 'Maize', gold: 7, silver: 5, bronze: 1 },
    { country: 'USA', product: 'Maize', gold: 2, silver: 8, bronze: 6 },
];

const ALL_COLUMNS = ['country', 'product', 'gold', 'silver', 'bronze'];

const CHART_TYPES: ChartType[] = [
    'column',
    'groupedColumn',
    'stackedColumn',
    'normalizedColumn',
    'bar',
    'groupedBar',
    'stackedBar',
    'normalizedBar',
    'line',
    'stackedLine',
    'normalizedLine',
    'scatter',
    'bubble',
    'pie',
    'donut',
    'area',
    'stackedArea',
    'normalizedArea',
    'histogram',
    'radarLine',
    'radarArea',
    'nightingale',
    'radialColumn',
    'radialBar',
    'sunburst',
    'rangeBar',
    'rangeArea',
    'boxPlot',
    'treemap',
    'heatmap',
    'waterfall',
    'columnLineCombo',
    'areaColumnCombo',
    'customCombo',
    'funnel',
    'coneFunnel',
    'pyramid',
];

/** A value that is legal for the widget's kind, so a rejected write means the option itself is wrong. */
function probeFor(widget: Widget, current: unknown): unknown {
    switch (widget.kind) {
        case 'slider':
            return widget.isArray ? [3] : 3;
        case 'number':
            return 3;
        case 'boolean':
        case 'enable':
            return current !== true;
        case 'colour':
            return String(current).toLowerCase() === '#ff00ff' ? '#00ff00' : '#ff00ff';
        case 'font': {
            if (/\.fontSize$/.test(widget.expression)) {
                return current === 12 ? 14 : 12;
            }
            if (/\.fontFamily$/.test(widget.expression)) {
                return 'Arial, sans-serif';
            }
            if (/\.fontStyle$/.test(widget.expression)) {
                return current === 'italic' ? 'normal' : 'italic';
            }
            return current === 'bold' ? 'normal' : 'bold';
        }
        case 'select': {
            const choices = (widget.choices ?? []).filter((choice) => choice !== undefined && choice !== current);
            return choices.length > 0 ? choices[0] : undefined;
        }
        default:
            if (typeof current === 'boolean') {
                return !current;
            }
            if (typeof current === 'number') {
                return current === 3 ? 4 : 3;
            }
            // `addValueParams` is called directly for text fields and colour pickers, so the widget kind
            // isn't known here; fall back on what the option is named.
            if (/\.text$/.test(widget.expression)) {
                return 'probe';
            }
            if (/colo(u)?r$|stroke$|fill$/i.test(widget.expression)) {
                return '#ff00ff';
            }
            return undefined;
    }
}

describe('chart tool panel options', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            ClientSideRowModelModule,
            CellSelectionModule,
            PivotModule,
            RowGroupingModule,
            IntegratedChartsModule.with(AgChartsEnterpriseModule),
        ],
    });

    beforeAll(async () => {
        setupAgTestIds();
        await canvasPolyfill.init();
    });
    afterAll(() => canvasPolyfill.reset());
    afterEach(() => gridsManager.reset());

    test(
        'every format panel binding resolves against the chart and is accepted by it',
        async () => {
            /** `scope -> expression` of bindings whose value the panel could not resolve. */
            const unresolved = new Map<string, Set<ChartType>>();
            /** AG Charts' own complaints about the options the panels write. */
            const rejected = new Map<string, Set<ChartType>>();
            let widgetCount = 0;

            for (const chartType of CHART_TYPES) {
                const panels = instrumentPanels();
                const warnings = captureWarnings();
                try {
                    const api = await gridsManager.createGridAndWait('grid1', {
                        columnDefs: COLUMN_DEFS,
                        rowData: ROW_DATA,
                        cellSelection: true,
                        popupParent: document.body,
                    });
                    const chartRef = api.createRangeChart({
                        cellRange: { columns: ALL_COLUMNS },
                        chartType,
                        seriesChartTypes:
                            chartType === 'customCombo'
                                ? [
                                      { colId: 'gold', chartType: 'groupedColumn', secondaryAxis: false },
                                      { colId: 'silver', chartType: 'line', secondaryAxis: true },
                                      { colId: 'bronze', chartType: 'area', secondaryAxis: false },
                                  ]
                                : undefined,
                    })!;

                    // The panels read the chart's resolved options as they build, so the chart has to have
                    // settled first - otherwise every read races the first update and means nothing.
                    await chartRef.chart.waitForUpdate();

                    panels.setRecording(true);
                    api.openChartToolPanel({ chartId: chartRef.chartId, panel: 'format' });
                    await chartRef.chart.waitForUpdate();
                    panels.setRecording(false);

                    const seen = new Set<string>();
                    const writes = new Map<ChartOptionsProxy, { expression: string; value: unknown }[]>();
                    for (let i = 0, len = panels.widgets.length; i < len; ++i) {
                        const widget = panels.widgets[i];
                        const key = `${widget.scope} -> ${widget.expression}`;
                        if (seen.has(key)) {
                            continue;
                        }
                        seen.add(key);
                        ++widgetCount;

                        if (isHidden(widget.expression, chartType)) {
                            continue;
                        }

                        const value = widget.proxy.getValue(widget.expression);
                        if (value === undefined && !hasRecoveredValue(widget)) {
                            addOccurrence(unresolved, key, chartType);
                        }

                        const probe = probeFor(widget, value);
                        if (probe !== undefined) {
                            const batch = writes.get(widget.proxy);
                            const write = { expression: widget.expression, value: probe };
                            if (batch) {
                                batch.push(write);
                            } else {
                                writes.set(widget.proxy, [write]);
                            }
                        }
                    }

                    // Batched per proxy: each `setValues` costs a full chart update, and one per option
                    // would put the matrix into the tens of minutes.
                    warnings.take();
                    for (const [proxy, batch] of writes) {
                        proxy.setValues(batch);
                        await chartRef.chart.waitForUpdate();
                    }
                    for (const message of warnings.take()) {
                        if (message.includes('Unknown option')) {
                            addOccurrence(rejected, message.trim(), chartType);
                        }
                    }
                } finally {
                    warnings.restore();
                    panels.restore();
                    gridsManager.reset();
                }
            }

            expect(widgetCount).toBeGreaterThan(1000);

            // Any option AG Charts does not recognise is drift, and its own message names the replacement.
            expect(summarise(rejected)).toEqual([]);

            // Bindings whose option the chart theme leaves unset and no panel resolves. Both entries left
            // are benign, because on the chart types listed the value the slider's `?? 0` shows is the one
            // the chart renders: AG Charts treats an unset inner radius ratio as 0, and a legend marker
            // takes the stroke width of its series, which is 0 for each of these. The panel resolves the
            // rest from the legend, so a chart type dropping out of the second entry is a fix, not drift.
            // Anything joining either opens showing 0 or blank while the chart renders something else.
            expect(summarise(unresolved)).toMatchInlineSnapshot(`
              [
                "getChartThemeOverridesProxy() -> legend.item.marker.strokeWidth [25 chart types]",
                "getPolarAxisThemeOverridesProxy(radius,thisAxis) -> innerRadiusRatio [radarLine, radarArea, nightingale]",
              ]
            `);
        },
        // ~17s locally for the full 37-chart-type matrix; the allowance is for slower CI, not for the
        // matrix growing. If this starts timing out, something is sleeping rather than doing work.
        2 * 60 * 1000
    );
});

function addOccurrence(counts: Map<string, Set<ChartType>>, key: string, chartType: ChartType): void {
    const existing = counts.get(key);
    if (existing) {
        existing.add(chartType);
    } else {
        counts.set(key, new Set([chartType]));
    }
}

/** Names the chart types while there are few enough to be worth reading, and counts them otherwise. */
function summarise(counts: Map<string, Set<ChartType>>): string[] {
    return [...counts]
        .map(([key, chartTypes]) => {
            const detail = chartTypes.size > 4 ? `${chartTypes.size} chart types` : [...chartTypes].join(', ');
            return `${key} [${detail}]`;
        })
        .sort((a, b) => a.localeCompare(b));
}
