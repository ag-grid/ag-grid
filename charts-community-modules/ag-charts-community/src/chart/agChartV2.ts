import {
    AgChartOptions,
    AgCartesianChartOptions,
    AgCartesianAxisOptions,
    AgLineSeriesOptions,
    AgBarSeriesOptions,
    AgAreaSeriesOptions,
    AgScatterSeriesOptions,
    AgHistogramSeriesOptions,
    AgPieSeriesOptions,
    AgTreemapSeriesOptions,
    AgChartInstance,
    AgBaseAxisOptions,
} from './agChartOptions';
import { CartesianChart } from './cartesianChart';
import { PolarChart } from './polarChart';
import { HierarchyChart } from './hierarchyChart';
import { Caption } from '../caption';
import { Series } from './series/series';
import { getSeries, initialiseSeriesModules, seriesDefaults } from './series/seriesTypes';
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
import { Chart } from './chart';
import { ChartUpdateType } from './chartUpdateType';
import { TypedEventListener } from '../util/observable';
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
import { AxisModule, Module, RootModule } from '../util/module';
import { Logger } from '../util/logger';
import { BackgroundImage } from './background/backgroundImage';

// Deliberately imported via `module-support` so that internal module registration happens.
import { REGISTERED_MODULES } from '../module-support';

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

export interface DownloadOptions extends ImageDataUrlOptions {
    /** Name of downloaded image file. Defaults to `image`.  */
    fileName?: string;
}

export interface ImageDataUrlOptions {
    /** Width of downloaded chart image in pixels. Defaults to current chart width. */
    width?: number;
    /** Height of downloaded chart image in pixels. Defaults to current chart height. */
    height?: number;
    /** A MIME-type string indicating the image format. The default format type is `image/png`. Options: `image/png`, `image/jpeg`.  */
    fileFormat?: string;
}

function chartType(options: any): 'cartesian' | 'polar' | 'hierarchy' {
    if (isAgCartesianChartOptions(options)) {
        return 'cartesian';
    } else if (isAgPolarChartOptions(options)) {
        return 'polar';
    } else if (isAgHierarchyChartOptions(options)) {
        return 'hierarchy';
    }

    throw new Error(`AG Chart - unknown type of chart for options with type: ${options.type}`);
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
        return AgChartInternal.createOrUpdate(options as any);
    }

    /**
     * Update an existing `AgChartInstance`. Options provided should be complete and not
     * partial.
     * <br/>
     * <br/>
     * **NOTE**: As each call could trigger a chart redraw, multiple calls to update options in
     * quick succession could result in undesirable flickering, so callers should batch up and/or
     * debounce changes to avoid unintended partial update renderings.
     */
    public static update(chart: AgChartInstance, options: AgChartOptions) {
        if (!AgChartInstanceProxy.isInstance(chart)) {
            throw new Error('AG Charts - invalid chart reference passed');
        }
        AgChartInternal.createOrUpdate(options as any, chart);
    }

    /**
     * Update an existing `AgChartInstance` by applying a partial set of option changes.
     * <br/>
     * <br/>
     * **NOTE**: As each call could trigger a chart redraw, each individual delta options update
     * should leave the chart in a valid options state. Also, multiple calls to update options in
     * quick succession could result in undesirable flickering, so callers should batch up and/or
     * debounce changes to avoid unintended partial update renderings.
     */
    public static updateDelta(chart: AgChartInstance, deltaOptions: DeepPartial<AgChartOptions>) {
        if (!AgChartInstanceProxy.isInstance(chart)) {
            throw new Error('AG Charts - invalid chart reference passed');
        }
        return AgChartInternal.updateUserDelta(chart, deltaOptions as any);
    }

    /**
     * Starts a browser-based image download for the given `AgChartInstance`.
     */
    public static download(chart: AgChartInstance, options?: DownloadOptions) {
        if (!(chart instanceof AgChartInstanceProxy)) {
            throw new Error('AG Charts - invalid chart reference passed');
        }
        return AgChartInternal.download(chart, options);
    }

    /**
     * Returns a base64-encoded image data URL for the given `AgChartInstance`.
     */
    public static getImageDataURL(chart: AgChartInstance, options?: ImageDataUrlOptions): Promise<string> {
        if (!(chart instanceof AgChartInstanceProxy)) {
            throw new Error('AG Charts - invalid chart reference passed');
        }
        return AgChartInternal.getImageDataURL(chart, options);
    }
}

/**
 * Proxy class, to allow library users to keep a stable reference to their chart, even if we need
 * to switch concrete class (e.g. when switching between CartesianChart vs. PolarChart).
 */
