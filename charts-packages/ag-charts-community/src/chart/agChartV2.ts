import {
    AgChartOptions,
    AgCartesianChartOptions,
    AgPolarChartOptions,
    AgHierarchyChartOptions,
    AgCartesianAxisOptions,
    AgBarSeriesOptions,
    AgBarSeriesLabelOptions,
    AgChartThemePalette,
} from './agChartOptions';
import { CartesianChart } from './cartesianChart';
import { PolarChart } from './polarChart';
import { HierarchyChart } from './hierarchyChart';
import { Caption } from '../caption';
import { Series } from './series/series';
import { AreaSeries } from './series/cartesian/areaSeries';
import { BarSeries, BarLabelPlacement } from './series/cartesian/barSeries';
import { HistogramSeries } from './series/cartesian/histogramSeries';
import { LineSeries } from './series/cartesian/lineSeries';
import { ScatterSeries } from './series/cartesian/scatterSeries';
import { PieSeries } from './series/polar/pieSeries';
import { TreemapSeries } from './series/hierarchy/treemapSeries';
import { ChartAxis } from './chartAxis';
import { LogAxis } from './axis/logAxis';
import { NumberAxis } from './axis/numberAxis';
import { CategoryAxis } from './axis/categoryAxis';
import { GroupedCategoryAxis } from './axis/groupedCategoryAxis';
import { TimeAxis } from './axis/timeAxis';
import { Chart } from './chart';
import { SourceEventListener } from '../util/observable';
import { DropShadow } from '../scene/dropShadow';
import { jsonDiff, DELETE, jsonMerge, jsonApply, DeepPartial } from '../util/json';

// TODO: Move these out of the old implementation?
import { processSeriesOptions, getChartTheme } from './agChart';
import { AxesOptionsTypes, SeriesOptionsTypes, DEFAULT_AXES_OPTIONS, DEFAULT_SERIES_OPTIONS, DEFAULT_CARTESIAN_CHART_OPTIONS } from './agChartV2Defaults';

// TODO: Break this file up into several distinct modules:
// - Main entry point.
// - Default definitions.
// - Transforms.
// - Processing/application.

type Transforms<Source, Result extends {[R in keyof Source]?: any}, Keys extends keyof Source & keyof Result = keyof Source & keyof Result> = {
    [Property in Keys]: (p: Source[Property], src: Source) => Result[Property];
};

function transform<
    I,
    R extends {[RKey in keyof I]: O[RKey]},
    T extends Transforms<I, R>,
    O extends {[OKey in keyof T]: ReturnType<T[OKey]>} & {[OKey in Exclude<keyof I, keyof T>]: I[OKey] },
>(input: I, transforms: T): O {
    const result: Partial<O> = {};

    for (const p in input) {
        const t = (transforms as any)[p] || ((x: any) => x);
        (result as any)[p] = t(input[p], input);
    }

    return result as O;
}

function is2dArray<E>(input: E[]|E[][]): input is E[][] {
    return input != null && input instanceof Array && input[0] instanceof Array;
}

type ChartOptionType<T extends Chart> = T extends CartesianChart ? AgCartesianChartOptions :
    T extends PolarChart ? AgPolarChartOptions :
    T extends HierarchyChart ? AgHierarchyChartOptions :
    never;

function isAgCartesianChartOptions(input: AgChartOptions): input is AgCartesianChartOptions {
    if (input.type == null) { return true; }

    switch (input.type) {
        case 'cartesian':
        case 'area':
        case 'bar':
        case 'column':
        case 'groupedCategory':
        case 'histogram':
        case 'line':
        case 'scatter':
            return true;

        default:
            return false;
    }
}

function isAgHierarchyChartOptions(input: AgChartOptions): input is AgHierarchyChartOptions {
    if (input.type == null) { return true; }

    switch (input.type) {
        case 'hierarchy':
        case 'treemap':
            return true;

        default:
            return false;
    }
}

function isAgPolarChartOptions(input: AgChartOptions): input is AgPolarChartOptions {
    if (input.type == null) { return true; }

    switch (input.type) {
        case 'polar':
        case 'pie':
            return true;

        default:
            return false;
    }
}

