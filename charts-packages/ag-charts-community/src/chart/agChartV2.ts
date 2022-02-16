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
import { Chart } from './chart';
import { SourceEventListener } from '../util/observable';
import { DropShadow } from '../scene/dropShadow';
import { jsonDiff, jsonMerge, jsonApply } from '../util/json';
import { Axis } from '../axis';
import { GroupedCategoryChart } from './groupedCategoryChart';
import { prepareOptions, isAgCartesianChartOptions, isAgHierarchyChartOptions, isAgPolarChartOptions, optionsType } from './mapping/prepare';

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
    static createComponent(options: any, type: string): any {
        if (type.indexOf('.series') >= 0) {
            const optionsWithType = {
                ...options,
                type: options.type || type.split('.')[0],
            };
            console.warn('AG Charts - createComponent should no longer be used, use AgChart.update() instead.')
            return createSeries([optionsWithType])[0];
        }

        throw new Error('AG Charts - createComponent should no longer be used, use AgChart.update() instead.');
    }

    static create<T extends AgChartOptions>(options: T, container?: HTMLElement, data?: any[]): AgChartType<T> {
        return AgChartV2.create(options as any);
    }

    static update<T extends AgChartOptions>(chart: AgChartType<T>, options: T, container?: HTMLElement, data?: any[]) {
        return AgChartV2.update(chart, options as any);
    }
}

export abstract class AgChartV2 {
    static create<T extends ChartType>(userOptions: ChartOptionType<T>): T {
        // console.log('user options', userOptions);
        const mergedOptions = prepareOptions(userOptions);

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
        // console.log('user options', userOptions);
        const mergedOptions = prepareOptions(userOptions, chart.userOptions as ChartOptionType<T>);

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
        // console.log('delta update', update);
        applyChartOptions(chart, update as ChartOptionType<typeof chart>, userOptions)
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

    let performProcessData = false;
    if (options.series) {
        chart.series = createSeries(options.series);
    }
    if (isAgCartesianChartOptions(options) && options.axes) {
        chart.axes = createAxis(options.axes);
        performProcessData = true;
    }
    if (options.data) {
        chart.data = options.data;
        performProcessData = true;
    }

    // Needs to be done last to avoid overrides by width/height properties.
    if (options.autoSize != null) {
        chart.autoSize = options.autoSize;
    }
    if (options.listeners) {
        registerListeners(chart, options.listeners);
    }

    chart.layoutPending = true;
    if (performProcessData) {
        chart.processData();
    }
    chart.performLayout();

    chart.options = jsonMerge(chart.options || {}, options);
    chart.userOptions = jsonMerge(chart.userOptions || {}, userOptions);
}

function createSeries(options: AgChartOptions['series']): Series[] {
    const series: Series[] = [];
    const skip: (keyof NonNullable<AgChartOptions['series']>[number])[] = ['listeners'];

    let index = 0;
    for (const seriesOptions of options || []) {
        const path = `series[${index++}]`;
        switch (seriesOptions.type) {
            case 'area':
                series.push(applySeriesValues(new AreaSeries(), seriesOptions, {path, skip}));
                break;
            case 'bar':
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
            case 'ohlc':
            default:
                throw new Error('AG Charts - unknown series type: ' + seriesOptions.type);
        }
    }

    series.forEach((next, index) => {
        const listeners = options?.[index]?.listeners;
        if (listeners == null) { return; }
        registerListeners(next, listeners);
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

function applySeriesValues<T extends Series, S extends SeriesOptionType<T>>(
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
    const applyOpts = {
        ...JSON_APPLY_OPTIONS,
        skip: ['type' as keyof (T|S), ...(skip || [])], 
        ...(path ? { path } : {}),
    };
    return jsonApply<T, any>(target, options, applyOpts);
}
