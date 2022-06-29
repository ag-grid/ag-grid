import {
    AgChartOptions,
    AgCartesianChartOptions,
    AgPolarChartOptions,
    AgHierarchyChartOptions,
    AgCartesianAxisOptions,
    AgLineSeriesOptions,
    AgBarSeriesOptions,
    AgAreaSeriesOptions,
    AgScatterSeriesOptions,
    AgHistogramSeriesOptions,
    AgPieSeriesOptions,
    AgTreemapSeriesOptions,
    AgNumberAxisOptions,
    AgLogAxisOptions,
    AgCategoryAxisOptions,
    AgGroupedCategoryAxisOptions,
    AgTimeAxisOptions,
} from './agChartOptions';
import { CartesianChart } from './cartesianChart';
import { PolarChart } from './polarChart';
import { HierarchyChart } from './hierarchyChart';
import { Caption } from '../caption';
import { Series } from './series/series';
import { AreaSeries } from './series/cartesian/areaSeries';
import { BarSeries } from './series/cartesian/barSeries';
import { HistogramSeries } from './series/cartesian/histogramSeries';
import { LineSeries } from './series/cartesian/lineSeries';
import { ScatterSeries } from './series/cartesian/scatterSeries';
import { PieSeries, PieTitle } from './series/polar/pieSeries';
import { TreemapSeries } from './series/hierarchy/treemapSeries';
import { ChartAxis } from './chartAxis';
import { LogAxis } from './axis/logAxis';
import { NumberAxis } from './axis/numberAxis';
import { CategoryAxis } from './axis/categoryAxis';
import { GroupedCategoryAxis } from './axis/groupedCategoryAxis';
import { TimeAxis } from './axis/timeAxis';
import { Chart, ChartUpdateType } from './chart';
import { SourceEventListener } from '../util/observable';
import { DropShadow } from '../scene/dropShadow';
import { jsonDiff, jsonMerge, jsonApply } from '../util/json';
import { Axis } from '../axis';
import { GroupedCategoryChart } from './groupedCategoryChart';
import { prepareOptions, isAgCartesianChartOptions, isAgHierarchyChartOptions, isAgPolarChartOptions, optionsType } from './mapping/prepare';
import { SeriesOptionsTypes } from './mapping/defaults';
import { CrossLine } from './crossline/crossLine';
import { windowValue } from '../util/window';

type ChartType = CartesianChart | PolarChart | HierarchyChart;

export type AgChartType<T> =
    T extends AgCartesianChartOptions ? CartesianChart :
    T extends AgPolarChartOptions ? PolarChart :
    T extends AgHierarchyChartOptions ? HierarchyChart :
    never;

type ChartOptionType<T extends ChartType> =
    T extends GroupedCategoryChart ? AgCartesianChartOptions :
    T extends CartesianChart ? AgCartesianChartOptions :
    T extends PolarChart ? AgPolarChartOptions :
    T extends HierarchyChart ? AgHierarchyChartOptions :
    never;

type SeriesOptionType<T extends Series> =
    T extends LineSeries ? AgLineSeriesOptions :
    T extends BarSeries ? AgBarSeriesOptions :
    T extends AreaSeries ? AgAreaSeriesOptions :
    T extends ScatterSeries ? AgScatterSeriesOptions :
    T extends HistogramSeries ? AgHistogramSeriesOptions :
    T extends PieSeries ? AgPieSeriesOptions :
    T extends TreemapSeries ? AgTreemapSeriesOptions :
    never;

type AxisOptionType<T extends Axis<any, any>> =
    T extends LogAxis ? AgLogAxisOptions :
    T extends NumberAxis ? AgNumberAxisOptions :
    T extends CategoryAxis ? AgCategoryAxisOptions :
    T extends GroupedCategoryAxis ? AgGroupedCategoryAxisOptions :
    T extends TimeAxis ? AgTimeAxisOptions :
    never;

function chartType<T extends ChartType>(options: ChartOptionType<T>): 'cartesian' | 'polar' | 'hierarchy' {
    if (isAgCartesianChartOptions(options)) {
        return 'cartesian';
    } else if (isAgPolarChartOptions(options)) {
        return 'polar';
    } else if (isAgHierarchyChartOptions(options)) {
        return 'hierarchy';
    }

    throw new Error('AG Chart - unknown type of chart for options with type: ' + options.type);
}