function countArrayElements<T extends any[]|any[][]>(input: T): number {
    let count = 0;
    for (const next of input) {
        if (next instanceof Array) {
            count += countArrayElements(next);
        }
        if (next != null) {
            count++;
        }
    }
    return count;
}

interface PreparationContext {
    colourIndex: number;
    palette: AgChartThemePalette;
}

export abstract class AgChartV2 {
    static create<T extends Chart>(options: ChartOptionType<T>): T {
        const mergedOptions = AgChartV2.prepareOptions(options);

        const chart = isAgCartesianChartOptions(mergedOptions) ? new CartesianChart(document) :
            isAgHierarchyChartOptions(mergedOptions) ? new HierarchyChart(document) :
            isAgPolarChartOptions(mergedOptions) ? new PolarChart(document) :
            undefined;

        if (!chart) {
            throw new Error(`AG Charts - couldn\'t apply configuration, check type of options: ${mergedOptions['type']}`);
        }

        return AgChartV2.updateDelta<T>(chart as T, mergedOptions);
    }

    static update<T extends Chart>(chart: Chart, options: ChartOptionType<T>): T {
        const mergedOptions = AgChartV2.prepareOptions(options);

        if (options.type && options.type !== chart.options.type) {
            chart.destroy();
            return AgChartV2.create(options);
        }

        const deltaOptions = jsonDiff<ChartOptionType<T>>(chart.options as ChartOptionType<T>, mergedOptions);
        if (deltaOptions == null) {
            return chart as T;
        }

        return AgChartV2.updateDelta<T>(chart as T, deltaOptions);
    }

    static updateDelta<T extends Chart>(chart: T, update: Partial<ChartOptionType<T>>): T {
        if (chart instanceof CartesianChart) {
            return applyCartesianChartOptions<typeof chart>(chart, update as ChartOptionType<typeof chart>);
        }

        if (chart instanceof HierarchyChart) {
            return applyHierarchyChartOptions<typeof chart>(chart, update as ChartOptionType<typeof chart>);
        }

        if (chart instanceof PolarChart) {
            return applyPolarChartOptions<typeof chart>(chart, update as ChartOptionType<typeof chart>);
        }

        throw new Error(`AG Charts - couldn\'t apply configuration, check type of options and chart: ${update['type']}`);
    }

    private static prepareOptions<T extends AgChartOptions>(options: T): T {
        const defaultOptions = isAgCartesianChartOptions(options) ? DEFAULT_CARTESIAN_CHART_OPTIONS :
            isAgHierarchyChartOptions(options) ? {} :
            isAgPolarChartOptions(options) ? {} :
            {};

        const theme = getChartTheme(options.theme);
        const themeConfig = theme.getConfig(options.type || 'cartesian');
        const axesThemes = themeConfig['axes'] || {};
        const seriesThemes = themeConfig['series'] || {};
        const cleanedTheme = jsonMerge(themeConfig, { axes: DELETE, series: DELETE });

        const context: PreparationContext = { colourIndex: 0, palette: theme.palette };
        
        const mergedOptions = jsonMerge(defaultOptions as T, cleanedTheme, options);

        // Special cases where we have arrays of elements which need their own defaults.
        processSeriesOptions(mergedOptions.series || []).forEach((s: SeriesOptionsTypes, i: number) => {
            // TODO: Handle graph/series hierarchy properly?
            const type = s.type || 'line';
            mergedOptions.series![i] = AgChartV2.prepareSeries(context, s, DEFAULT_SERIES_OPTIONS[type], seriesThemes[type] || {});
        });
        if (isAgCartesianChartOptions(mergedOptions)) {
            (mergedOptions.axes || []).forEach((a, i) => {
                const type = a.type || 'number';
                // TODO: Handle removal of spurious properties more gracefully.
                const axesTheme = jsonMerge(axesThemes[type], axesThemes[type][a.position || 'unknown'] || {});
                mergedOptions.axes![i] = AgChartV2.prepareAxis(a, DEFAULT_AXES_OPTIONS[type], axesTheme);
            });
        }

        // Preserve non-cloneable properties.
        mergedOptions.container = options.container;
        mergedOptions.data = options.data;

        return mergedOptions;
    }

