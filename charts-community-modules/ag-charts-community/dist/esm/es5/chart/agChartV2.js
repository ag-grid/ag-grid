var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
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
    throw new Error("AG Chart - unknown type of chart for options with type: " + options.type);
}
/**
 * Factory for creating and updating instances of AgChartInstance.
 *
 * @docsInterface
 */
var AgChart = /** @class */ (function () {
    function AgChart() {
    }
    /**
     * Create a new `AgChartInstance` based upon the given configuration options.
     */
    AgChart.create = function (options) {
        return AgChartInternal.createOrUpdate(options);
    };
    /**
     * Update an existing `AgChartInstance`. Options provided should be complete and not
     * partial.
     * <br/>
     * <br/>
     * **NOTE**: As each call could trigger a chart redraw, multiple calls to update options in
     * quick succession could result in undesirable flickering, so callers should batch up and/or
     * debounce changes to avoid unintended partial update renderings.
     */
    AgChart.update = function (chart, options) {
        if (!AgChartInstanceProxy.isInstance(chart)) {
            throw new Error('AG Charts - invalid chart reference passed');
        }
        AgChartInternal.createOrUpdate(options, chart);
    };
    /**
     * Update an existing `AgChartInstance` by applying a partial set of option changes.
     * <br/>
     * <br/>
     * **NOTE**: As each call could trigger a chart redraw, each individual delta options update
     * should leave the chart in a valid options state. Also, multiple calls to update options in
     * quick succession could result in undesirable flickering, so callers should batch up and/or
     * debounce changes to avoid unintended partial update renderings.
     */
    AgChart.updateDelta = function (chart, deltaOptions) {
        if (!AgChartInstanceProxy.isInstance(chart)) {
            throw new Error('AG Charts - invalid chart reference passed');
        }
        return AgChartInternal.updateUserDelta(chart, deltaOptions);
    };
    /**
     * Starts a browser-based image download for the given `AgChartInstance`.
     */
    AgChart.download = function (chart, options) {
        if (!(chart instanceof AgChartInstanceProxy)) {
            throw new Error('AG Charts - invalid chart reference passed');
        }
        return AgChartInternal.download(chart, options);
    };
    /**
     * Returns a base64-encoded image data URL for the given `AgChartInstance`.
     */
    AgChart.getImageDataURL = function (chart, options) {
        if (!(chart instanceof AgChartInstanceProxy)) {
            throw new Error('AG Charts - invalid chart reference passed');
        }
        return AgChartInternal.getImageDataURL(chart, options);
    };
    return AgChart;
}());
export { AgChart };
/**
 * Proxy class, to allow library users to keep a stable reference to their chart, even if we need
 * to switch concrete class (e.g. when switching between CartesianChart vs. PolarChart).
 */
