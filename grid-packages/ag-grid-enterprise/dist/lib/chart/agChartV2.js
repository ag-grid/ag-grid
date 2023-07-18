"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgChart = void 0;
var cartesianChart_1 = require("./cartesianChart");
var polarChart_1 = require("./polarChart");
var hierarchyChart_1 = require("./hierarchyChart");
var axisTypes_1 = require("./factory/axisTypes");
var seriesTypes_1 = require("./factory/seriesTypes");
var pieSeries_1 = require("./series/polar/pieSeries");
var chartUpdateType_1 = require("./chartUpdateType");
var json_1 = require("../util/json");
var prepare_1 = require("./mapping/prepare");
var window_1 = require("../util/window");
var logger_1 = require("../util/logger");
var chartOptions_1 = require("./chartOptions");
// Deliberately imported via `module-support` so that internal module registration happens.
var module_support_1 = require("../module-support");
var setupModules_1 = require("./factory/setupModules");
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
exports.AgChart = AgChart;
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
        setupModules_1.setupModules();
        AgChartInternal.initialised = true;
    };
    AgChartInternal.createOrUpdate = function (userOptions, proxy) {
        var _this = this;
        AgChartInternal.initialiseModules();
        debug('>>> AgChartV2.createOrUpdate() user options', userOptions);
        var mixinOpts = {};
        if (AgChartInternal.DEBUG() === true) {
            mixinOpts['debug'] = true;
        }
        var overrideDevicePixelRatio = userOptions.overrideDevicePixelRatio;
        delete userOptions['overrideDevicePixelRatio'];
        var processedOptions = prepare_1.prepareOptions(userOptions, mixinOpts);
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
                        deltaOptions = json_1.jsonDiff(chartToUpdate.processedOptions, processedOptions);
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
        var userOptions = json_1.jsonMerge([lastUpdateOptions, deltaOptions]);
        debug('>>> AgChartV2.updateUserDelta() user delta', deltaOptions);
        debug('AgChartV2.updateUserDelta() - base options', lastUpdateOptions);
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
        asyncDownload().catch(function (e) { return logger_1.Logger.errorOnce(e); });
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
        if (prepare_1.isAgCartesianChartOptions(options)) {
            return new cartesianChart_1.CartesianChart(document, overrideDevicePixelRatio, transferableResource);
        }
        else if (prepare_1.isAgHierarchyChartOptions(options)) {
            return new hierarchyChart_1.HierarchyChart(document, overrideDevicePixelRatio, transferableResource);
        }
        else if (prepare_1.isAgPolarChartOptions(options)) {
            return new polarChart_1.PolarChart(document, overrideDevicePixelRatio, transferableResource);
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
                            processedOptions = __assign(__assign({}, processedOptions), { type: (_a = chart.processedOptions.type) !== null && _a !== void 0 ? _a : prepare_1.optionsType(processedOptions) });
                        }
                        return [4 /*yield*/, chart.awaitUpdateCompletion()];
                    case 1:
                        _b.sent();
                        if (chart.destroyed)
                            return [2 /*return*/];
                        debug('AgChartV2.updateDelta() - applying delta', processedOptions);
                        applyChartOptions(chart, processedOptions, userOptions);
                        return [2 /*return*/];
                }
            });
        });
    };
    AgChartInternal.DEBUG = function () { var _a; return (_a = window_1.windowValue('agChartsDebug')) !== null && _a !== void 0 ? _a : false; };
    AgChartInternal.initialised = false;
    return AgChartInternal;
}());
function debug(message) {
    var optionalParams = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        optionalParams[_i - 1] = arguments[_i];
    }
    if ([true, 'opts'].includes(AgChartInternal.DEBUG())) {
        logger_1.Logger.debug.apply(logger_1.Logger, __spreadArray([message], __read(optionalParams)));
    }
}
function applyChartOptions(chart, processedOptions, userOptions) {
    var _a, _b, _c, _d;
    var completeOptions = json_1.jsonMerge([(_a = chart.processedOptions) !== null && _a !== void 0 ? _a : {}, processedOptions], prepare_1.noDataCloneMergeOptions);
    var modulesChanged = applyModules(chart, completeOptions);
    var skip = ['type', 'data', 'series', 'listeners', 'theme', 'legend'];
    if (prepare_1.isAgCartesianChartOptions(processedOptions) || prepare_1.isAgPolarChartOptions(processedOptions)) {
        // Append axes to defaults.
        skip.push('axes');
    }
    else if (prepare_1.isAgHierarchyChartOptions(processedOptions)) {
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
    if ('axes' in processedOptions && Array.isArray(processedOptions.axes)) {
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
    chart.userOptions = json_1.jsonMerge([(_d = chart.userOptions) !== null && _d !== void 0 ? _d : {}, userOptions], prepare_1.noDataCloneMergeOptions);
    var majorChange = forceNodeDataRefresh || modulesChanged;
    var updateType = majorChange ? chartUpdateType_1.ChartUpdateType.PROCESS_DATA : chartUpdateType_1.ChartUpdateType.PERFORM_LAYOUT;
    debug('AgChartV2.applyChartOptions() - update type', chartUpdateType_1.ChartUpdateType[updateType]);
    chart.update(updateType, { forceNodeDataRefresh: forceNodeDataRefresh });
}
function applyModules(chart, options) {
    var e_1, _a;
    var matchingChartType = function (module) {
        return ((chart instanceof cartesianChart_1.CartesianChart && module.chartTypes.includes('cartesian')) ||
            (chart instanceof polarChart_1.PolarChart && module.chartTypes.includes('polar')) ||
            (chart instanceof hierarchyChart_1.HierarchyChart && module.chartTypes.includes('hierarchy')));
    };
    var modulesChanged = false;
    var rootModules = module_support_1.REGISTERED_MODULES.filter(function (m) { return m.type === 'root'; });
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
            var seriesDiff = json_1.jsonDiff(previousOpts, (_d = optSeries[i]) !== null && _d !== void 0 ? _d : {});
            if (!seriesDiff) {
                return;
            }
            debug("AgChartV2.applySeries() - applying series diff idx " + i, seriesDiff);
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
        if (prepare_1.isAgCartesianChartOptions(oldOpts_1)) {
            chart.axes.forEach(function (a, i) {
                var _a, _b;
                var previousOpts = (_b = (_a = oldOpts_1.axes) === null || _a === void 0 ? void 0 : _a[i]) !== null && _b !== void 0 ? _b : {};
                var axisDiff = json_1.jsonDiff(previousOpts, optAxes[i]);
                debug("AgChartV2.applyAxes() - applying axis diff idx " + i, axisDiff);
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
        var _a, _b, _c, _d;
        applyOptionValues(legend, (_a = options.legend) !== null && _a !== void 0 ? _a : {}, { skip: skip });
        if ((_b = options.legend) === null || _b === void 0 ? void 0 : _b.listeners) {
            Object.assign((_c = chart.legend) === null || _c === void 0 ? void 0 : _c.listeners, (_d = options.legend.listeners) !== null && _d !== void 0 ? _d : {});
        }
    });
}
function createSeries(chart, options) {
    var e_2, _a;
    var _b;
    var series = [];
    var moduleContext = chart.getModuleContext();
    var index = 0;
    try {
        for (var _c = __values(options !== null && options !== void 0 ? options : []), _d = _c.next(); !_d.done; _d = _c.next()) {
            var seriesOptions = _d.value;
            var path = "series[" + index++ + "]";
            var seriesInstance = seriesTypes_1.getSeries((_b = seriesOptions.type) !== null && _b !== void 0 ? _b : 'unknown', moduleContext);
            applySeriesValues(seriesInstance, seriesOptions, { path: path, index: index });
            series.push(seriesInstance);
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
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
            var axis = axisTypes_1.getAxis(axisOptions.type, moduleContext);
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
    var rootModules = module_support_1.REGISTERED_MODULES.filter(function (m) { return m.type === 'axis-option'; });
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
    var applyOpts = __assign(__assign(__assign({}, chartOptions_1.getJsonApplyOptions()), { skip: skip }), (path ? { path: path } : {}));
    return json_1.jsonApply(target, options, applyOpts);
}
function applySeriesValues(target, options, _a) {
    var _b, _c;
    var _d = _a === void 0 ? {} : _a, path = _d.path, index = _d.index;
    var skip = ['series[].listeners', 'series[].seriesGrouping'];
    var jsonApplyOptions = chartOptions_1.getJsonApplyOptions();
    var ctrs = (_b = jsonApplyOptions.constructors) !== null && _b !== void 0 ? _b : {};
    var seriesTypeOverrides = {
        constructors: __assign(__assign({}, ctrs), { title: target.type === 'pie' ? pieSeries_1.PieTitle : ctrs['title'] }),
    };
    var applyOpts = __assign(__assign(__assign(__assign(__assign({}, jsonApplyOptions), seriesTypeOverrides), { skip: __spreadArray(['series[].type'], __read((skip !== null && skip !== void 0 ? skip : []))) }), (path ? { path: path } : {})), { idx: index !== null && index !== void 0 ? index : -1 });
    var result = json_1.jsonApply(target, options, applyOpts);
    var listeners = options === null || options === void 0 ? void 0 : options.listeners;
    if (listeners != null) {
        registerListeners(target, listeners);
    }
    var seriesGrouping = options.seriesGrouping;
    if ('seriesGrouping' in (options !== null && options !== void 0 ? options : {})) {
        if (seriesGrouping) {
            var newSeriesGroup = Object.freeze(__assign(__assign({}, ((_c = target.seriesGrouping) !== null && _c !== void 0 ? _c : {})), seriesGrouping));
            target.seriesGrouping = newSeriesGroup;
        }
        else {
            target.seriesGrouping = seriesGrouping;
        }
    }
    return result;
}
//# sourceMappingURL=agChartV2.js.map