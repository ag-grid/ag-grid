var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { CartesianChart } from './cartesianChart';
import { PolarChart } from './polarChart';
import { HierarchyChart } from './hierarchyChart';
import { getSeries } from './factory/seriesTypes';
import { PieTitle } from './series/polar/pieSeries';
import { LogAxis } from './axis/logAxis';
import { NumberAxis } from './axis/numberAxis';
import { CategoryAxis } from './axis/categoryAxis';
import { GroupedCategoryAxis } from './axis/groupedCategoryAxis';
import { TimeAxis } from './axis/timeAxis';
import { ChartUpdateType } from './chartUpdateType';
import { jsonDiff, jsonMerge, jsonApply } from '../util/json';
import { prepareOptions, isAgCartesianChartOptions, isAgHierarchyChartOptions, isAgPolarChartOptions, optionsType, noDataCloneMergeOptions, } from './mapping/prepare';
import { windowValue } from '../util/window';
import { Logger } from '../util/logger';
import { getJsonApplyOptions } from './chartOptions';
// Deliberately imported via `module-support` so that internal module registration happens.
import { REGISTERED_MODULES } from '../module-support';
import { setupModules } from './factory/setupModules';
function chartType(options) {
    if (isAgCartesianChartOptions(options)) {
        return 'cartesian';
    }
    else if (isAgPolarChartOptions(options)) {
        return 'polar';
    }
    else if (isAgHierarchyChartOptions(options)) {
        return 'hierarchy';
    }
    throw new Error(`AG Chart - unknown type of chart for options with type: ${options.type}`);
}
/**
 * Factory for creating and updating instances of AgChartInstance.
 *
 * @docsInterface
 */