// Backwards-compatibility layer.
export abstract class AgChart {
    /** @deprecated use AgChart.create() or AgChart.update() instead. */
    static createComponent(options: any, type: string): any {
        // console.warn('AG Charts - createComponent should no longer be used, use AgChart.update() instead.')

        if (type.indexOf('.series') >= 0) {
            const optionsWithType = {
                ...options,
                type: options.type || type.split('.')[0],
            };
            return createSeries([optionsWithType])[0];
        }

        return null;
    }

    public static create<T extends AgChartOptions>(options: T, container?: HTMLElement, data?: any[]): AgChartType<T> {
        return AgChartV2.create(options as any);
    }

    public static update<T extends AgChartOptions>(chart: AgChartType<T>, options: T, container?: HTMLElement, data?: any[]) {
        return AgChartV2.update(chart, options as any);
    }
}

export abstract class AgChartV2 {
    static DEBUG = windowValue('agChartsDebug') ?? false;

    static create<T extends ChartType>(userOptions: ChartOptionType<T>): T {
        debug('user options', userOptions);
        const mixinOpts: any = {};
        if (AgChartV2.DEBUG) {
            mixinOpts['debug'] = true;
        }

        const mergedOptions = prepareOptions(userOptions, mixinOpts);

        const chart = isAgCartesianChartOptions(mergedOptions) ? (mergedOptions.type === 'groupedCategory' ? new GroupedCategoryChart(document) : new CartesianChart(document)) :
            isAgHierarchyChartOptions(mergedOptions) ? new HierarchyChart(document) :
            isAgPolarChartOptions(mergedOptions) ? new PolarChart(document) :
            undefined;

        if (!chart) {
            throw new Error(`AG Charts - couldn\'t apply configuration, check type of options: ${mergedOptions['type']}`);
        }

        AgChartV2.updateDelta(chart, mergedOptions, userOptions);
        return chart as T;
    }

    static update<T extends ChartType>(chart: Chart, userOptions: ChartOptionType<T>): void {
        debug('user options', userOptions);
        const mixinOpts: any = {};
        if (AgChartV2.DEBUG) {
            mixinOpts['debug'] = true;
        }

        const mergedOptions = prepareOptions(userOptions, chart.userOptions as ChartOptionType<T>, mixinOpts);

        if (chartType(mergedOptions) !== chartType(chart.options as ChartOptionType<typeof chart>)) {
            chart.destroy();
            console.warn('AG Charts - options supplied require a different type of chart, please recreate the chart.')
            return;
        }

        const deltaOptions = jsonDiff<ChartOptionType<T>>(chart.options as ChartOptionType<T>, mergedOptions, { stringify: ['data']});
        if (deltaOptions == null) {
            return;
        }

        AgChartV2.updateDelta<T>(chart as T, deltaOptions, userOptions);
    }

    private static updateDelta<T extends ChartType>(chart: T, update: Partial<ChartOptionType<T>>, userOptions: ChartOptionType<T>): void {
        if (update.type == null) {
            update = {...update, type: chart.options.type || optionsType(update)};
        }
        debug('delta update', update);
        applyChartOptions(chart, update as ChartOptionType<typeof chart>, userOptions)
    }
}

function debug(message?: any, ...optionalParams: any[]): void {
    if (AgChartV2.DEBUG) {
        console.log(message, ...optionalParams);
    }
}

function applyChartOptions<
    T extends CartesianChart | PolarChart | HierarchyChart,
    O extends ChartOptionType<T>,
