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
    AgChartInstance,
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
import { PieSeries, PieTitle, DoughnutInnerLabel, DoughnutInnerCircle } from './series/polar/pieSeries';
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
import {
    prepareOptions,
    isAgCartesianChartOptions,
    isAgHierarchyChartOptions,
    isAgPolarChartOptions,
    optionsType,
    noDataCloneMergeOptions,
} from './mapping/prepare';
import { SeriesOptionsTypes } from './mapping/defaults';
import { CrossLine } from './crossline/crossLine';
import { windowValue } from '../util/window';

type ChartType = CartesianChart | PolarChart | HierarchyChart;

type AgChartType<T> = T extends AgCartesianChartOptions
    ? CartesianChart
    : T extends AgPolarChartOptions
    ? PolarChart
    : T extends AgHierarchyChartOptions
    ? HierarchyChart
    : never;

type ChartOptionType<T extends ChartType> = T extends CartesianChart
    ? AgCartesianChartOptions
    : T extends PolarChart
    ? AgPolarChartOptions
    : T extends HierarchyChart
    ? AgHierarchyChartOptions
    : never;

type SeriesOptionType<T extends Series> = T extends LineSeries
    ? AgLineSeriesOptions
    : T extends BarSeries
    ? AgBarSeriesOptions
    : T extends AreaSeries
    ? AgAreaSeriesOptions
    : T extends ScatterSeries
    ? AgScatterSeriesOptions
    : T extends HistogramSeries
    ? AgHistogramSeriesOptions
    : T extends PieSeries
    ? AgPieSeriesOptions
    : T extends TreemapSeries
    ? AgTreemapSeriesOptions
    : never;

type DownloadOptions = {
    width?: number;
    height?: number;
    fileName?: string;
    /** The standard MIME type for the image format to return. If you do not specify this parameter, the default value is a PNG format image. See `Canvas.toDataURL()` */
    fileFormat?: string;
};

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

type DeepPartialDepth = [never, 0, 1, 2, 3, 4, 5, 6]; // DeepPartial recursion limit type.
type DeepPartial<T, N extends DeepPartialDepth[number] = 5> = [N] extends [never]
    ? Partial<T>
    : T extends object
    ? { [P in keyof T]?: DeepPartial<T[P], DeepPartialDepth[N]> }
    : T;

/**
 * Factory for creating and updating instances of AgChartInstance.
 *
 * @docsInterface
 */
export abstract class AgChart {
    /**
     * Create a new `AgChartInstance` based upon the given configuration options.
     */
    public static create(options: AgChartOptions): AgChartInstance {
        return AgChartInternal.create(options as any);
    }

    /**
     * Update an existing `AgChartInstance`. Options provided should be complete and not
     * partial.
     *
     * NOTE: each call could trigger a redraw; multiple calls in quick succession could result in
     * undesirable flickering, so callers should batch up and/or debounce changes to avoid
     * unintended partial update renderings.
     */
    public static update(chart: AgChartInstance, options: AgChartOptions) {
        return AgChartInternal.update(chart as AgChartType<any>, options as any);
    }

    /**
     * Update an existing `AgChartInstance` by applying a partial set of option changes.
     *
     * NOTE: each call could trigger a redraw, each delta should leave the chart in a valid options
     * state. Multiple calls in quick succession could result in undesirable flickering, so callers
     * should batch up and/or debounce changes to avoid unintended partial update renderings.
     */
    public static updateDelta(chart: AgChartInstance, deltaOptions: DeepPartial<AgChartOptions>) {
        return AgChartInternal.updateUserDelta(chart as AgChartType<any>, deltaOptions as any);
    }

    /**
     * Initiate a browser-based image download for the given `AgChartInstance`s rendering.
     */
    public static download(chart: AgChartInstance, options?: DownloadOptions) {
        return AgChartInternal.download(chart as AgChartType<any>, options);
    }
}

abstract class AgChartInternal {
    static DEBUG = () => windowValue('agChartsDebug') ?? false;