class AgChartInstanceProxy implements AgChartInstance {
    chart: Chart;

    static isInstance(x: any): x is AgChartInstanceProxy {
        if (x instanceof AgChartInstanceProxy) {
            // Simple case.
            return true;
        }

        if (x.constructor?.name === 'AgChartInstanceProxy' && x.chart != null) {
            // instanceof can fail if mixing bundles (e.g. grid all-modules vs. standalone).
            return true;
        }

        const signatureProps = Object.keys(x.constructor?.prototype);
        const heuristicTypeCheck = Object.keys(AgChartInstanceProxy.prototype).every((prop) =>
            signatureProps.includes(prop)
        );
        if (heuristicTypeCheck && x.chart != null) {
            // minimised code case - the constructor name is mangled but prototype names are not :P
            return true;
        }

        return false;
    }

    constructor(chart: Chart) {
        this.chart = chart;
    }

    getOptions() {
        return this.chart.getOptions();
    }

    destroy() {
        this.chart.destroy();
    }
}

abstract class AgChartInternal {
    static DEBUG = () => windowValue('agChartsDebug') ?? false;

    static createOrUpdate(
        userOptions: AgChartOptions & { overrideDevicePixelRatio?: number },
        proxy?: AgChartInstanceProxy
    ) {
        debug('>>> createOrUpdate() user options', userOptions);
        const mixinOpts: any = {};
        if (AgChartInternal.DEBUG() === true) {
            mixinOpts['debug'] = true;
        }

        const { overrideDevicePixelRatio } = userOptions;
        delete userOptions['overrideDevicePixelRatio'];

        initialiseSeriesModules();

        const processedOptions = prepareOptions(userOptions, mixinOpts, seriesDefaults);
        let chart = proxy?.chart;
        if (chart == null || chartType(userOptions as any) !== chartType(chart.processedOptions as any)) {
            chart = AgChartInternal.createChartInstance(processedOptions, overrideDevicePixelRatio, chart);
        }

        if (proxy == null) {
            proxy = new AgChartInstanceProxy(chart);
        } else {
            proxy.chart = chart;
        }

        const chartToUpdate = chart;
        chartToUpdate.queuedUserOptions.push(userOptions);
        const dequeue = () => {
            // If there are a lot of update calls, `requestFactoryUpdate()` may skip callbacks,
            // so we need to remove all queue items up to the last successfully applied item.
            const queuedOptionsIdx = chartToUpdate.queuedUserOptions.indexOf(userOptions);
            chartToUpdate.queuedUserOptions.splice(0, queuedOptionsIdx);
        };

        chartToUpdate.requestFactoryUpdate(async () => {
            // Chart destroyed, skip processing.
            if (chartToUpdate.destroyed) return;

            const deltaOptions = jsonDiff(chartToUpdate.processedOptions, processedOptions);
            if (deltaOptions == null) {
                dequeue();
                return;
            }

            await AgChartInternal.updateDelta(chartToUpdate, deltaOptions, userOptions);
            dequeue();
        });

        return proxy;
    }

    static updateUserDelta(proxy: AgChartInstanceProxy, deltaOptions: DeepPartial<AgChartOptions>) {
        const {
            chart,
            chart: { queuedUserOptions },
        } = proxy;

        const lastUpdateOptions = queuedUserOptions[queuedUserOptions.length - 1] ?? chart.userOptions;
        const userOptions = jsonMerge([lastUpdateOptions, deltaOptions]);
        debug('>>> updateUserDelta() user delta', deltaOptions);
        debug('base options', lastUpdateOptions);
        AgChartInternal.createOrUpdate(userOptions as any, proxy);
    }

    /**
     * Returns the content of the current canvas as an image.
     * @param opts The download options including `width` and `height` of the image as well as `fileName` and `fileFormat`.
     */
    static download(proxy: AgChartInstanceProxy, opts?: DownloadOptions) {
        const asyncDownload = async () => {
            const maybeClone = await AgChartInternal.prepareResizedChart(proxy, opts);

            const { chart } = maybeClone;
            chart.scene.download(opts?.fileName, opts?.fileFormat);

            if (maybeClone !== proxy) {
                maybeClone.destroy();
            }
        };

        asyncDownload();
    }

    static async getImageDataURL(proxy: AgChartInstanceProxy, opts?: ImageDataUrlOptions): Promise<string> {
        const maybeClone = await AgChartInternal.prepareResizedChart(proxy, opts);

        const { chart } = maybeClone;
        const result = chart.scene.canvas.getDataURL(opts?.fileFormat);

        if (maybeClone !== proxy) {
            maybeClone.destroy();
        }

        return result;
    }