export class AgChart {
    /**
     * Create a new `AgChartInstance` based upon the given configuration options.
     */
    static create(options) {
        return AgChartInternal.createOrUpdate(options);
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
    static update(chart, options) {
        if (!AgChartInstanceProxy.isInstance(chart)) {
            throw new Error('AG Charts - invalid chart reference passed');
        }
        AgChartInternal.createOrUpdate(options, chart);
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
    static updateDelta(chart, deltaOptions) {
        if (!AgChartInstanceProxy.isInstance(chart)) {
            throw new Error('AG Charts - invalid chart reference passed');
        }
        return AgChartInternal.updateUserDelta(chart, deltaOptions);
    }
    /**
     * Starts a browser-based image download for the given `AgChartInstance`.
     */
    static download(chart, options) {
        if (!(chart instanceof AgChartInstanceProxy)) {
            throw new Error('AG Charts - invalid chart reference passed');
        }
        return AgChartInternal.download(chart, options);
    }
    /**
     * Returns a base64-encoded image data URL for the given `AgChartInstance`.
     */
    static getImageDataURL(chart, options) {
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
class AgChartInstanceProxy {
    constructor(chart) {
        this.chart = chart;
    }
    static isInstance(x) {
        var _a, _b;
        if (x instanceof AgChartInstanceProxy) {
            // Simple case.
            return true;
        }
        if (((_a = x.constructor) === null || _a === void 0 ? void 0 : _a.name) === 'AgChartInstanceProxy' && x.chart != null) {
            // instanceof can fail if mixing bundles (e.g. grid all-modules vs. standalone).
            return true;
        }
        const signatureProps = Object.keys((_b = x.constructor) === null || _b === void 0 ? void 0 : _b.prototype);
        const heuristicTypeCheck = Object.keys(AgChartInstanceProxy.prototype).every((prop) => signatureProps.includes(prop));
        if (heuristicTypeCheck && x.chart != null) {
            // minimised code case - the constructor name is mangled but prototype names are not :P
            return true;
        }
        return false;
    }
    getOptions() {
        return this.chart.getOptions();
    }
    destroy() {
        this.chart.destroy();
    }
}
class AgChartInternal {
    static initialiseModules() {
        if (AgChartInternal.initialised)
            return;
        setupModules();
        AgChartInternal.initialised = true;
    }
    static createOrUpdate(userOptions, proxy) {
        AgChartInternal.initialiseModules();
        debug('>>> createOrUpdate() user options', userOptions);
        const mixinOpts = {};
        if (AgChartInternal.DEBUG() === true) {
            mixinOpts['debug'] = true;
        }
        const { overrideDevicePixelRatio } = userOptions;
        delete userOptions['overrideDevicePixelRatio'];
        const processedOptions = prepareOptions(userOptions, mixinOpts);
        let chart = proxy === null || proxy === void 0 ? void 0 : proxy.chart;
        if (chart == null || chartType(userOptions) !== chartType(chart.processedOptions)) {
            chart = AgChartInternal.createChartInstance(processedOptions, overrideDevicePixelRatio, chart);
        }
        if (proxy == null) {
            proxy = new AgChartInstanceProxy(chart);
        }
        else {
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
        chartToUpdate.requestFactoryUpdate(() => __awaiter(this, void 0, void 0, function* () {
            // Chart destroyed, skip processing.
            if (chartToUpdate.destroyed)
                return;
            const deltaOptions = jsonDiff(chartToUpdate.processedOptions, processedOptions);
            if (deltaOptions == null) {
                dequeue();
                return;
            }
            yield AgChartInternal.updateDelta(chartToUpdate, deltaOptions, userOptions);
            dequeue();
        }));
        return proxy;
    }
    static updateUserDelta(proxy, deltaOptions) {
        var _a;
        const { chart, chart: { queuedUserOptions }, } = proxy;
        const lastUpdateOptions = (_a = queuedUserOptions[queuedUserOptions.length - 1]) !== null && _a !== void 0 ? _a : chart.userOptions;
        const userOptions = jsonMerge([lastUpdateOptions, deltaOptions]);
        debug('>>> updateUserDelta() user delta', deltaOptions);
        debug('base options', lastUpdateOptions);
        AgChartInternal.createOrUpdate(userOptions, proxy);
    }
    /**
     * Returns the content of the current canvas as an image.
     * @param opts The download options including `width` and `height` of the image as well as `fileName` and `fileFormat`.
     */
    static download(proxy, opts) {
        const asyncDownload = () => __awaiter(this, void 0, void 0, function* () {
            const maybeClone = yield AgChartInternal.prepareResizedChart(proxy, opts);
            const { chart } = maybeClone;
            chart.scene.download(opts === null || opts === void 0 ? void 0 : opts.fileName, opts === null || opts === void 0 ? void 0 : opts.fileFormat);
            if (maybeClone !== proxy) {
                maybeClone.destroy();
            }
        });
        asyncDownload().catch((e) => Logger.errorOnce(e));
    }
    static getImageDataURL(proxy, opts) {
        return __awaiter(this, void 0, void 0, function* () {
            const maybeClone = yield AgChartInternal.prepareResizedChart(proxy, opts);
            const { chart } = maybeClone;
            const result = chart.scene.canvas.getDataURL(opts === null || opts === void 0 ? void 0 : opts.fileFormat);
            if (maybeClone !== proxy) {
                maybeClone.destroy();
            }
            return result;
        });
    }
    static prepareResizedChart(proxy, opts) {
        return __awaiter(this, void 0, void 0, function* () {
            const { chart } = proxy;
            let { width, height } = opts !== null && opts !== void 0 ? opts : {};
            const currentWidth = chart.width;
            const currentHeight = chart.height;
            const unchanged = (width === undefined && height === undefined) ||
                (chart.scene.canvas.pixelRatio === 1 && currentWidth === width && currentHeight === height);
            if (unchanged) {
                return proxy;
            }
            width = width !== null && width !== void 0 ? width : currentWidth;
            height = height !== null && height !== void 0 ? height : currentHeight;
            const options = Object.assign(Object.assign({}, chart.userOptions), { container: document.createElement('div'), width,
                height, autoSize: false, overrideDevicePixelRatio: 1 });
            const clonedChart = AgChartInternal.createOrUpdate(options);
            yield clonedChart.chart.waitForUpdate();
            return clonedChart;
        });
    }
    static createChartInstance(options, overrideDevicePixelRatio, oldChart) {
        const transferableResource = oldChart === null || oldChart === void 0 ? void 0 : oldChart.destroy({ keepTransferableResources: true });
        if (isAgCartesianChartOptions(options)) {
            return new CartesianChart(document, overrideDevicePixelRatio, transferableResource);
        }
        else if (isAgHierarchyChartOptions(options)) {
            return new HierarchyChart(document, overrideDevicePixelRatio, transferableResource);
        }
        else if (isAgPolarChartOptions(options)) {
            return new PolarChart(document, overrideDevicePixelRatio, transferableResource);
        }
        throw new Error(`AG Charts - couldn't apply configuration, check type of options: ${options['type']}`);
    }
    static updateDelta(chart, processedOptions, userOptions) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (processedOptions.type == null) {
                processedOptions = Object.assign(Object.assign({}, processedOptions), { type: (_a = chart.processedOptions.type) !== null && _a !== void 0 ? _a : optionsType(processedOptions) });
            }
            yield chart.awaitUpdateCompletion();
            if (chart.destroyed)
                return;
            debug('applying delta', processedOptions);
            applyChartOptions(chart, processedOptions, userOptions);
        });
    }
}
AgChartInternal.DEBUG = () => { var _a; return (_a = windowValue('agChartsDebug')) !== null && _a !== void 0 ? _a : false; };
AgChartInternal.initialised = false;
function debug(message, ...optionalParams) {
    if ([true, 'opts'].includes(AgChartInternal.DEBUG())) {
        Logger.debug(message, ...optionalParams);
    }
}
function applyChartOptions(chart, processedOptions, userOptions) {
    var _a, _b, _c, _d;
    const completeOptions = jsonMerge([(_a = chart.processedOptions) !== null && _a !== void 0 ? _a : {}, processedOptions], noDataCloneMergeOptions);
    const modulesChanged = applyModules(chart, completeOptions);
    const skip = ['type', 'data', 'series', 'listeners', 'theme', 'legend'];
    if (isAgCartesianChartOptions(processedOptions)) {
        // Append axes to defaults.
        skip.push('axes');
    }
    else if (isAgPolarChartOptions(processedOptions) || isAgHierarchyChartOptions(processedOptions)) {
        // Use defaults.
    }
    else {
        throw new Error(`AG Charts - couldn't apply configuration, check type of options and chart: ${processedOptions['type']}`);
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
    applyLegend(chart, processedOptions);
    const seriesOpts = processedOptions.series;
    const seriesDataUpdate = !!processedOptions.data || (seriesOpts === null || seriesOpts === void 0 ? void 0 : seriesOpts.some((s) => s.data != null));
    const otherRefreshUpdate = (_c = (_b = processedOptions.legend) !== null && _b !== void 0 ? _b : processedOptions.title) !== null && _c !== void 0 ? _c : processedOptions.subtitle;
    forceNodeDataRefresh = forceNodeDataRefresh || seriesDataUpdate || !!otherRefreshUpdate;
    if (processedOptions.data) {
        chart.data = processedOptions.data;
    }
    if (processedOptions.listeners) {
        chart.updateAllSeriesListeners();
    }
    chart.processedOptions = completeOptions;
    chart.userOptions = jsonMerge([(_d = chart.userOptions) !== null && _d !== void 0 ? _d : {}, userOptions], noDataCloneMergeOptions);
    const majorChange = forceNodeDataRefresh || modulesChanged;
    const updateType = majorChange ? ChartUpdateType.PROCESS_DATA : ChartUpdateType.PERFORM_LAYOUT;
    debug('chart update type', { updateType: ChartUpdateType[updateType] });
    chart.update(updateType, { forceNodeDataRefresh });
}
function applyModules(chart, options) {
    const matchingChartType = (module) => {
        return ((chart instanceof CartesianChart && module.chartTypes.includes('cartesian')) ||
            (chart instanceof PolarChart && module.chartTypes.includes('polar')) ||
            (chart instanceof HierarchyChart && module.chartTypes.includes('hierarchy')));
    };
    let modulesChanged = false;
    const rootModules = REGISTERED_MODULES.filter((m) => m.type === 'root');
    for (const next of rootModules) {
        const shouldBeEnabled = matchingChartType(next) && options[next.optionsKey] != null;
        const isEnabled = chart.isModuleEnabled(next);
        if (shouldBeEnabled === isEnabled)
            continue;
        modulesChanged = true;
        if (shouldBeEnabled) {
            chart.addModule(next);
        }
        else {
            chart.removeModule(next);
        }
    }
    return modulesChanged;
}
function applySeries(chart, options) {
    const optSeries = options.series;
    if (!optSeries) {
        return;
    }
    const matchingTypes = chart.series.length === optSeries.length && chart.series.every((s, i) => { var _a; return s.type === ((_a = optSeries[i]) === null || _a === void 0 ? void 0 : _a.type); });
    // Try to optimise series updates if series count and types didn't change.
    if (matchingTypes) {
        chart.series.forEach((s, i) => {
            var _a, _b, _c, _d;
            const previousOpts = (_c = (_b = (_a = chart.processedOptions) === null || _a === void 0 ? void 0 : _a.series) === null || _b === void 0 ? void 0 : _b[i]) !== null && _c !== void 0 ? _c : {};
            const seriesDiff = jsonDiff(previousOpts, (_d = optSeries[i]) !== null && _d !== void 0 ? _d : {});
            if (!seriesDiff) {
                return;
            }
            debug(`applying series diff idx ${i}`, seriesDiff);
            applySeriesValues(s, seriesDiff, { path: `series[${i}]`, index: i });
            s.markNodeDataDirty();
        });
        return;
    }
    chart.series = createSeries(chart, optSeries);
}
function applyAxes(chart, options) {
    const optAxes = options.axes;
    if (!optAxes) {
        return false;
    }
    const matchingTypes = chart.axes.length === optAxes.length && chart.axes.every((a, i) => a.type === optAxes[i].type);
    // Try to optimise series updates if series count and types didn't change.
    if (matchingTypes) {
        const oldOpts = chart.processedOptions;
        if (isAgCartesianChartOptions(oldOpts)) {
            chart.axes.forEach((a, i) => {
                var _a, _b;
                const previousOpts = (_b = (_a = oldOpts.axes) === null || _a === void 0 ? void 0 : _a[i]) !== null && _b !== void 0 ? _b : {};
                const axisDiff = jsonDiff(previousOpts, optAxes[i]);
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
function applyLegend(chart, options) {
    const skip = ['listeners'];
    chart.setLegendInit((legend) => {
        var _a, _b, _c;
        applyOptionValues(legend, (_a = options.legend) !== null && _a !== void 0 ? _a : {}, { skip });
        if ((_b = options.legend) === null || _b === void 0 ? void 0 : _b.listeners) {
            Object.assign(chart.legend.listeners, (_c = options.legend.listeners) !== null && _c !== void 0 ? _c : {});
        }
    });
}
function createSeries(chart, options) {
    const series = [];
    const moduleContext = chart.getModuleContext();
    let index = 0;
    for (const seriesOptions of options !== null && options !== void 0 ? options : []) {
        const path = `series[${index++}]`;
        const seriesInstance = getSeries(seriesOptions.type, moduleContext);
        applySeriesValues(seriesInstance, seriesOptions, { path, index });
        series.push(seriesInstance);
    }
    return series;
}
function createAxis(chart, options) {
    const axes = [];
    const skip = ['axes[].type'];
    const moduleContext = chart.getModuleContext();
    let index = 0;
    for (const axisOptions of options !== null && options !== void 0 ? options : []) {
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
function applyAxisModules(axis, options) {
    let modulesChanged = false;
    const rootModules = REGISTERED_MODULES.filter((m) => m.type === 'axis');
    for (const next of rootModules) {
        const shouldBeEnabled = options[next.optionsKey] != null;
        const isEnabled = axis.isModuleEnabled(next);
        if (shouldBeEnabled === isEnabled)
            continue;
        modulesChanged = true;
        if (shouldBeEnabled) {
            axis.addModule(next);
        }
        else {
            axis.removeModule(next);
        }
    }
    return modulesChanged;
}
function registerListeners(source, listeners) {
    source.clearEventListeners();
    for (const property in listeners) {
        const listener = listeners[property];
        if (typeof listener !== 'function')
            continue;
        source.addEventListener(property, listener);
    }
}
function applyOptionValues(target, options, { skip, path } = {}) {
    const applyOpts = Object.assign(Object.assign(Object.assign({}, getJsonApplyOptions()), { skip }), (path ? { path } : {}));
    return jsonApply(target, options, applyOpts);
}
function applySeriesValues(target, options, { path, index } = {}) {
    var _a;
    const skip = ['series[].listeners'];
    const jsonApplyOptions = getJsonApplyOptions();
    const ctrs = (_a = jsonApplyOptions.constructors) !== null && _a !== void 0 ? _a : {};
    const seriesTypeOverrides = {
        constructors: Object.assign(Object.assign({}, ctrs), { title: target.type === 'pie' ? PieTitle : ctrs['title'] }),
    };
    const applyOpts = Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, jsonApplyOptions), seriesTypeOverrides), { skip: ['series[].type', ...(skip !== null && skip !== void 0 ? skip : [])] }), (path ? { path } : {})), { idx: index !== null && index !== void 0 ? index : -1 });
    const result = jsonApply(target, options, applyOpts);
    const listeners = options === null || options === void 0 ? void 0 : options.listeners;
    if (listeners != null) {
        registerListeners(target, listeners);
    }
    return result;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWdDaGFydFYyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NoYXJ0L2FnQ2hhcnRWMi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFlQSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFDbEQsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUMxQyxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFFbEQsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBTWxELE9BQU8sRUFBYSxRQUFRLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUcvRCxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDekMsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBQy9DLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUNuRCxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUNqRSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFFM0MsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBRXBELE9BQU8sRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUM5RCxPQUFPLEVBQ0gsY0FBYyxFQUNkLHlCQUF5QixFQUN6Qix5QkFBeUIsRUFDekIscUJBQXFCLEVBQ3JCLFdBQVcsRUFDWCx1QkFBdUIsR0FDMUIsTUFBTSxtQkFBbUIsQ0FBQztBQUUzQixPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFN0MsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQ3hDLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLGdCQUFnQixDQUFD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