    static create<T extends ChartType>(userOptions: ChartOptionType<T> & { overrideDevicePixelRatio?: number }): T {
        debug('user options', userOptions);
        const mixinOpts: any = {};
        if (AgChartInternal.DEBUG()) {
            mixinOpts['debug'] = true;
        }

        const { overrideDevicePixelRatio } = userOptions;
        delete userOptions['overrideDevicePixelRatio'];

        const processedOptions = prepareOptions(userOptions, mixinOpts);

        let maybeChart: ChartType | undefined = undefined;
        if (isAgCartesianChartOptions(processedOptions)) {
            maybeChart = new CartesianChart(document, overrideDevicePixelRatio);
        } else if (isAgHierarchyChartOptions(processedOptions)) {
            maybeChart = new HierarchyChart(document, overrideDevicePixelRatio);
        } else if (isAgPolarChartOptions(processedOptions)) {
            maybeChart = new PolarChart(document, overrideDevicePixelRatio);
        }

        if (!maybeChart) {
            throw new Error(
                `AG Charts - couldn\'t apply configuration, check type of options: ${processedOptions['type']}`
            );
        }

        const chart = maybeChart;
        chart.requestFactoryUpdate(async () => {
            if (chart.destroyed) {
                // Chart destroyed, skip processing.
                return;
            }

            await AgChartInternal.updateDelta(chart, processedOptions, userOptions);
        });
        return chart as T;
    }

    static update<T extends ChartType>(chart: Chart, userOptions: ChartOptionType<T>) {
        debug('user options', userOptions);
        const mixinOpts: any = {};
        if (AgChartInternal.DEBUG()) {
            mixinOpts['debug'] = true;
        }

        chart.requestFactoryUpdate(async () => {
            if (chart.destroyed) {
                // Chart destroyed, skip processing.
                return;
            }

            const processedOptions = prepareOptions(userOptions, chart.userOptions as ChartOptionType<T>, mixinOpts);

            if (chartType(processedOptions) !== chartType(chart.processedOptions as ChartOptionType<typeof chart>)) {
                chart.destroy();
                console.warn(
                    'AG Charts - options supplied require a different type of chart, please recreate the chart.'
                );
                return;
            }

            const deltaOptions = jsonDiff<ChartOptionType<T>>(
                chart.processedOptions as ChartOptionType<T>,
                processedOptions
            );
            if (deltaOptions == null) {
                return;
            }

            await AgChartInternal.updateDelta<T>(chart as T, deltaOptions, userOptions);
        });
    }

    static updateUserDelta<T extends ChartType>(chart: Chart, deltaOptions: DeepPartial<ChartOptionType<T>>) {
        const userOptions = jsonMerge([chart.userOptions, deltaOptions]);
        AgChartInternal.update(chart, userOptions as any);
    }

    /**
     * Returns the content of the current canvas as an image.
     * @param opts The download options including `width` and `height` of the image as well as `fileName` and `fileFormat`.
     */
    static download(chart: Chart, opts?: DownloadOptions) {
        let { width, height, fileName, fileFormat } = opts || {};
        const currentWidth = chart.width;
        const currentHeight = chart.height;

        const unchanged =
            (width === undefined && height === undefined) ||
            (chart.scene.canvas.pixelRatio === 1 && currentWidth === width && currentHeight === height);

        if (unchanged) {
            chart.scene.download(fileName, fileFormat);
            return;
        }

        width = width ?? currentWidth;
        height = height ?? currentHeight;

        const options = {
            ...chart.userOptions,
            container: document.createElement('div'),
            width,
            height,
            autoSize: false,
            overrideDevicePixelRatio: 1,
        };

        const clonedChart = AgChartInternal.create(options as any);

        clonedChart.waitForUpdate().then(() => {
            clonedChart.scene.download(fileName, fileFormat);
            clonedChart.destroy();
        });
    }

    private static async updateDelta<T extends ChartType>(
        chart: T,
        processedOptions: Partial<ChartOptionType<T>>,
        userOptions: ChartOptionType<T>
    ) {
        if (processedOptions.type == null) {
            processedOptions = {
                ...processedOptions,
                type: chart.processedOptions.type || optionsType(processedOptions),
            };
        }
        debug('delta update', processedOptions);

        await chart.awaitUpdateCompletion();

        applyChartOptions(chart, processedOptions as ChartOptionType<typeof chart>, userOptions);
    }
}

function debug(message?: any, ...optionalParams: any[]): void {
    if (AgChartInternal.DEBUG()) {
        console.log(message, ...optionalParams);
    }
}