>(chart: T, options: O, userOptions: O): void {
    if (isAgCartesianChartOptions(options)) {
        applyOptionValues(chart, options, { skip: ['type', 'data', 'series', 'axes', 'autoSize', 'listeners', 'theme'] });
    } else if (isAgPolarChartOptions(options)) {
        applyOptionValues(chart, options, { skip: ['type', 'data', 'series', 'autoSize', 'listeners', 'theme'] });
    } else if (isAgHierarchyChartOptions(options)) {
        applyOptionValues(chart, options, { skip: ['type', 'data', 'series', 'autoSize', 'listeners', 'theme'] });
    } else {
        throw new Error(`AG Charts - couldn\'t apply configuration, check type of options and chart: ${options['type']}`);
    }

    let updateType = ChartUpdateType.PERFORM_LAYOUT;
    if (options.series && options.series.length > 0) {
        applySeries<T, O>(chart, options);
    }
    if (isAgCartesianChartOptions(options) && options.axes) {
        const axesPresent = applyAxes<T, O>(chart, options);
        if (axesPresent) {
            updateType = ChartUpdateType.PROCESS_DATA;
        }
    }

    const seriesOpts = options.series as any[];
    if (options.data) {
        chart.data = options.data;
        updateType = ChartUpdateType.PROCESS_DATA;
    } else if (seriesOpts?.some((s) => s.data != null)) {
        updateType = ChartUpdateType.PROCESS_DATA;
    }

    // Needs to be done last to avoid overrides by width/height properties.
    if (options.autoSize != null) {
        chart.autoSize = options.autoSize;
    }
    if (options.listeners) {
        registerListeners(chart, options.listeners);
    }
    if (options.legend?.listeners) {
        Object.assign(chart.legend.listeners, options.legend.listeners);
    }

    chart.options = jsonMerge(chart.options || {}, options);
    chart.userOptions = jsonMerge(chart.userOptions || {}, userOptions);

    chart.update(updateType);
}

function applySeries<
    T extends CartesianChart | PolarChart | HierarchyChart,
    O extends ChartOptionType<T>
>(chart: T, options: O) {
    const optSeries = options.series;
    if (!optSeries) {
        return;
    }

    const matchingTypes = chart.series.length === optSeries.length &&
        chart.series.every((s, i) => s.type === optSeries[i]?.type);

    // Try to optimise series updates if series count and types didn't change.
    if (matchingTypes) {
        chart.series.forEach((s, i) => {
            const previousOpts = chart.options?.series?.[i] || {};
            const seriesDiff = jsonDiff(previousOpts, optSeries[i] || {}) as any;

            if (!seriesDiff) {
                return;
            }

            debug(`applying series diff idx ${i}`, seriesDiff);

            jsonApply(s, seriesDiff);
            s.markNodeDataDirty();
        });

        return;
    }

    chart.series = createSeries(optSeries);
}

function applyAxes<
    T extends CartesianChart | PolarChart | HierarchyChart,
    O extends ChartOptionType<T>,
>(chart: T, options: O  & AgCartesianChartOptions) {
    const optAxes = options.axes;
    if (!optAxes) {
        return false;
    }

    const matchingTypes = chart.axes.length === optAxes.length &&
        chart.axes.every((a, i) => a.type === optAxes[i].type);

    // Try to optimise series updates if series count and types didn't change.
    if (matchingTypes) {
        const oldOpts = chart.options;
        if (isAgCartesianChartOptions(oldOpts)) {
            chart.axes.forEach((a, i) => {
                const previousOpts = oldOpts.axes?.[i] || {};
                const axisDiff = jsonDiff(previousOpts, optAxes[i]) as any;

                debug(`applying axis diff idx ${i}`, axisDiff);

                jsonApply(a, axisDiff);
            });
            return true;
        }
    }

    chart.axes = createAxis(optAxes);
    return true;
}

