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
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
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
import { Caption } from '../caption';
import { AreaSeries } from './series/cartesian/areaSeries';
import { BarSeries } from './series/cartesian/barSeries';
import { HistogramSeries } from './series/cartesian/histogramSeries';
import { LineSeries } from './series/cartesian/lineSeries';
import { ScatterSeries } from './series/cartesian/scatterSeries';
import { PieSeries, PieTitle, DoughnutInnerLabel, DoughnutInnerCircle } from './series/polar/pieSeries';
import { TreemapSeries } from './series/hierarchy/treemapSeries';
import { LogAxis } from './axis/logAxis';
import { NumberAxis } from './axis/numberAxis';
import { CategoryAxis } from './axis/categoryAxis';
import { GroupedCategoryAxis } from './axis/groupedCategoryAxis';
import { TimeAxis } from './axis/timeAxis';
import { ChartUpdateType } from './chart';
import { DropShadow } from '../scene/dropShadow';
import { jsonDiff, jsonMerge, jsonApply } from '../util/json';
import { GroupedCategoryChart } from './groupedCategoryChart';
import { prepareOptions, isAgCartesianChartOptions, isAgHierarchyChartOptions, isAgPolarChartOptions, optionsType, } from './mapping/prepare';
import { CrossLine } from './crossline/crossLine';
import { windowValue } from '../util/window';
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
    throw new Error('AG Chart - unknown type of chart for options with type: ' + options.type);
}
// Backwards-compatibility layer.
var AgChart = /** @class */ (function () {
    function AgChart() {
    }
    /** @deprecated use AgChart.create() or AgChart.update() instead. */
    AgChart.createComponent = function (options, type) {
        // console.warn('AG Charts - createComponent should no longer be used, use AgChart.update() instead.')
        if (type.indexOf('.series') >= 0) {
            var optionsWithType = __assign(__assign({}, options), { type: options.type || type.split('.')[0] });
            return createSeries([optionsWithType])[0];
        }
        return null;
    };
    AgChart.create = function (options, _container, _data) {
        return AgChartV2.create(options);
    };
    AgChart.update = function (chart, options, _container, _data) {
        return AgChartV2.update(chart, options);
    };
    AgChart.download = function (chart, options) {
        return AgChartV2.download(chart, options);
    };
    return AgChart;
}());
export { AgChart };
var AgChartV2 = /** @class */ (function () {
    function AgChartV2() {
    }
    AgChartV2.create = function (userOptions) {
        var _this = this;
        debug('user options', userOptions);
        var mixinOpts = {};
        if (AgChartV2.DEBUG()) {
            mixinOpts['debug'] = true;
        }
        var overrideDevicePixelRatio = userOptions.overrideDevicePixelRatio;
        delete userOptions['overrideDevicePixelRatio'];
        var mergedOptions = prepareOptions(userOptions, mixinOpts);
        var chart = isAgCartesianChartOptions(mergedOptions)
            ? mergedOptions.type === 'groupedCategory'
                ? new GroupedCategoryChart(document, overrideDevicePixelRatio)
                : new CartesianChart(document, overrideDevicePixelRatio)
            : isAgHierarchyChartOptions(mergedOptions)
                ? new HierarchyChart(document, overrideDevicePixelRatio)
                : isAgPolarChartOptions(mergedOptions)
                    ? new PolarChart(document, overrideDevicePixelRatio)
                    : undefined;
        if (!chart) {
            throw new Error("AG Charts - couldn't apply configuration, check type of options: " + mergedOptions['type']);
        }
        chart.requestFactoryUpdate(function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (chart.destroyed) {
                            // Chart destroyed, skip processing.
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, AgChartV2.updateDelta(chart, mergedOptions, userOptions)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        return chart;
    };
    AgChartV2.update = function (chart, userOptions) {
        var _this = this;
        debug('user options', userOptions);
        var mixinOpts = {};
        if (AgChartV2.DEBUG()) {
            mixinOpts['debug'] = true;
        }
        chart.requestFactoryUpdate(function () { return __awaiter(_this, void 0, void 0, function () {
            var mergedOptions, deltaOptions;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (chart.destroyed) {
                            // Chart destroyed, skip processing.
                            return [2 /*return*/];
                        }
                        mergedOptions = prepareOptions(userOptions, chart.userOptions, mixinOpts);
                        if (chartType(mergedOptions) !== chartType(chart.options)) {
                            chart.destroy();
                            console.warn('AG Charts - options supplied require a different type of chart, please recreate the chart.');
                            return [2 /*return*/];
                        }
                        deltaOptions = jsonDiff(chart.options, mergedOptions, {
                            stringify: ['data'],
                        });
                        if (deltaOptions == null) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, AgChartV2.updateDelta(chart, deltaOptions, userOptions)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    };
    /**
     * Returns the content of the current canvas as an image.
     * @param opts The download options including `width` and `height` of the image as well as `fileName` and `fileFormat`.
     */
    AgChartV2.download = function (chart, opts) {
        var _a = opts || {}, width = _a.width, height = _a.height, fileName = _a.fileName, fileFormat = _a.fileFormat;
        var currentWidth = chart.width;
        var currentHeight = chart.height;
        var unchanged = (width === undefined && height === undefined) ||
            (chart.scene.canvas.pixelRatio === 1 && currentWidth === width && currentHeight === height);
        if (unchanged) {
            chart.scene.download(fileName, fileFormat);
            return;
        }
        width = (width !== null && width !== void 0 ? width : currentWidth);
        height = (height !== null && height !== void 0 ? height : currentHeight);
        var options = __assign(__assign({}, chart.userOptions), { container: document.createElement('div'), width: width,
            height: height, autoSize: false, overrideDevicePixelRatio: 1 });
        var clonedChart = AgChartV2.create(options);
        clonedChart.waitForUpdate().then(function () {
            clonedChart.scene.download(fileName, fileFormat);
            clonedChart.destroy();
        });
    };
    AgChartV2.updateDelta = function (chart, update, userOptions) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (update.type == null) {
                            update = __assign(__assign({}, update), { type: chart.options.type || optionsType(update) });
                        }
                        debug('delta update', update);
                        return [4 /*yield*/, chart.awaitUpdateCompletion()];
                    case 1:
                        _a.sent();
                        applyChartOptions(chart, update, userOptions);
                        return [2 /*return*/];
                }
            });
        });
    };
    AgChartV2.DEBUG = function () { var _a; return _a = windowValue('agChartsDebug'), (_a !== null && _a !== void 0 ? _a : false); };
    return AgChartV2;
}());
export { AgChartV2 };
function debug(message) {
    var optionalParams = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        optionalParams[_i - 1] = arguments[_i];
    }
    if (AgChartV2.DEBUG()) {
        console.log.apply(console, __spread([message], optionalParams));
    }
}
function applyChartOptions(chart, options, userOptions) {
    var _a, _b;
    if (isAgCartesianChartOptions(options)) {
        applyOptionValues(chart, options, {
            skip: ['type', 'data', 'series', 'axes', 'autoSize', 'listeners', 'theme'],
        });
    }
    else if (isAgPolarChartOptions(options)) {
        applyOptionValues(chart, options, { skip: ['type', 'data', 'series', 'autoSize', 'listeners', 'theme'] });
    }
    else if (isAgHierarchyChartOptions(options)) {
        applyOptionValues(chart, options, { skip: ['type', 'data', 'series', 'autoSize', 'listeners', 'theme'] });
    }
    else {
        throw new Error("AG Charts - couldn't apply configuration, check type of options and chart: " + options['type']);
    }
    var updateType = ChartUpdateType.PERFORM_LAYOUT;
    var forceNodeDataRefresh = false;
    if (options.series && options.series.length > 0) {
        applySeries(chart, options);
    }
    if (isAgCartesianChartOptions(options) && options.axes) {
        var axesPresent = applyAxes(chart, options);
        if (axesPresent) {
            updateType = ChartUpdateType.PROCESS_DATA;
            forceNodeDataRefresh = true;
        }
    }
    var seriesOpts = options.series;
    if (options.data) {
        chart.data = options.data;
        updateType = ChartUpdateType.PROCESS_DATA;
    }
    else if ((_a = seriesOpts) === null || _a === void 0 ? void 0 : _a.some(function (s) { return s.data != null; })) {
        updateType = ChartUpdateType.PROCESS_DATA;
    }
    // Needs to be done last to avoid overrides by width/height properties.
    if (options.autoSize != null) {
        chart.autoSize = options.autoSize;
    }
    if (options.listeners) {
        registerListeners(chart, options.listeners);
    }
    if ((_b = options.legend) === null || _b === void 0 ? void 0 : _b.listeners) {
        Object.assign(chart.legend.listeners, options.legend.listeners);
    }
    chart.options = jsonMerge(chart.options || {}, options);
    chart.userOptions = jsonMerge(chart.userOptions || {}, userOptions);
    chart.update(updateType, { forceNodeDataRefresh: forceNodeDataRefresh });
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
            var _a, _b;
            var previousOpts = ((_b = (_a = chart.options) === null || _a === void 0 ? void 0 : _a.series) === null || _b === void 0 ? void 0 : _b[i]) || {};
            var seriesDiff = jsonDiff(previousOpts, optSeries[i] || {});
            if (!seriesDiff) {
                return;
            }
            debug("applying series diff idx " + i, seriesDiff);
            applySeriesValues(s, seriesDiff, { path: "series[" + i + "]" });
            s.markNodeDataDirty();
        });
        return;
    }
    chart.series = createSeries(optSeries);
}
function applyAxes(chart, options) {
    var optAxes = options.axes;
    if (!optAxes) {
        return false;
    }
    var matchingTypes = chart.axes.length === optAxes.length && chart.axes.every(function (a, i) { return a.type === optAxes[i].type; });
    // Try to optimise series updates if series count and types didn't change.
    if (matchingTypes) {
        var oldOpts_1 = chart.options;
        if (isAgCartesianChartOptions(oldOpts_1)) {
            chart.axes.forEach(function (a, i) {
                var _a;
                var previousOpts = ((_a = oldOpts_1.axes) === null || _a === void 0 ? void 0 : _a[i]) || {};
                var axisDiff = jsonDiff(previousOpts, optAxes[i]);
                debug("applying axis diff idx " + i, axisDiff);
                var path = "axes[" + i + "]";
                var skip = ['axes[].type'];
                applyOptionValues(a, axisDiff, { path: path, skip: skip });
            });
            return true;
        }
    }
    chart.axes = createAxis(optAxes);
    return true;
}
function createSeries(options) {
    var e_1, _a;
    var series = [];
    var index = 0;
    try {
        for (var _b = __values(options || []), _c = _b.next(); !_c.done; _c = _b.next()) {
            var seriesOptions = _c.value;
            var path = "series[" + index++ + "]";
            switch (seriesOptions.type) {
                case 'area':
                    series.push(applySeriesValues(new AreaSeries(), seriesOptions, { path: path }));
                    break;
                case 'bar':
                // fall-through - bar and column are synonyms.
                case 'column':
                    series.push(applySeriesValues(new BarSeries(), seriesOptions, { path: path }));
                    break;
                case 'histogram':
                    series.push(applySeriesValues(new HistogramSeries(), seriesOptions, { path: path }));
                    break;
                case 'line':
                    series.push(applySeriesValues(new LineSeries(), seriesOptions, { path: path }));
                    break;
                case 'scatter':
                    series.push(applySeriesValues(new ScatterSeries(), seriesOptions, { path: path }));
                    break;
                case 'pie':
                    series.push(applySeriesValues(new PieSeries(), seriesOptions, { path: path }));
                    break;
                case 'treemap':
                    series.push(applySeriesValues(new TreemapSeries(), seriesOptions, { path: path }));
                    break;
                default:
                    throw new Error('AG Charts - unknown series type: ' + seriesOptions.type);
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return series;
}
function createAxis(options) {
    var e_2, _a;
    var axes = [];
    var index = 0;
    try {
        for (var _b = __values(options || []), _c = _b.next(); !_c.done; _c = _b.next()) {
            var axisOptions = _c.value;
            var path = "axes[" + index++ + "]";
            var skip = ['axes[].type'];
            switch (axisOptions.type) {
                case 'number':
                    axes.push(applyOptionValues(new NumberAxis(), axisOptions, { path: path, skip: skip }));
                    break;
                case LogAxis.type:
                    axes.push(applyOptionValues(new LogAxis(), axisOptions, { path: path, skip: skip }));
                    break;
                case CategoryAxis.type:
                    axes.push(applyOptionValues(new CategoryAxis(), axisOptions, { path: path, skip: skip }));
                    break;
                case GroupedCategoryAxis.type:
                    axes.push(applyOptionValues(new GroupedCategoryAxis(), axisOptions, { path: path, skip: skip }));
                    break;
                case TimeAxis.type:
                    axes.push(applyOptionValues(new TimeAxis(), axisOptions, { path: path, skip: skip }));
                    break;
                default:
                    throw new Error('AG Charts - unknown axis type: ' + axisOptions['type']);
            }
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_2) throw e_2.error; }
    }
    return axes;
}
function registerListeners(source, listeners) {
    source.clearEventListeners();
    for (var property in listeners) {
        source.addEventListener(property, listeners[property]);
    }
}
var JSON_APPLY_OPTIONS = {
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
function applyOptionValues(target, options, _a) {
    var _b = _a === void 0 ? {} : _a, skip = _b.skip, path = _b.path;
    var applyOpts = __assign(__assign(__assign({}, JSON_APPLY_OPTIONS), { skip: skip }), (path ? { path: path } : {}));
    return jsonApply(target, options, applyOpts);
}
function applySeriesValues(target, options, _a) {
    var path = (_a === void 0 ? {} : _a).path;
    var _b, _c;
    var skip = ['series[].listeners'];
    var ctrs = ((_b = JSON_APPLY_OPTIONS) === null || _b === void 0 ? void 0 : _b.constructors) || {};
    var seriesTypeOverrides = {
        constructors: __assign(__assign({}, ctrs), { title: target.type === 'pie' ? PieTitle : ctrs['title'] }),
    };
    var applyOpts = __assign(__assign(__assign(__assign({}, JSON_APPLY_OPTIONS), seriesTypeOverrides), { skip: __spread(['series[].type'], (skip || [])) }), (path ? { path: path } : {}));
    var result = jsonApply(target, options, applyOpts);
    var listeners = (_c = options) === null || _c === void 0 ? void 0 : _c.listeners;
    if (listeners != null) {
        registerListeners(target, listeners);
    }
    return result;
}