function applyChartOptions<T extends ChartType, O extends ChartOptionType<T>>(
    chart: T,
    processedOptions: O,
    userOptions: O
): void {
    if (isAgCartesianChartOptions(processedOptions)) {
        applyOptionValues(chart, processedOptions, {
            skip: ['type', 'data', 'series', 'axes', 'autoSize', 'listeners', 'theme'],
        });
    } else if (isAgPolarChartOptions(processedOptions)) {
        applyOptionValues(chart, processedOptions, {
            skip: ['type', 'data', 'series', 'autoSize', 'listeners', 'theme'],
        });
    } else if (isAgHierarchyChartOptions(processedOptions)) {
        applyOptionValues(chart, processedOptions, {
            skip: ['type', 'data', 'series', 'autoSize', 'listeners', 'theme'],
        });
    } else {
        throw new Error(
            `AG Charts - couldn\'t apply configuration, check type of options and chart: ${processedOptions['type']}`
        );
    }

    let forceNodeDataRefresh = false;
    if (processedOptions.series && processedOptions.series.length > 0) {
        applySeries<T, O>(chart, processedOptions);
        forceNodeDataRefresh = true;
    }
    if (isAgCartesianChartOptions(processedOptions) && processedOptions.axes) {
        const axesPresent = applyAxes<T, O>(chart, processedOptions);
        if (axesPresent) {
            forceNodeDataRefresh = true;
        }
    }

    const seriesOpts = processedOptions.series as any[];
    const seriesDataUpdate = !!processedOptions.data || seriesOpts?.some((s) => s.data != null);
    const otherRefreshUpdate = processedOptions.legend || processedOptions.title || processedOptions.subtitle;
    forceNodeDataRefresh = forceNodeDataRefresh || seriesDataUpdate || !!otherRefreshUpdate;
    if (processedOptions.data) {
        chart.data = processedOptions.data;
    }

    // Needs to be done last to avoid overrides by width/height properties.
    if (processedOptions.autoSize != null) {
        chart.autoSize = processedOptions.autoSize;
    }
    if (processedOptions.listeners) {
        registerListeners(chart, processedOptions.listeners);
    }
    if (processedOptions.legend?.listeners) {
        Object.assign(chart.legend.listeners, processedOptions.legend.listeners);
    }

    chart.processedOptions = jsonMerge([chart.processedOptions || {}, processedOptions], noDataCloneMergeOptions);
    chart.userOptions = jsonMerge([chart.userOptions || {}, userOptions], noDataCloneMergeOptions);

    const updateType = forceNodeDataRefresh ? ChartUpdateType.PROCESS_DATA : ChartUpdateType.PERFORM_LAYOUT;
    chart.update(updateType, { forceNodeDataRefresh });
}

function applySeries<T extends ChartType, O extends ChartOptionType<T>>(chart: T, options: O) {
    const optSeries = options.series;
    if (!optSeries) {
        return;
    }

    const matchingTypes =
        chart.series.length === optSeries.length && chart.series.every((s, i) => s.type === optSeries[i]?.type);

    // Try to optimise series updates if series count and types didn't change.
    if (matchingTypes) {
        chart.series.forEach((s, i) => {
            const previousOpts = chart.processedOptions?.series?.[i] || {};
            const seriesDiff = jsonDiff(previousOpts, optSeries[i] || {}) as any;

            if (!seriesDiff) {
                return;
            }

            debug(`applying series diff idx ${i}`, seriesDiff);

            applySeriesValues(s as any, seriesDiff, { path: `series[${i}]` });
            s.markNodeDataDirty();
        });

        return;
    }

    chart.series = createSeries(optSeries);
}

function applyAxes<T extends ChartType, O extends ChartOptionType<T>>(chart: T, options: O & AgCartesianChartOptions) {
    const optAxes = options.axes;
    if (!optAxes) {
        return false;
    }

    const matchingTypes =
        chart.axes.length === optAxes.length && chart.axes.every((a, i) => a.type === optAxes[i].type);

    // Try to optimise series updates if series count and types didn't change.
    if (matchingTypes) {
        const oldOpts = chart.processedOptions;
        if (isAgCartesianChartOptions(oldOpts)) {
            chart.axes.forEach((a, i) => {
                const previousOpts = oldOpts.axes?.[i] || {};
                const axisDiff = jsonDiff(previousOpts, optAxes[i]) as any;

                debug(`applying axis diff idx ${i}`, axisDiff);

                const path = `axes[${i}]`;
                const skip = ['axes[].type'];
                applyOptionValues(a, axisDiff, { path, skip });
            });
            return true;
        }
    }

    chart.axes = createAxis(optAxes);
    return true;
}