function createSeries(options: SeriesOptionsTypes[]): Series[] {
    const series: Series<any>[] = [];
    const skip: (keyof NonNullable<SeriesOptionsTypes>)[] = ['listeners'];

    let index = 0;
    for (const seriesOptions of options || []) {
        const path = `series[${index++}]`;
        switch (seriesOptions.type) {
            case 'area':
                series.push(applySeriesValues(new AreaSeries(), seriesOptions, {path, skip}));
                break;
            case 'bar':
                // fall-through - bar and column are synonyms.
            case 'column':
                series.push(applySeriesValues(new BarSeries(), seriesOptions, {path, skip}));
                break;
            case 'histogram':
                series.push(applySeriesValues(new HistogramSeries(), seriesOptions, {path, skip}));
                break;
            case 'line':
                series.push(applySeriesValues(new LineSeries(), seriesOptions, {path, skip}));
                break;
            case 'scatter':
                series.push(applySeriesValues(new ScatterSeries(), seriesOptions, {path, skip}));
                break;
            case 'pie':
                series.push(applySeriesValues(new PieSeries(), seriesOptions, {path, skip}));
                break;
            case 'treemap':
                series.push(applySeriesValues(new TreemapSeries(), seriesOptions, {path, skip}));
                break;
            default:
                throw new Error('AG Charts - unknown series type: ' + (seriesOptions as any).type);
        }
    }

    series.forEach((next, index) => {
        const listeners = options?.[index]?.listeners;
        if (listeners == null) { return; }
        registerListeners(next, listeners as {[key: string]: Function});
    });

    return series;
}

function createAxis(options: AgCartesianAxisOptions[]): ChartAxis[] {
    const axes: ChartAxis[] = [];

    let index = 0;
    for (const axisOptions of options || []) {
        const path = `axis[${index++}]`;
        switch (axisOptions.type) {
            case 'number':
                axes.push(applyAxisValues(new NumberAxis(), axisOptions, {path}));
                break;
            case LogAxis.type:
                axes.push(applyAxisValues(new LogAxis(), axisOptions, {path}));
                break;
            case CategoryAxis.type:
                axes.push(applyAxisValues(new CategoryAxis(), axisOptions, {path}));
                break;
            case GroupedCategoryAxis.type:
                axes.push(applyAxisValues(new GroupedCategoryAxis(), axisOptions, {path}));
                break;
            case TimeAxis.type:
                axes.push(applyAxisValues(new TimeAxis(), axisOptions, {path}));
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

const JSON_APPLY_OPTIONS: Parameters<typeof jsonApply>[2] = {
    constructors: {
        'title': Caption,
        'subtitle': Caption,
        'shadow': DropShadow,
        'axes[].crossLines[]': CrossLine,
    },
    allowedTypes: {
        'series[].marker.shape': ['primitive', 'function'],
        'axis[].tick.count': ['primitive', 'class-instance'],
    },
};

function applyOptionValues<T extends ChartType, S extends ChartOptionType<T>>(
    target: T,
    options?: S,
    { skip, path }: { skip?: (keyof T | keyof S)[], path?: string } = {},
): T {
    const applyOpts = {
        ...JSON_APPLY_OPTIONS,
        skip: ['type' as keyof (T|S), ...(skip || [])],
        ...(path ? { path } : {}),
    };
    return jsonApply<T, any>(target, options, applyOpts);
}

function applySeriesValues<T extends Series<any>, S extends SeriesOptionType<T>>(
    target: T,
    options?: S,
    { skip, path }: { skip?: (keyof T | keyof S)[], path?: string } = {},
): T {
    const ctrs = JSON_APPLY_OPTIONS?.constructors || {};
    const seriesTypeOverrides = {
        constructors: {
            ...ctrs,
            'title': target.type === 'pie' ? PieTitle : ctrs['title'],
        },
    };

    const applyOpts = {
        ...JSON_APPLY_OPTIONS,
        ...seriesTypeOverrides,
        skip: ['type' as keyof (T|S), ...(skip || [])],
        ...(path ? { path } : {}),
    };
    return jsonApply<T, any>(target, options, applyOpts);
}

function applyAxisValues<T extends Axis<any, any>, S extends AxisOptionType<T>>(
    target: T,
    options?: S,
    { skip, path }: { skip?: (keyof T | keyof S)[], path?: string } = {},
): T {
    const ctrs = JSON_APPLY_OPTIONS?.constructors || {};
    const axisOverrides = {
        constructors: {
            ...ctrs,
            'crossLines': ctrs['axes[].crossLines[]'],
        },
    };

    const applyOpts = {
        ...JSON_APPLY_OPTIONS,
        ...axisOverrides,
        skip: ['type' as keyof (T|S), ...(skip || [])],
        ...(path ? { path } : {}),
    };
    return jsonApply<T, any>(target, options, applyOpts);
}
