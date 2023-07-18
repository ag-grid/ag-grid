var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { CartesianChart } from './cartesianChart.mjs';
import { PolarChart } from './polarChart.mjs';
import { HierarchyChart } from './hierarchyChart.mjs';
import { getAxis } from './factory/axisTypes.mjs';
import { getSeries } from './factory/seriesTypes.mjs';
import { PieTitle } from './series/polar/pieSeries.mjs';
import { ChartUpdateType } from './chartUpdateType.mjs';
import { jsonDiff, jsonMerge, jsonApply } from '../util/json.mjs';
import { prepareOptions, isAgCartesianChartOptions, isAgHierarchyChartOptions, isAgPolarChartOptions, optionsType, noDataCloneMergeOptions, } from './mapping/prepare.mjs';
import { windowValue } from '../util/window.mjs';
import { Logger } from '../util/logger.mjs';
import { getJsonApplyOptions } from './chartOptions.mjs';
// Deliberately imported via `module-support` so that internal module registration happens.
import { REGISTERED_MODULES } from '../module-support.mjs';
import { setupModules } from './factory/setupModules.mjs';
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
        debug('>>> AgChartV2.createOrUpdate() user options', userOptions);
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
        debug('>>> AgChartV2.updateUserDelta() user delta', deltaOptions);
        debug('AgChartV2.updateUserDelta() - base options', lastUpdateOptions);
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
            debug('AgChartV2.updateDelta() - applying delta', processedOptions);
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
    if (isAgCartesianChartOptions(processedOptions) || isAgPolarChartOptions(processedOptions)) {
        // Append axes to defaults.
        skip.push('axes');
    }
    else if (isAgHierarchyChartOptions(processedOptions)) {
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
    if ('axes' in processedOptions && Array.isArray(processedOptions.axes)) {
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
    debug('AgChartV2.applyChartOptions() - update type', ChartUpdateType[updateType]);
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
            debug(`AgChartV2.applySeries() - applying series diff idx ${i}`, seriesDiff);
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
                debug(`AgChartV2.applyAxes() - applying axis diff idx ${i}`, axisDiff);
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
        var _a, _b, _c, _d;
        applyOptionValues(legend, (_a = options.legend) !== null && _a !== void 0 ? _a : {}, { skip });
        if ((_b = options.legend) === null || _b === void 0 ? void 0 : _b.listeners) {
            Object.assign((_c = chart.legend) === null || _c === void 0 ? void 0 : _c.listeners, (_d = options.legend.listeners) !== null && _d !== void 0 ? _d : {});
        }
    });
}
function createSeries(chart, options) {
    var _a;
    const series = [];
    const moduleContext = chart.getModuleContext();
    let index = 0;
    for (const seriesOptions of options !== null && options !== void 0 ? options : []) {
        const path = `series[${index++}]`;
        const seriesInstance = getSeries((_a = seriesOptions.type) !== null && _a !== void 0 ? _a : 'unknown', moduleContext);
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
        const axis = getAxis(axisOptions.type, moduleContext);
        const path = `axes[${index++}]`;
        applyAxisModules(axis, axisOptions);
        applyOptionValues(axis, axisOptions, { path, skip });
        axes.push(axis);
    }
    return axes;
}
function applyAxisModules(axis, options) {
    let modulesChanged = false;
    const rootModules = REGISTERED_MODULES.filter((m) => m.type === 'axis-option');
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
    var _a, _b;
    const skip = ['series[].listeners', 'series[].seriesGrouping'];
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
    const seriesGrouping = options.seriesGrouping;
    if ('seriesGrouping' in (options !== null && options !== void 0 ? options : {})) {
        if (seriesGrouping) {
            const newSeriesGroup = Object.freeze(Object.assign(Object.assign({}, ((_b = target.seriesGrouping) !== null && _b !== void 0 ? _b : {})), seriesGrouping));
            target.seriesGrouping = newSeriesGroup;
        }
        else {
            target.seriesGrouping = seriesGrouping;
        }
    }
    return result;
}