function createSeries(options: SeriesOptionsTypes[]): Series[] {
    const series: Series<any>[] = [];

    let index = 0;
    for (const seriesOptions of options || []) {
        const path = `series[${index++}]`;
        switch (seriesOptions.type) {
            case 'area':
                series.push(applySeriesValues(new AreaSeries(), seriesOptions, { path }));
                break;
            case 'bar':
            // fall-through - bar and column are synonyms.
            case 'column':
                series.push(applySeriesValues(new BarSeries(), seriesOptions, { path }));
                break;
            case 'histogram':
                series.push(applySeriesValues(new HistogramSeries(), seriesOptions, { path }));
                break;
            case 'line':
                series.push(applySeriesValues(new LineSeries(), seriesOptions, { path }));
                break;
            case 'scatter':
                series.push(applySeriesValues(new ScatterSeries(), seriesOptions, { path }));
                break;
            case 'pie':
                series.push(applySeriesValues(new PieSeries(), seriesOptions, { path }));
                break;
            case 'treemap':
                series.push(applySeriesValues(new TreemapSeries(), seriesOptions, { path }));
                break;
            default:
                throw new Error('AG Charts - unknown series type: ' + (seriesOptions as any).type);
        }
    }

    return series;
}

function createAxis(options: AgCartesianAxisOptions[]): ChartAxis[] {
    const axes: ChartAxis[] = [];

    let index = 0;
    for (const axisOptions of options || []) {
        const path = `axes[${index++}]`;
        const skip = ['axes[].type'];
        switch (axisOptions.type) {
            case 'number':
                axes.push(applyOptionValues(new NumberAxis(), axisOptions, { path, skip }));
                break;
            case LogAxis.type:
                axes.push(applyOptionValues(new LogAxis(), axisOptions, { path, skip }));
                break;
            case CategoryAxis.type:
                axes.push(applyOptionValues(new CategoryAxis(), axisOptions, { path, skip }));
                break;
            case GroupedCategoryAxis.type:
                axes.push(applyOptionValues(new GroupedCategoryAxis(), axisOptions, { path, skip }));
                break;
            case TimeAxis.type:
                axes.push(applyOptionValues(new TimeAxis(), axisOptions, { path, skip }));
                break;
            default:
                throw new Error('AG Charts - unknown axis type: ' + axisOptions['type']);
        }
    }

    return axes;
}

type ObservableLike = {
    addEventListener(key: string, cb: SourceEventListener<any>): void;
    clearEventListeners(): void;
};
function registerListeners<T extends ObservableLike>(source: T, listeners?: {}) {
    source.clearEventListeners();
    for (const property in listeners) {
        source.addEventListener(property, (listeners as any)[property] as SourceEventListener<any>);
    }
}

const JSON_APPLY_OPTIONS: Parameters<typeof jsonApply>[2] = {
    constructors: {
        title: Caption,
        subtitle: Caption,
        shadow: DropShadow,
        innerCircle: DoughnutInnerCircle,
        'axes[].crossLines[]': CrossLine,
        'series[].innerLabels[]': DoughnutInnerLabel,
    },
    allowedTypes: {
        'series[].marker.shape': ['primitive', 'function'],
        'axis[].tick.count': ['primitive', 'class-instance'],
    },
};

function applyOptionValues<T, S>(target: T, options?: S, { skip, path }: { skip?: string[]; path?: string } = {}): T {
    const applyOpts = {
        ...JSON_APPLY_OPTIONS,
        skip,
        ...(path ? { path } : {}),
    };
    return jsonApply<T, any>(target, options, applyOpts);
}

function applySeriesValues<T extends Series<any>, S extends SeriesOptionType<T>>(
    target: T,
    options?: S,
    { path }: { path?: string } = {}
): T {
    const skip: string[] = ['series[].listeners'];
    const ctrs = JSON_APPLY_OPTIONS?.constructors || {};
    const seriesTypeOverrides = {
        constructors: {
            ...ctrs,
            title: target.type === 'pie' ? PieTitle : ctrs['title'],
        },
    };

    const applyOpts = {
        ...JSON_APPLY_OPTIONS,
        ...seriesTypeOverrides,
        skip: ['series[].type', ...(skip || [])],
        ...(path ? { path } : {}),
    };

    const result = jsonApply<T, any>(target, options, applyOpts);

    const listeners = options?.listeners;
    if (listeners != null) {
        registerListeners(target, listeners as unknown as { [key: string]: Function });
    }

    return result;
}