    private static async prepareResizedChart(
        proxy: AgChartInstanceProxy,
        opts?: DownloadOptions | ImageDataUrlOptions
    ) {
        const { chart } = proxy;

        let { width, height } = opts || {};
        const currentWidth = chart.width;
        const currentHeight = chart.height;

        const unchanged =
            (width === undefined && height === undefined) ||
            (chart.scene.canvas.pixelRatio === 1 && currentWidth === width && currentHeight === height);

        if (unchanged) {
            return proxy;
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

        const clonedChart = AgChartInternal.createOrUpdate(options as any);

        await clonedChart.chart.waitForUpdate();
        return clonedChart;
    }

    private static createChartInstance(
        options: AgChartOptions,
        overrideDevicePixelRatio?: number,
        oldChart?: Chart
    ): Chart {
        const transferableResource = oldChart?.destroy({ keepTransferableResources: true });

        if (isAgCartesianChartOptions(options)) {
            return new CartesianChart(document, overrideDevicePixelRatio, transferableResource);
        } else if (isAgHierarchyChartOptions(options)) {
            return new HierarchyChart(document, overrideDevicePixelRatio, transferableResource);
        } else if (isAgPolarChartOptions(options)) {
            return new PolarChart(document, overrideDevicePixelRatio, transferableResource);
        }

        throw new Error(`AG Charts - couldn't apply configuration, check type of options: ${options['type']}`);
    }

    private static async updateDelta(
        chart: Chart,
        processedOptions: Partial<AgChartOptions>,
        userOptions: AgChartOptions
    ) {
        if (processedOptions.type == null) {
            processedOptions = {
                ...processedOptions,
                type: chart.processedOptions.type || optionsType(processedOptions),
            } as Partial<AgChartOptions>;
        }

        await chart.awaitUpdateCompletion();

        if (chart.destroyed) return;

        debug('applying delta', processedOptions);
        applyChartOptions(chart, processedOptions, userOptions);
    }
}

function debug(message?: any, ...optionalParams: any[]): void {
    if ([true, 'opts'].includes(AgChartInternal.DEBUG())) {
        Logger.debug(message, ...optionalParams);
    }
}

function applyChartOptions(chart: Chart, processedOptions: Partial<AgChartOptions>, userOptions: AgChartOptions): void {
    const completeOptions = jsonMerge([chart.processedOptions ?? {}, processedOptions], noDataCloneMergeOptions);
    const modulesChanged = applyModules(chart, completeOptions);

    const skip = ['type', 'data', 'series', 'autoSize', 'listeners', 'theme', 'legend.listeners'];
    if (isAgCartesianChartOptions(processedOptions)) {
        // Append axes to defaults.
        skip.push('axes');
    } else if (isAgPolarChartOptions(processedOptions) || isAgHierarchyChartOptions(processedOptions)) {
        // Use defaults.
    } else {
        throw new Error(
            `AG Charts - couldn't apply configuration, check type of options and chart: ${processedOptions['type']}`
        );
    }

    // Needs to be done before applying the series to detect if a seriesNode[Double]Click listener has been added
    if (processedOptions.listeners) {
        registerListeners(chart, processedOptions.listeners);
    }

    applyOptionValues(chart, processedOptions, { skip });

    let forceNodeDataRefresh = false;
    if (processedOptions.series && processedOptions.series.length > 0) {
        applySeries(chart, processedOptions);
        forceNodeDataRefresh = true;
    }
    if (isAgCartesianChartOptions(processedOptions) && processedOptions.axes) {
        const axesPresent = applyAxes(chart, processedOptions);
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
    if (processedOptions.legend?.listeners) {
        Object.assign(chart.legend.listeners, processedOptions.legend.listeners ?? {});
    }

    chart.processedOptions = completeOptions;
    chart.userOptions = jsonMerge([chart.userOptions ?? {}, userOptions], noDataCloneMergeOptions);

    const majorChange = forceNodeDataRefresh || modulesChanged;
    const updateType = majorChange ? ChartUpdateType.PROCESS_DATA : ChartUpdateType.PERFORM_LAYOUT;
    debug('chart update type', { updateType: ChartUpdateType[updateType] });
    chart.update(updateType, { forceNodeDataRefresh });
}

function applyModules(chart: Chart, options: AgChartOptions) {
    const matchingChartType = (module: Module) => {
        return (
            (chart instanceof CartesianChart && module.chartTypes.includes('cartesian')) ||
            (chart instanceof PolarChart && module.chartTypes.includes('polar')) ||
            (chart instanceof HierarchyChart && module.chartTypes.includes('hierarchy'))
        );
    };

    let modulesChanged = false;
    const rootModules = REGISTERED_MODULES.filter((m): m is RootModule => m.type === 'root');
    for (const next of rootModules) {
        const shouldBeEnabled = matchingChartType(next) && (options as any)[next.optionsKey] != null;
        const isEnabled = chart.isModuleEnabled(next);

        if (shouldBeEnabled === isEnabled) continue;
        modulesChanged = true;

        if (shouldBeEnabled) {
            chart.addModule(next);
        } else {
            chart.removeModule(next);
        }
    }

    return modulesChanged;
}

function applySeries(chart: Chart, options: AgChartOptions) {
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

            applySeriesValues(s as any, seriesDiff, { path: `series[${i}]`, index: i });
            s.markNodeDataDirty();
        });