var AgChartInstanceProxy = /** @class */ (function () {
    function AgChartInstanceProxy(chart) {
        this.chart = chart;
    }
    AgChartInstanceProxy.isInstance = function (x) {
        var _a, _b;
        if (x instanceof AgChartInstanceProxy) {
            // Simple case.
            return true;
        }
        if (((_a = x.constructor) === null || _a === void 0 ? void 0 : _a.name) === 'AgChartInstanceProxy' && x.chart != null) {
            // instanceof can fail if mixing bundles (e.g. grid all-modules vs. standalone).
            return true;
        }
        var signatureProps = Object.keys((_b = x.constructor) === null || _b === void 0 ? void 0 : _b.prototype);
        var heuristicTypeCheck = Object.keys(AgChartInstanceProxy.prototype).every(function (prop) {
            return signatureProps.includes(prop);
        });
        if (heuristicTypeCheck && x.chart != null) {
            // minimised code case - the constructor name is mangled but prototype names are not :P
            return true;
        }
        return false;
    };
    AgChartInstanceProxy.prototype.getOptions = function () {
        return this.chart.getOptions();
    };
    AgChartInstanceProxy.prototype.destroy = function () {
        this.chart.destroy();
    };
    return AgChartInstanceProxy;
}());
var AgChartInternal = /** @class */ (function () {
    function AgChartInternal() {
    }
    AgChartInternal.initialiseModules = function () {
        if (AgChartInternal.initialised)
            return;
        setupModules();
        AgChartInternal.initialised = true;
    };
    AgChartInternal.createOrUpdate = function (userOptions, proxy) {
        var _this = this;
        AgChartInternal.initialiseModules();
        debug('>>> createOrUpdate() user options', userOptions);
        var mixinOpts = {};
        if (AgChartInternal.DEBUG() === true) {
            mixinOpts['debug'] = true;
        }
        var overrideDevicePixelRatio = userOptions.overrideDevicePixelRatio;
        delete userOptions['overrideDevicePixelRatio'];
        var processedOptions = prepareOptions(userOptions, mixinOpts);
        var chart = proxy === null || proxy === void 0 ? void 0 : proxy.chart;
        if (chart == null || chartType(userOptions) !== chartType(chart.processedOptions)) {
            chart = AgChartInternal.createChartInstance(processedOptions, overrideDevicePixelRatio, chart);
        }
        if (proxy == null) {
            proxy = new AgChartInstanceProxy(chart);
        }
        else {
            proxy.chart = chart;
        }
        var chartToUpdate = chart;
        chartToUpdate.queuedUserOptions.push(userOptions);
        var dequeue = function () {
            // If there are a lot of update calls, `requestFactoryUpdate()` may skip callbacks,
            // so we need to remove all queue items up to the last successfully applied item.
            var queuedOptionsIdx = chartToUpdate.queuedUserOptions.indexOf(userOptions);
            chartToUpdate.queuedUserOptions.splice(0, queuedOptionsIdx);
        };
        chartToUpdate.requestFactoryUpdate(function () { return __awaiter(_this, void 0, void 0, function () {
            var deltaOptions;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Chart destroyed, skip processing.
                        if (chartToUpdate.destroyed)
                            return [2 /*return*/];
                        deltaOptions = jsonDiff(chartToUpdate.processedOptions, processedOptions);
                        if (deltaOptions == null) {
                            dequeue();
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, AgChartInternal.updateDelta(chartToUpdate, deltaOptions, userOptions)];
                    case 1:
                        _a.sent();
                        dequeue();
                        return [2 /*return*/];
                }
            });
        }); });
        return proxy;
    };
    AgChartInternal.updateUserDelta = function (proxy, deltaOptions) {
        var _a;
        var chart = proxy.chart, queuedUserOptions = proxy.chart.queuedUserOptions;
        var lastUpdateOptions = (_a = queuedUserOptions[queuedUserOptions.length - 1]) !== null && _a !== void 0 ? _a : chart.userOptions;
        var userOptions = jsonMerge([lastUpdateOptions, deltaOptions]);
        debug('>>> updateUserDelta() user delta', deltaOptions);
        debug('base options', lastUpdateOptions);
        AgChartInternal.createOrUpdate(userOptions, proxy);
    };
    /**
     * Returns the content of the current canvas as an image.
     * @param opts The download options including `width` and `height` of the image as well as `fileName` and `fileFormat`.
     */
    AgChartInternal.download = function (proxy, opts) {
        var _this = this;
        var asyncDownload = function () { return __awaiter(_this, void 0, void 0, function () {
            var maybeClone, chart;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, AgChartInternal.prepareResizedChart(proxy, opts)];
                    case 1:
                        maybeClone = _a.sent();
                        chart = maybeClone.chart;
                        chart.scene.download(opts === null || opts === void 0 ? void 0 : opts.fileName, opts === null || opts === void 0 ? void 0 : opts.fileFormat);
                        if (maybeClone !== proxy) {
                            maybeClone.destroy();
                        }
                        return [2 /*return*/];
                }
            });
        }); };
        asyncDownload().catch(function (e) { return Logger.errorOnce(e); });
    };
    AgChartInternal.getImageDataURL = function (proxy, opts) {
        return __awaiter(this, void 0, void 0, function () {
            var maybeClone, chart, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, AgChartInternal.prepareResizedChart(proxy, opts)];
                    case 1:
                        maybeClone = _a.sent();
                        chart = maybeClone.chart;
                        result = chart.scene.canvas.getDataURL(opts === null || opts === void 0 ? void 0 : opts.fileFormat);
                        if (maybeClone !== proxy) {
                            maybeClone.destroy();
                        }
                        return [2 /*return*/, result];
                }
            });
        });
    };
    AgChartInternal.prepareResizedChart = function (proxy, opts) {
        return __awaiter(this, void 0, void 0, function () {
            var chart, _a, width, height, currentWidth, currentHeight, unchanged, options, clonedChart;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        chart = proxy.chart;
                        _a = opts !== null && opts !== void 0 ? opts : {}, width = _a.width, height = _a.height;
                        currentWidth = chart.width;
                        currentHeight = chart.height;
                        unchanged = (width === undefined && height === undefined) ||
                            (chart.scene.canvas.pixelRatio === 1 && currentWidth === width && currentHeight === height);
                        if (unchanged) {
                            return [2 /*return*/, proxy];
                        }
                        width = width !== null && width !== void 0 ? width : currentWidth;
                        height = height !== null && height !== void 0 ? height : currentHeight;
                        options = __assign(__assign({}, chart.userOptions), { container: document.createElement('div'), width: width, height: height, autoSize: false, overrideDevicePixelRatio: 1 });
                        clonedChart = AgChartInternal.createOrUpdate(options);
                        return [4 /*yield*/, clonedChart.chart.waitForUpdate()];
                    case 1:
                        _b.sent();
                        return [2 /*return*/, clonedChart];
                }
            });
        });
    };
    AgChartInternal.createChartInstance = function (options, overrideDevicePixelRatio, oldChart) {
        var transferableResource = oldChart === null || oldChart === void 0 ? void 0 : oldChart.destroy({ keepTransferableResources: true });
        if (isAgCartesianChartOptions(options)) {
            return new CartesianChart(document, overrideDevicePixelRatio, transferableResource);
        }
        else if (isAgHierarchyChartOptions(options)) {
            return new HierarchyChart(document, overrideDevicePixelRatio, transferableResource);
        }
        else if (isAgPolarChartOptions(options)) {
            return new PolarChart(document, overrideDevicePixelRatio, transferableResource);
        }
        throw new Error("AG Charts - couldn't apply configuration, check type of options: " + options['type']);
    };
    AgChartInternal.updateDelta = function (chart, processedOptions, userOptions) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (processedOptions.type == null) {
                            processedOptions = __assign(__assign({}, processedOptions), { type: (_a = chart.processedOptions.type) !== null && _a !== void 0 ? _a : optionsType(processedOptions) });
                        }
                        return [4 /*yield*/, chart.awaitUpdateCompletion()];
                    case 1:
                        _b.sent();
                        if (chart.destroyed)
                            return [2 /*return*/];
                        debug('applying delta', processedOptions);
                        applyChartOptions(chart, processedOptions, userOptions);
                        return [2 /*return*/];
                }
            });
        });
    };
    AgChartInternal.DEBUG = function () { var _a; return (_a = windowValue('agChartsDebug')) !== null && _a !== void 0 ? _a : false; };
    AgChartInternal.initialised = false;
    return AgChartInternal;
}());
function debug(message) {
    var optionalParams = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        optionalParams[_i - 1] = arguments[_i];
    }
    if ([true, 'opts'].includes(AgChartInternal.DEBUG())) {
        Logger.debug.apply(Logger, __spreadArray([message], __read(optionalParams)));
    }
}
function applyChartOptions(chart, processedOptions, userOptions) {
    var _a, _b, _c, _d;
    var completeOptions = jsonMerge([(_a = chart.processedOptions) !== null && _a !== void 0 ? _a : {}, processedOptions], noDataCloneMergeOptions);
    var modulesChanged = applyModules(chart, completeOptions);
    var skip = ['type', 'data', 'series', 'listeners', 'theme', 'legend'];
    if (isAgCartesianChartOptions(processedOptions)) {
        // Append axes to defaults.
        skip.push('axes');
    }
    else if (isAgPolarChartOptions(processedOptions) || isAgHierarchyChartOptions(processedOptions)) {
        // Use defaults.
    }
    else {
        throw new Error("AG Charts - couldn't apply configuration, check type of options and chart: " + processedOptions['type']);
    }
    // Needs to be done before applying the series to detect if a seriesNode[Double]Click listener has been added
    if (processedOptions.listeners) {
        registerListeners(chart, processedOptions.listeners);
    }
    applyOptionValues(chart, processedOptions, { skip: skip });
    var forceNodeDataRefresh = false;
    if (processedOptions.series && processedOptions.series.length > 0) {
        applySeries(chart, processedOptions);
        forceNodeDataRefresh = true;
    }
    if (isAgCartesianChartOptions(processedOptions) && processedOptions.axes) {
        var axesPresent = applyAxes(chart, processedOptions);
        if (axesPresent) {
            forceNodeDataRefresh = true;
        }
    }
    applyLegend(chart, processedOptions);
    var seriesOpts = processedOptions.series;
    var seriesDataUpdate = !!processedOptions.data || (seriesOpts === null || seriesOpts === void 0 ? void 0 : seriesOpts.some(function (s) { return s.data != null; }));
    var otherRefreshUpdate = (_c = (_b = processedOptions.legend) !== null && _b !== void 0 ? _b : processedOptions.title) !== null && _c !== void 0 ? _c : processedOptions.subtitle;
    forceNodeDataRefresh = forceNodeDataRefresh || seriesDataUpdate || !!otherRefreshUpdate;
    if (processedOptions.data) {
        chart.data = processedOptions.data;
    }
    if (processedOptions.listeners) {
        chart.updateAllSeriesListeners();
    }
    chart.processedOptions = completeOptions;
    chart.userOptions = jsonMerge([(_d = chart.userOptions) !== null && _d !== void 0 ? _d : {}, userOptions], noDataCloneMergeOptions);
    var majorChange = forceNodeDataRefresh || modulesChanged;
    var updateType = majorChange ? ChartUpdateType.PROCESS_DATA : ChartUpdateType.PERFORM_LAYOUT;
    debug('chart update type', { updateType: ChartUpdateType[updateType] });
    chart.update(updateType, { forceNodeDataRefresh: forceNodeDataRefresh });
}
function applyModules(chart, options) {
    var e_1, _a;
    var matchingChartType = function (module) {
        return ((chart instanceof CartesianChart && module.chartTypes.includes('cartesian')) ||
            (chart instanceof PolarChart && module.chartTypes.includes('polar')) ||
            (chart instanceof HierarchyChart && module.chartTypes.includes('hierarchy')));
    };
    var modulesChanged = false;
    var rootModules = REGISTERED_MODULES.filter(function (m) { return m.type === 'root'; });
    try {
        for (var rootModules_1 = __values(rootModules), rootModules_1_1 = rootModules_1.next(); !rootModules_1_1.done; rootModules_1_1 = rootModules_1.next()) {
            var next = rootModules_1_1.value;
            var shouldBeEnabled = matchingChartType(next) && options[next.optionsKey] != null;
            var isEnabled = chart.isModuleEnabled(next);
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
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (rootModules_1_1 && !rootModules_1_1.done && (_a = rootModules_1.return)) _a.call(rootModules_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return modulesChanged;
}
function applySeries(chart, options) {
    var optSeries = options.series;
    if (!optSeries) {
        return;
    }
    var matchingTypes = chart.series.length === optSeries.length && chart.series.every(function (s, i) { var _a; return s.type === ((_a = optSeries[i]) === null || _a === void 0 ? void 0 : _a.type); });
    // Try to optimise series updates if series count and types didn't change.
    if (matchingTypes) {
        chart.series.forEach(function (s, i) {
            var _a, _b, _c, _d;
            var previousOpts = (_c = (_b = (_a = chart.processedOptions) === null || _a === void 0 ? void 0 : _a.series) === null || _b === void 0 ? void 0 : _b[i]) !== null && _c !== void 0 ? _c : {};
            var seriesDiff = jsonDiff(previousOpts, (_d = optSeries[i]) !== null && _d !== void 0 ? _d : {});
            if (!seriesDiff) {
                return;
            }
            debug("applying series diff idx " + i, seriesDiff);
            applySeriesValues(s, seriesDiff, { path: "series[" + i + "]", index: i });
            s.markNodeDataDirty();
        });
        return;
    }
    chart.series = createSeries(chart, optSeries);
}
function applyAxes(chart, options) {
    var optAxes = options.axes;
    if (!optAxes) {
        return false;
    }
    var matchingTypes = chart.axes.length === optAxes.length && chart.axes.every(function (a, i) { return a.type === optAxes[i].type; });
    // Try to optimise series updates if series count and types didn't change.
    if (matchingTypes) {
        var oldOpts_1 = chart.processedOptions;
        if (isAgCartesianChartOptions(oldOpts_1)) {
            chart.axes.forEach(function (a, i) {
                var _a, _b;
                var previousOpts = (_b = (_a = oldOpts_1.axes) === null || _a === void 0 ? void 0 : _a[i]) !== null && _b !== void 0 ? _b : {};
                var axisDiff = jsonDiff(previousOpts, optAxes[i]);
                debug("applying axis diff idx " + i, axisDiff);
                var path = "axes[" + i + "]";
                var skip = ['axes[].type'];
                applyOptionValues(a, axisDiff, { path: path, skip: skip });
            });
            return true;
        }
    }
    chart.axes = createAxis(chart, optAxes);
    return true;
}
function applyLegend(chart, options) {
    var skip = ['listeners'];
    chart.setLegendInit(function (legend) {
        var _a, _b, _c;
        applyOptionValues(legend, (_a = options.legend) !== null && _a !== void 0 ? _a : {}, { skip: skip });
        if ((_b = options.legend) === null || _b === void 0 ? void 0 : _b.listeners) {
            Object.assign(chart.legend.listeners, (_c = options.legend.listeners) !== null && _c !== void 0 ? _c : {});
        }
    });
}
function createSeries(chart, options) {
    var e_2, _a;
    var series = [];
    var moduleContext = chart.getModuleContext();
    var index = 0;
    try {
        for (var _b = __values(options !== null && options !== void 0 ? options : []), _c = _b.next(); !_c.done; _c = _b.next()) {
            var seriesOptions = _c.value;
            var path = "series[" + index++ + "]";
            var seriesInstance = getSeries(seriesOptions.type, moduleContext);
            applySeriesValues(seriesInstance, seriesOptions, { path: path, index: index });
            series.push(seriesInstance);
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_2) throw e_2.error; }
    }
    return series;
}
function createAxis(chart, options) {
    var e_3, _a;
    var axes = [];
    var skip = ['axes[].type'];
    var moduleContext = chart.getModuleContext();
    var index = 0;
    try {
        for (var _b = __values(options !== null && options !== void 0 ? options : []), _c = _b.next(); !_c.done; _c = _b.next()) {
            var axisOptions = _c.value;
            var axis = void 0;
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
            var path = "axes[" + index++ + "]";
            applyAxisModules(axis, axisOptions);
            applyOptionValues(axis, axisOptions, { path: path, skip: skip });
            axes.push(axis);
        }
    }
    catch (e_3_1) { e_3 = { error: e_3_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_3) throw e_3.error; }
    }
    return axes;
}
function applyAxisModules(axis, options) {
    var e_4, _a;
    var modulesChanged = false;
    var rootModules = REGISTERED_MODULES.filter(function (m) { return m.type === 'axis'; });
    try {
        for (var rootModules_2 = __values(rootModules), rootModules_2_1 = rootModules_2.next(); !rootModules_2_1.done; rootModules_2_1 = rootModules_2.next()) {
            var next = rootModules_2_1.value;
            var shouldBeEnabled = options[next.optionsKey] != null;
            var isEnabled = axis.isModuleEnabled(next);
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
    }
    catch (e_4_1) { e_4 = { error: e_4_1 }; }
    finally {
        try {
            if (rootModules_2_1 && !rootModules_2_1.done && (_a = rootModules_2.return)) _a.call(rootModules_2);
        }
        finally { if (e_4) throw e_4.error; }
    }
    return modulesChanged;
}
function registerListeners(source, listeners) {
    source.clearEventListeners();
    for (var property in listeners) {
        var listener = listeners[property];
        if (typeof listener !== 'function')
            continue;
        source.addEventListener(property, listener);
    }
}
function applyOptionValues(target, options, _a) {
    var _b = _a === void 0 ? {} : _a, skip = _b.skip, path = _b.path;
    var applyOpts = __assign(__assign(__assign({}, getJsonApplyOptions()), { skip: skip }), (path ? { path: path } : {}));
    return jsonApply(target, options, applyOpts);
}
function applySeriesValues(target, options, _a) {
    var _b;
    var _c = _a === void 0 ? {} : _a, path = _c.path, index = _c.index;
    var skip = ['series[].listeners'];
    var jsonApplyOptions = getJsonApplyOptions();
    var ctrs = (_b = jsonApplyOptions.constructors) !== null && _b !== void 0 ? _b : {};
    var seriesTypeOverrides = {
        constructors: __assign(__assign({}, ctrs), { title: target.type === 'pie' ? PieTitle : ctrs['title'] }),
    };
    var applyOpts = __assign(__assign(__assign(__assign(__assign({}, jsonApplyOptions), seriesTypeOverrides), { skip: __spreadArray(['series[].type'], __read((skip !== null && skip !== void 0 ? skip : []))) }), (path ? { path: path } : {})), { idx: index !== null && index !== void 0 ? index : -1 });
    var result = jsonApply(target, options, applyOpts);
    var listeners = options === null || options === void 0 ? void 0 : options.listeners;
    if (listeners != null) {
        registerListeners(target, listeners);
    }
    return result;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWdDaGFydFYyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NoYXJ0L2FnQ2hhcnRWMi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBZUEsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQ2xELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFDMUMsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBRWxELE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQU1sRCxPQUFPLEVBQWEsUUFBUSxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFHL0QsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQ3pDLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUMvQyxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDbkQsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDakUsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBRTNDLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUVwRCxPQUFPLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFDOUQsT0FBTyxFQUNILGNBQWMsRUFDZCx5QkFBeUIsRUFDekIseUJBQXlCLEVBQ3pCLHFCQUFxQixFQUNyQixXQUFXLEVBQ1gsdUJBQXVCLEdBQzFCLE1BQU0sbUJBQW1CLENBQUM7QUFFM0IsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRTdDLE9BQU8sRUFBRSxN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