    private static prepareSeries<T extends SeriesOptionsTypes>(context: PreparationContext, input: T, ...defaults: T[]): T {
        const paletteOptions = AgChartV2.calculateSeriesPalette(context, input);

        // Part of the options interface, but not directly consumed by the series implementations.
        const removeOptions = { stacked: DELETE } as T;
        return jsonMerge(...defaults, paletteOptions, input, removeOptions);
    }

    private static calculateSeriesPalette<T extends SeriesOptionsTypes>(context: PreparationContext, input: T): T {
        let paletteOptions: {
            stroke?: string;
            fill?: string;
            fills?: string[];
            strokes?: string[];
            marker?: { fill?: string; stroke?: string; };
            callout?: { colors?: string[]; };
        } = {};

        const { palette: { fills, strokes } } = context;
        const repeatedFills = [...fills, ...fills];
        const repeatedStrokes = [...strokes, ...strokes];
        let colourCount = countArrayElements((input as any)['yKeys'] || [0]); // Defaults to 1 if no yKeys.
        switch (input.type) {
            case 'pie':
                colourCount = Math.min(fills.length, strokes.length);
            case 'area':
            case 'bar':
            case 'column':
                paletteOptions.fills = repeatedFills.slice(context.colourIndex, colourCount);
                paletteOptions.strokes = repeatedStrokes.slice(context.colourIndex, colourCount);
                break;
            case 'histogram':
                paletteOptions.fill = fills[context.colourIndex % fills.length];
                paletteOptions.stroke = strokes[context.colourIndex % strokes.length];
                break;
            case 'scatter':
                paletteOptions.fill = fills[context.colourIndex % fills.length];
            case 'line':
                paletteOptions.stroke = strokes[context.colourIndex % strokes.length];
                paletteOptions.marker = {
                    stroke: strokes[context.colourIndex % strokes.length],
                    fill: fills[context.colourIndex % fills.length],
                };
                break;
            case 'treemap':
                break;
            case 'ohlc':
            default:
                throw new Error('AG Charts - unknown series type: ' + input.type);
        }
        context.colourIndex += colourCount;

        return paletteOptions as T;
    }

    private static prepareAxis<T extends AxesOptionsTypes>(input: T, ...defaults: T[]): T {
        // Remove redundant theme overload keys.
        const removeOptions = { top: DELETE, bottom: DELETE, left: DELETE, right: DELETE } as any;
        return jsonMerge(...defaults, input, removeOptions);
    }
}

function yNamesMapping(p: string[] | Record<string, string> | undefined, src: AgBarSeriesOptions): Record<string, string> {
    if (p == null) { return {}; }

    if (!(p instanceof Array)) { return p; }

    const yKeys = src.yKeys;
    if (yKeys == null || is2dArray(yKeys)) {
        throw new Error('AG Charts - yNames and yKeys mismatching configuration.');
    }

    const result: Record<string, string> = {};
    yKeys.forEach((k, i) => {
        result[k] = p[i];
    });

    return result;
}

function yKeysMapping(p: string[ ]| string[][] | undefined, src: AgBarSeriesOptions): string[][] {
    if (p == null) { return [[]]; }

    if (is2dArray(p)) {
        return p;
    }

    return src.grouped ? p.map(v => [v]) : [p];
}

function labelMapping(p: AgBarSeriesLabelOptions | undefined): Omit<AgBarSeriesLabelOptions, 'placement'> & { placement?: BarLabelPlacement } | undefined {
    if (p == null) { return undefined; }

    const { placement } = p;
    return {
        ...p,
        placement:
            placement === 'inside' ? BarLabelPlacement.Inside :
            placement === 'outside' ? BarLabelPlacement.Outside :
            undefined,
    }
}

const BAR_SERIES_TRANSFORMS: Transforms<
    AgBarSeriesOptions,
    { yNames: Record<string, string>, yKeys: string[][], label: ReturnType<typeof labelMapping> }
> = {
    yNames: (p, src) => yNamesMapping(p, src),
    yKeys: (p, src) => yKeysMapping(p, src),
    label: (p) => labelMapping(p),
};

