"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgChart = void 0;
const cartesianChart_1 = require("./cartesianChart");
const polarChart_1 = require("./polarChart");
const hierarchyChart_1 = require("./hierarchyChart");
const caption_1 = require("../caption");
const areaSeries_1 = require("./series/cartesian/areaSeries");
const barSeries_1 = require("./series/cartesian/barSeries");
const histogramSeries_1 = require("./series/cartesian/histogramSeries");
const lineSeries_1 = require("./series/cartesian/lineSeries");
const scatterSeries_1 = require("./series/cartesian/scatterSeries");
const pieSeries_1 = require("./series/polar/pieSeries");
const treemapSeries_1 = require("./series/hierarchy/treemapSeries");
const logAxis_1 = require("./axis/logAxis");
const numberAxis_1 = require("./axis/numberAxis");
const categoryAxis_1 = require("./axis/categoryAxis");
const groupedCategoryAxis_1 = require("./axis/groupedCategoryAxis");
const timeAxis_1 = require("./axis/timeAxis");
const chartUpdateType_1 = require("./chartUpdateType");
const dropShadow_1 = require("../scene/dropShadow");
const json_1 = require("../util/json");
const prepare_1 = require("./mapping/prepare");
const crossLine_1 = require("./crossline/crossLine");
const window_1 = require("../util/window");
const module_support_1 = require("../module-support");
function chartType(options) {
    if (prepare_1.isAgCartesianChartOptions(options)) {
        return 'cartesian';
    }
    else if (prepare_1.isAgPolarChartOptions(options)) {
        return 'polar';
    }
    else if (prepare_1.isAgHierarchyChartOptions(options)) {
        return 'hierarchy';
    }
    throw new Error('AG Chart - unknown type of chart for options with type: ' + options.type);
}
/**
 * Factory for creating and updating instances of AgChartInstance.
 *
 * @docsInterface
 */