        return;
    }

    chart.series = createSeries(optSeries);
}

function applyAxes(chart: Chart, options: AgCartesianChartOptions) {
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

    chart.axes = createAxis(chart, optAxes);
    return true;
}

function createSeries(options: SeriesOptionsTypes[]): Series[] {
    const series: Series<any>[] = [];

    let index = 0;
    for (const seriesOptions of options || []) {
        const path = `series[${index++}]`;
        const seriesInstance = getSeries(seriesOptions.type!);
        applySeriesValues(seriesInstance, seriesOptions, { path, index });
        series.push(seriesInstance);
    }

    return series;
}

function createAxis(chart: Chart, options: AgCartesianAxisOptions[]): ChartAxis[] {
    const axes: ChartAxis[] = [];
    const skip = ['axes[].type'];
    const moduleContext = chart.getModuleContext();

    let index = 0;
    for (const axisOptions of options || []) {
        let axis;
        switch (axisOptions.type) {
            case 'number':
                axis = new NumberAxis(moduleContext);
                break;
            case LogAxis.type:
                axis = new LogAxis(moduleContext);
                break;
            case CategoryAxis.type:
                axis = new CategoryAxis(moduleContext);
                break;
            case GroupedCategoryAxis.type:
                axis = new GroupedCategoryAxis(moduleContext);
                break;
            case TimeAxis.type:
                axis = new TimeAxis(moduleContext);
                break;
            default:
                throw new Error('AG Charts - unknown axis type: ' + axisOptions['type']);
        }

        const path = `axes[${index++}]`;
        applyAxisModules(axis, axisOptions);
        applyOptionValues(axis, axisOptions, { path, skip });

        axes.push(axis);
    }

    return axes;
}

function applyAxisModules(axis: ChartAxis, options: AgBaseAxisOptions) {
    let modulesChanged = false;
    const rootModules = REGISTERED_MODULES.filter((m): m is AxisModule => m.type === 'axis');

    for (const next of rootModules) {
        const shouldBeEnabled = (options as any)[next.optionsKey] != null;
        const isEnabled = axis.isModuleEnabled(next);

        if (shouldBeEnabled === isEnabled) continue;
        modulesChanged = true;

        if (shouldBeEnabled) {
            axis.addModule(next);
        } else {
            axis.removeModule(next);
        }
    }

    return modulesChanged;
}

type ObservableLike = {
    addEventListener(key: string, cb: TypedEventListener): void;
    clearEventListeners(): void;
};
function registerListeners<T extends ObservableLike>(source: T, listeners?: {}) {
    source.clearEventListeners();
    for (const property in listeners) {
        const listener = (listeners as any)[property] as TypedEventListener;
        if (typeof listener !== 'function') continue;

        source.addEventListener(property, listener);
    }
}

const JSON_APPLY_OPTIONS: Parameters<typeof jsonApply>[2] = {
    constructors: {
        title: Caption,
        subtitle: Caption,
        footnote: Caption,
        shadow: DropShadow,
        innerCircle: DoughnutInnerCircle,
        'axes[].crossLines[]': CrossLine,
        'series[].innerLabels[]': DoughnutInnerLabel,
        'background.image': BackgroundImage,
    },
    allowedTypes: {
        'legend.pagination.marker.shape': ['primitive', 'function'],
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

function applySeriesValues(
    target: Series<any>,
    options?: SeriesOptionType<any>,
    { path, index }: { path?: string; index?: number } = {}
): Series<any> {
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
        idx: index ?? -1,
    };

    const result = jsonApply(target, options, applyOpts);

    const listeners = options?.listeners;
    if (listeners != null) {
        registerListeners(target, listeners as unknown as { [key: string]: Function });
    }

    return result;
}