function applyCartesianChartOptions<T extends CartesianChart>(chart: T, options: ChartOptionType<T>): T {
    applyOptionValues(chart, options as any, { skip: ['type', 'data', 'series', 'axes', 'autoSize', 'listeners', 'theme'] as (keyof T)[] });

    if (options.series) {
        chart.series = createSeries(options.series);
    }
    if (options.axes) {
        chart.axes = createAxis(options.axes);
    }
    if (options.data) {
        chart.data = options.data;
    }

    // Needs to be done last to avoid overrides by width/height properties.
    if (options.autoSize != null) {
        chart.autoSize = options.autoSize;
    }
    if (options.listeners) {
        registerListeners(chart, options.listeners);
    }

    chart.layoutPending = true;
    chart.options = mergeOptions(chart.options || {}, options);
    chart.options = jsonMerge(chart.options || {}, options);

    return chart;
}

function applyHierarchyChartOptions<T extends HierarchyChart>(chart: T, options: ChartOptionType<T>): T {
    registerListeners(chart, options.listeners);
    return chart;
}

function applyPolarChartOptions<T extends PolarChart>(chart: T, options: ChartOptionType<T>): T {
    registerListeners(chart, options.listeners);
    return chart;
}

function createSeries(options: AgChartOptions['series']): Series[] {
    const series: Series[] = [];

    let index = 0;
    for (const seriesOptions of options || []) {
        const path = `series[${index++}]`;
        switch (seriesOptions.type) {
            case 'area':
                series.push(applyOptionValues(new AreaSeries(), seriesOptions, {path}));
                break;
            case 'bar':
            case 'column':
                // TODO: Move series transforms into prepareOptions() phase.
                series.push(applyOptionValues(new BarSeries(), transform(seriesOptions, BAR_SERIES_TRANSFORMS), {path}));
                break;
            case 'histogram':
                series.push(applyOptionValues(new HistogramSeries(), seriesOptions, {path}));
                break;
            case 'line':
                series.push(applyOptionValues(new LineSeries(), seriesOptions, {path}));
                break;
            case 'scatter':
                series.push(applyOptionValues(new ScatterSeries(), seriesOptions, {path}));
                break;
            case 'pie':
                series.push(applyOptionValues(new PieSeries(), seriesOptions, {path}));
                break;
            case 'treemap':
                series.push(applyOptionValues(new TreemapSeries(), seriesOptions, {path}));
                break;
            case 'ohlc':
            default:
                throw new Error('AG Charts - unknown series type: ' + seriesOptions.type);
        }
    }

    return series;
}

function createAxis(options: AgCartesianAxisOptions[]): ChartAxis[] {
    const axes: ChartAxis[] = [];

    let index = 0;
    for (const axisOptions of options || []) {
        const path = `axis[${index++}]`;
        switch (axisOptions.type) {
            case 'number':
                axes.push(applyOptionValues(new NumberAxis(), axisOptions, {path}));
                break;
            case LogAxis.type:
                axes.push(applyOptionValues(new LogAxis(), axisOptions, {path}));
                break;
            case CategoryAxis.type:
                axes.push(applyOptionValues(new CategoryAxis(), axisOptions, {path}));
                break;
            case GroupedCategoryAxis.type:
                axes.push(applyOptionValues(new GroupedCategoryAxis(), axisOptions, {path}));
                break;
            case TimeAxis.type:
                axes.push(applyOptionValues(new TimeAxis(), axisOptions, {path}));
                break;
            default:
                throw new Error('AG Charts - unknown axis type: ' + axisOptions['type']);
        }
    }

    return axes;
}

function registerListeners<T extends { addEventListener(key: string, cb: SourceEventListener<any>): void }>(
    source: T,
    listeners?: { [K: string]: Function }
) {
    for (const property in listeners) {
        source.addEventListener(property, listeners[property] as SourceEventListener<any>);
    }
}

function applyOptionValues<T, S extends DeepPartial<T>>(
    target: T,
    options?: S,
    { skip, path }: { skip?: (keyof T)[], path?: string } = {},
): T {
    const applyOpts = {
        skip: ['type' as keyof T, ...(skip || [])], 
        constructors: {
            'title': Caption,
            'subtitle': Caption,
            'shadow': DropShadow,
        },
        ...(path ? { path } : {}),
    };
    return jsonApply<T, S>(target, options, applyOpts);
}
