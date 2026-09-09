import { AgChartsEnterpriseModule } from 'ag-charts-enterprise';
import { TestGridsManager, canvasPolyfill } from 'ag-test-utils';

import type { ChartType, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, setupAgTestIds } from 'ag-grid-community';
import { CellSelectionModule, IntegratedChartsModule, PivotModule, RowGroupingModule } from 'ag-grid-enterprise';

import { ChartMenuParamsFactory } from '../../../../packages/ag-grid-enterprise/src/charts/chartComp/menu/chartMenuParamsFactory';
import { FontPanel } from '../../../../packages/ag-grid-enterprise/src/charts/chartComp/menu/format/fontPanel';
import type { ChartOptionsProxy } from '../../../../packages/ag-grid-enterprise/src/charts/chartComp/services/chartOptionsService';
import { ChartOptionsService } from '../../../../packages/ag-grid-enterprise/src/charts/chartComp/services/chartOptionsService';
import { canSwitchDirection } from '../../../../packages/ag-grid-enterprise/src/charts/chartComp/utils/seriesTypeMapper';

/**
 * The format panel binds each of its widgets to an AG Charts option by *string expression*, resolved at
 * runtime against `chart.chartOptions.processedOptions`. Nothing in that path is type-checked, so an
 * option AG Charts has renamed or moved leaves a control that silently reads nothing, writes nothing, or
 * both. The suites beside this file exercise every binding on every chart type to catch that drift; this
 * module holds the instrumentation they share and the list of bindings known to be benignly unresolved.
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

/**
 * AG Charts refusing the suite's own generic probe value (`3`, `#ff00ff`) where that option wants another
 * shape. An artefact of probing, not drift: the option resolved, which is what these suites test.
 */
const PROBE_VALUE_REJECTION = / cannot be set to /;

/**
 * Messages AG Charts raises while the chart and panels are built, which are known and not this suite's to
 * fix. Everything else raised there counts as drift: an entry here is a standing debt, not a mute button.
 */
const KNOWN_SETUP_WARNINGS = ['Unknown option `theme.overrides.waterfall.series.highlight.unhighlightedSeries`'];

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

interface PanelBindings {
    /** Distinct `scope -> expression` bindings the panels built, i.e. how much this chart type covered. */
    count: number;
    /** Bindings whose value the panel could not resolve. */
    unresolved: string[];
    /** AG Charts' own complaints about the options the panels wrote. */
    rejected: string[];
    /** Diagnostics that are neither drift nor a rejection of this suite's probe value, so nobody has
     *  classified them: the class a new kind of warning would arrive in. */
    unexpected: string[];
}

/**
 * Bindings whose option the chart theme leaves unset and no panel resolves. Both are benign on the chart
 * types listed, because there the value the slider's `?? 0` shows is the one the chart renders: AG Charts
 * treats an unset inner radius ratio as 0, and a legend marker takes the stroke width of its series, which
 * is 0 for each of these. The panel resolves the rest from the legend, so a chart type dropping off either
 * list is a fix, not drift. A chart type joining one opens showing 0 or blank while the chart renders
 * something else.
 */
const BENIGN_UNRESOLVED: { key: string; chartTypes: ChartType[] }[] = [
    {
        key: 'getChartThemeOverridesProxy() -> legend.item.marker.strokeWidth',
        chartTypes: [
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
            'pie',
            'donut',
            'area',
            'stackedArea',
            'normalizedArea',
            'radarLine',
            'radarArea',
            'radialColumn',
            'radialBar',
            'rangeBar',
            'waterfall',
            'columnLineCombo',
            'areaColumnCombo',
            'customCombo',
        ],
    },
    {
        key: 'getPolarAxisThemeOverridesProxy(radius,thisAxis) -> innerRadiusRatio',
        chartTypes: ['radarLine', 'radarArea', 'nightingale'],
    },
];

export function benignUnresolved(chartType: ChartType): string[] {
    return BENIGN_UNRESOLVED.filter(({ chartTypes }) => chartTypes.includes(chartType))
        .map(({ key }) => key)
        .sort((a, b) => a.localeCompare(b));
}

/**
 * Wires a suite up to probe the format panel: registers the grid/canvas hooks and returns the probe. The
 * matrix is split across several suites so 37 chart builds do not queue up in one worker - each file is a
 * chart family, and they run in parallel. Each file then runs one `test.each` case per chart type: all 37
 * in one test reported "the format panel is broken" without saying where.
 */
export function setupFormatPanelSuite(): (chartType: ChartType) => Promise<PanelBindings> {
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

    /** Opens the format panel on a chart of `chartType` and probes every binding it built. */
    async function openFormatPanel(chartType: ChartType): Promise<PanelBindings> {
        const unresolved: string[] = [];
        const rejected: string[] = [];
        const unexpected: string[] = [];
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

                if (isHidden(widget.expression, chartType)) {
                    continue;
                }

                const value = widget.proxy.getValue(widget.expression);
                if (value === undefined && !hasRecoveredValue(widget)) {
                    unresolved.push(key);
                }

                const probe = probeFor(widget, value);
                if (probe !== undefined) {
                    let batch = writes.get(widget.proxy);
                    if (!batch) {
                        batch = [];
                        writes.set(widget.proxy, batch);
                    }
                    batch.push({ expression: widget.expression, value: probe });
                }
            }

            // Batched per proxy, then settled once: `setValues` is the expensive half, and one call per
            // option would put the matrix into the tens of minutes. Awaiting each proxy separately only
            // paid for updates the chart coalesces anyway - an unknown option injected into a batch is
            // still reported, so the rejection check below keeps working.
            //
            // Draining before the batch keeps the rejection check to this batch's own output, but the
            // drained messages are still drift: the chart build raises `Unknown option` too, and dropping
            // them outright hid exactly what this suite exists to catch.
            for (const message of warnings.take()) {
                if (KNOWN_SETUP_WARNINGS.some((k) => message.includes(k))) {
                    continue;
                }
                (message.includes('Unknown option') ? rejected : unexpected).push(message.trim());
            }
            for (const [proxy, batch] of writes) {
                proxy.setValues(batch);
            }
            await chartRef.chart.waitForUpdate();
            for (const message of warnings.take()) {
                if (message.includes('Unknown option')) {
                    rejected.push(message.trim());
                } else if (!PROBE_VALUE_REJECTION.test(message)) {
                    // Neither drift nor a probe artefact: an unclassified diagnostic, which is exactly how
                    // a new class of them would go unnoticed.
                    unexpected.push(message.trim());
                }
            }
            return {
                count: seen.size,
                unresolved: unresolved.sort((a, b) => a.localeCompare(b)),
                rejected,
                unexpected,
            };
        } finally {
            warnings.restore();
            panels.restore();
            gridsManager.reset();
        }
    }

    return openFormatPanel;
}