class AgChart {
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
exports.AgChart = AgChart;
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
    static createOrUpdate(userOptions, proxy) {
        debug('>>> createOrUpdate() user options', userOptions);
        const mixinOpts = {};
        if (AgChartInternal.DEBUG() === true) {
            mixinOpts['debug'] = true;
        }
        const { overrideDevicePixelRatio } = userOptions;
        delete userOptions['overrideDevicePixelRatio'];
        const processedOptions = prepare_1.prepareOptions(userOptions, mixinOpts);
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
            const deltaOptions = json_1.jsonDiff(chartToUpdate.processedOptions, processedOptions);
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
        const userOptions = json_1.jsonMerge([lastUpdateOptions, deltaOptions]);
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
        asyncDownload();
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
            let { width, height } = opts || {};
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
        if (prepare_1.isAgCartesianChartOptions(options)) {
            return new cartesianChart_1.CartesianChart(document, overrideDevicePixelRatio, transferableResource);
        }
        else if (prepare_1.isAgHierarchyChartOptions(options)) {
            return new hierarchyChart_1.HierarchyChart(document, overrideDevicePixelRatio, transferableResource);
        }
        else if (prepare_1.isAgPolarChartOptions(options)) {
            return new polarChart_1.PolarChart(document, overrideDevicePixelRatio, transferableResource);
        }
        throw new Error(`AG Charts - couldn't apply configuration, check type of options: ${options['type']}`);
    }
    static updateDelta(chart, processedOptions, userOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            if (processedOptions.type == null) {
                processedOptions = Object.assign(Object.assign({}, processedOptions), { type: chart.processedOptions.type || prepare_1.optionsType(processedOptions) });
            }
            yield chart.awaitUpdateCompletion();
            if (chart.destroyed)
                return;
            debug('applying delta', processedOptions);
            applyChartOptions(chart, processedOptions, userOptions);
        });
    }
}
AgChartInternal.DEBUG = () => { var _a; return (_a = window_1.windowValue('agChartsDebug')) !== null && _a !== void 0 ? _a : false; };
function debug(message, ...optionalParams) {
    if ([true, 'opts'].includes(AgChartInternal.DEBUG())) {
        console.log(message, ...optionalParams);
    }
}
function applyChartOptions(chart, processedOptions, userOptions) {
    var _a, _b, _c, _d;
    const completeOptions = json_1.jsonMerge([(_a = chart.processedOptions) !== null && _a !== void 0 ? _a : {}, processedOptions], prepare_1.noDataCloneMergeOptions);
    const modulesChanged = applyModules(chart, completeOptions);
    const skip = ['type', 'data', 'series', 'autoSize', 'listeners', 'theme', 'legend.listeners'];
    if (prepare_1.isAgCartesianChartOptions(processedOptions)) {
        // Append axes to defaults.
        skip.push('axes');
    }
    else if (prepare_1.isAgPolarChartOptions(processedOptions) || prepare_1.isAgHierarchyChartOptions(processedOptions)) {
        // Use defaults.
    }
    else {
        throw new Error(`AG Charts - couldn\'t apply configuration, check type of options and chart: ${processedOptions['type']}`);
    }
    applyOptionValues(chart, processedOptions, { skip });
    let forceNodeDataRefresh = false;
    if (processedOptions.series && processedOptions.series.length > 0) {
        applySeries(chart, processedOptions);
        forceNodeDataRefresh = true;
    }
    if (prepare_1.isAgCartesianChartOptions(processedOptions) && processedOptions.axes) {
        const axesPresent = applyAxes(chart, processedOptions);
        if (axesPresent) {
            forceNodeDataRefresh = true;
        }
    }
    const seriesOpts = processedOptions.series;
    const seriesDataUpdate = !!processedOptions.data || (seriesOpts === null || seriesOpts === void 0 ? void 0 : seriesOpts.some((s) => s.data != null));
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
    if ((_b = processedOptions.legend) === null || _b === void 0 ? void 0 : _b.listeners) {
        Object.assign(chart.legend.listeners, (_c = processedOptions.legend.listeners) !== null && _c !== void 0 ? _c : {});
    }
    chart.processedOptions = completeOptions;
    chart.userOptions = json_1.jsonMerge([(_d = chart.userOptions) !== null && _d !== void 0 ? _d : {}, userOptions], prepare_1.noDataCloneMergeOptions);
    const majorChange = forceNodeDataRefresh || modulesChanged;
    const updateType = majorChange ? chartUpdateType_1.ChartUpdateType.PROCESS_DATA : chartUpdateType_1.ChartUpdateType.PERFORM_LAYOUT;
    debug('chart update type', { updateType: chartUpdateType_1.ChartUpdateType[updateType] });
    chart.update(updateType, { forceNodeDataRefresh });
}
function applyModules(chart, options) {
    const matchingChartType = (module) => {
        return ((chart instanceof cartesianChart_1.CartesianChart && module.chartTypes.includes('cartesian')) ||
            (chart instanceof polarChart_1.PolarChart && module.chartTypes.includes('polar')) ||
            (chart instanceof hierarchyChart_1.HierarchyChart && module.chartTypes.includes('hierarchy')));
    };
    let modulesChanged = false;
    for (const next of module_support_1.REGISTERED_MODULES) {
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
            var _a, _b;
            const previousOpts = ((_b = (_a = chart.processedOptions) === null || _a === void 0 ? void 0 : _a.series) === null || _b === void 0 ? void 0 : _b[i]) || {};
            const seriesDiff = json_1.jsonDiff(previousOpts, optSeries[i] || {});
            if (!seriesDiff) {
                return;
            }
            debug(`applying series diff idx ${i}`, seriesDiff);
            applySeriesValues(s, seriesDiff, { path: `series[${i}]` });
            s.markNodeDataDirty();
        });
        return;
    }
    chart.series = createSeries(optSeries);
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
        if (prepare_1.isAgCartesianChartOptions(oldOpts)) {
            chart.axes.forEach((a, i) => {
                var _a;
                const previousOpts = ((_a = oldOpts.axes) === null || _a === void 0 ? void 0 : _a[i]) || {};
                const axisDiff = json_1.jsonDiff(previousOpts, optAxes[i]);
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
function createSeries(options) {
    const series = [];
    let index = 0;
    for (const seriesOptions of options || []) {
        const path = `series[${index++}]`;
        switch (seriesOptions.type) {
            case 'area':
                series.push(applySeriesValues(new areaSeries_1.AreaSeries(), seriesOptions, { path }));
                break;
            case 'bar':
                series.push(applySeriesValues(new barSeries_1.BarSeries(), seriesOptions, { path }));
                break;
            case 'column':
                series.push(applySeriesValues(new barSeries_1.BarSeries(), seriesOptions, { path }));
                break;
            case 'histogram':
                series.push(applySeriesValues(new histogramSeries_1.HistogramSeries(), seriesOptions, { path }));
                break;
            case 'line':
                series.push(applySeriesValues(new lineSeries_1.LineSeries(), seriesOptions, { path }));
                break;
            case 'scatter':
                series.push(applySeriesValues(new scatterSeries_1.ScatterSeries(), seriesOptions, { path }));
                break;
            case 'pie':
                series.push(applySeriesValues(new pieSeries_1.PieSeries(), seriesOptions, { path }));
                break;
            case 'treemap':
                series.push(applySeriesValues(new treemapSeries_1.TreemapSeries(), seriesOptions, { path }));
                break;
            default:
                throw new Error('AG Charts - unknown series type: ' + seriesOptions.type);
        }
    }
    return series;
}
function createAxis(options) {
    const axes = [];
    let index = 0;
    for (const axisOptions of options || []) {
        const path = `axes[${index++}]`;
        const skip = ['axes[].type'];
        switch (axisOptions.type) {
            case 'number':
                axes.push(applyOptionValues(new numberAxis_1.NumberAxis(), axisOptions, { path, skip }));
                break;
            case logAxis_1.LogAxis.type:
                axes.push(applyOptionValues(new logAxis_1.LogAxis(), axisOptions, { path, skip }));
                break;
            case categoryAxis_1.CategoryAxis.type:
                axes.push(applyOptionValues(new categoryAxis_1.CategoryAxis(), axisOptions, { path, skip }));
                break;
            case groupedCategoryAxis_1.GroupedCategoryAxis.type:
                axes.push(applyOptionValues(new groupedCategoryAxis_1.GroupedCategoryAxis(), axisOptions, { path, skip }));
                break;
            case timeAxis_1.TimeAxis.type:
                axes.push(applyOptionValues(new timeAxis_1.TimeAxis(), axisOptions, { path, skip }));
                break;
            default:
                throw new Error('AG Charts - unknown axis type: ' + axisOptions['type']);
        }
    }
    return axes;
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
const JSON_APPLY_OPTIONS = {
    constructors: {
        title: caption_1.Caption,
        subtitle: caption_1.Caption,
        shadow: dropShadow_1.DropShadow,
        innerCircle: pieSeries_1.DoughnutInnerCircle,
        'axes[].crossLines[]': crossLine_1.CrossLine,
        'series[].innerLabels[]': pieSeries_1.DoughnutInnerLabel,
    },
    allowedTypes: {
        'legend.pagination.marker.shape': ['primitive', 'function'],
        'series[].marker.shape': ['primitive', 'function'],
        'axis[].tick.count': ['primitive', 'class-instance'],
    },
};
function applyOptionValues(target, options, { skip, path } = {}) {
    const applyOpts = Object.assign(Object.assign(Object.assign({}, JSON_APPLY_OPTIONS), { skip }), (path ? { path } : {}));
    return json_1.jsonApply(target, options, applyOpts);
}
function applySeriesValues(target, options, { path } = {}) {
    const skip = ['series[].listeners'];
    const ctrs = (JSON_APPLY_OPTIONS === null || JSON_APPLY_OPTIONS === void 0 ? void 0 : JSON_APPLY_OPTIONS.constructors) || {};
    const seriesTypeOverrides = {
        constructors: Object.assign(Object.assign({}, ctrs), { title: target.type === 'pie' ? pieSeries_1.PieTitle : ctrs['title'] }),
    };
    const applyOpts = Object.assign(Object.assign(Object.assign(Object.assign({}, JSON_APPLY_OPTIONS), seriesTypeOverrides), { skip: ['series[].type', ...(skip || [])] }), (path ? { path } : {}));
    const result = json_1.jsonApply(target, options, applyOpts);
    const listeners = options === null || options === void 0 ? void 0 : options.listeners;
    if (listeners != null) {
        registerListeners(target, listeners);
    }
    return result;
}
