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
Object.defineProperty(exports, "__esModule", { value: true });
var cartesianChart_1 = require("./cartesianChart");
var polarChart_1 = require("./polarChart");
var hierarchyChart_1 = require("./hierarchyChart");
var caption_1 = require("../caption");
var areaSeries_1 = require("./series/cartesian/areaSeries");
var barSeries_1 = require("./series/cartesian/barSeries");
var histogramSeries_1 = require("./series/cartesian/histogramSeries");
var lineSeries_1 = require("./series/cartesian/lineSeries");
var scatterSeries_1 = require("./series/cartesian/scatterSeries");
var pieSeries_1 = require("./series/polar/pieSeries");
var treemapSeries_1 = require("./series/hierarchy/treemapSeries");
var logAxis_1 = require("./axis/logAxis");
var numberAxis_1 = require("./axis/numberAxis");
var categoryAxis_1 = require("./axis/categoryAxis");
var groupedCategoryAxis_1 = require("./axis/groupedCategoryAxis");
var timeAxis_1 = require("./axis/timeAxis");
var chart_1 = require("./chart");
var dropShadow_1 = require("../scene/dropShadow");
var json_1 = require("../util/json");
var groupedCategoryChart_1 = require("./groupedCategoryChart");
var prepare_1 = require("./mapping/prepare");
var crossLine_1 = require("./crossline/crossLine");
var window_1 = require("../util/window");
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
    return AgChart;
}());
exports.AgChart = AgChart;
var AgChartV2 = /** @class */ (function () {
    function AgChartV2() {
    }
    AgChartV2.create = function (userOptions) {
        debug('user options', userOptions);
        var mixinOpts = {};
        if (AgChartV2.DEBUG()) {
            mixinOpts['debug'] = true;
        }
        var mergedOptions = prepare_1.prepareOptions(userOptions, mixinOpts);
        var chart = prepare_1.isAgCartesianChartOptions(mergedOptions)
            ? mergedOptions.type === 'groupedCategory'
                ? new groupedCategoryChart_1.GroupedCategoryChart(document)
                : new cartesianChart_1.CartesianChart(document)
            : prepare_1.isAgHierarchyChartOptions(mergedOptions)
                ? new hierarchyChart_1.HierarchyChart(document)
                : prepare_1.isAgPolarChartOptions(mergedOptions)
                    ? new polarChart_1.PolarChart(document)
                    : undefined;
        if (!chart) {
            throw new Error("AG Charts - couldn't apply configuration, check type of options: " + mergedOptions['type']);
        }
        AgChartV2.updateDelta(chart, mergedOptions, userOptions);
        return chart;
    };
    AgChartV2.update = function (chart, userOptions) {
        debug('user options', userOptions);
        var mixinOpts = {};
        if (AgChartV2.DEBUG()) {
            mixinOpts['debug'] = true;
        }
        var mergedOptions = prepare_1.prepareOptions(userOptions, chart.userOptions, mixinOpts);
        if (chartType(mergedOptions) !== chartType(chart.options)) {
            chart.destroy();
            console.warn('AG Charts - options supplied require a different type of chart, please recreate the chart.');
            return;
        }
        var deltaOptions = json_1.jsonDiff(chart.options, mergedOptions, {
            stringify: ['data'],
        });
        if (deltaOptions == null) {
            return;
        }
        AgChartV2.updateDelta(chart, deltaOptions, userOptions);
    };
    AgChartV2.updateDelta = function (chart, update, userOptions) {
        if (update.type == null) {
            update = __assign(__assign({}, update), { type: chart.options.type || prepare_1.optionsType(update) });
        }
        debug('delta update', update);
        applyChartOptions(chart, update, userOptions);
    };
    AgChartV2.DEBUG = function () { var _a; return _a = window_1.windowValue('agChartsDebug'), (_a !== null && _a !== void 0 ? _a : false); };
    return AgChartV2;
}());
exports.AgChartV2 = AgChartV2;
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
    if (prepare_1.isAgCartesianChartOptions(options)) {
        applyOptionValues(chart, options, {
            skip: ['type', 'data', 'series', 'axes', 'autoSize', 'listeners', 'theme'],
        });
    }
    else if (prepare_1.isAgPolarChartOptions(options)) {
        applyOptionValues(chart, options, { skip: ['type', 'data', 'series', 'autoSize', 'listeners', 'theme'] });
    }
    else if (prepare_1.isAgHierarchyChartOptions(options)) {
        applyOptionValues(chart, options, { skip: ['type', 'data', 'series', 'autoSize', 'listeners', 'theme'] });
    }
    else {
        throw new Error("AG Charts - couldn't apply configuration, check type of options and chart: " + options['type']);
    }
    var updateType = chart_1.ChartUpdateType.PERFORM_LAYOUT;
    if (options.series && options.series.length > 0) {
        applySeries(chart, options);
    }
    if (prepare_1.isAgCartesianChartOptions(options) && options.axes) {
        var axesPresent = applyAxes(chart, options);
        if (axesPresent) {
            updateType = chart_1.ChartUpdateType.PROCESS_DATA;
        }
    }
    var seriesOpts = options.series;
    if (options.data) {
        chart.data = options.data;
        updateType = chart_1.ChartUpdateType.PROCESS_DATA;
    }
    else if ((_a = seriesOpts) === null || _a === void 0 ? void 0 : _a.some(function (s) { return s.data != null; })) {
        updateType = chart_1.ChartUpdateType.PROCESS_DATA;
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
    chart.options = json_1.jsonMerge(chart.options || {}, options);
    chart.userOptions = json_1.jsonMerge(chart.userOptions || {}, userOptions);
    chart.update(updateType);
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
            var seriesDiff = json_1.jsonDiff(previousOpts, optSeries[i] || {});
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
        if (prepare_1.isAgCartesianChartOptions(oldOpts_1)) {
            chart.axes.forEach(function (a, i) {
                var _a;
                var previousOpts = ((_a = oldOpts_1.axes) === null || _a === void 0 ? void 0 : _a[i]) || {};
                var axisDiff = json_1.jsonDiff(previousOpts, optAxes[i]);
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
                    series.push(applySeriesValues(new areaSeries_1.AreaSeries(), seriesOptions, { path: path }));
                    break;
                case 'bar':
                // fall-through - bar and column are synonyms.
                case 'column':
                    series.push(applySeriesValues(new barSeries_1.BarSeries(), seriesOptions, { path: path }));
                    break;
                case 'histogram':
                    series.push(applySeriesValues(new histogramSeries_1.HistogramSeries(), seriesOptions, { path: path }));
                    break;
                case 'line':
                    series.push(applySeriesValues(new lineSeries_1.LineSeries(), seriesOptions, { path: path }));
                    break;
                case 'scatter':
                    series.push(applySeriesValues(new scatterSeries_1.ScatterSeries(), seriesOptions, { path: path }));
                    break;
                case 'pie':
                    series.push(applySeriesValues(new pieSeries_1.PieSeries(), seriesOptions, { path: path }));
                    break;
                case 'treemap':
                    series.push(applySeriesValues(new treemapSeries_1.TreemapSeries(), seriesOptions, { path: path }));
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
                    axes.push(applyOptionValues(new numberAxis_1.NumberAxis(), axisOptions, { path: path, skip: skip }));
                    break;
                case logAxis_1.LogAxis.type:
                    axes.push(applyOptionValues(new logAxis_1.LogAxis(), axisOptions, { path: path, skip: skip }));
                    break;
                case categoryAxis_1.CategoryAxis.type:
                    axes.push(applyOptionValues(new categoryAxis_1.CategoryAxis(), axisOptions, { path: path, skip: skip }));
                    break;
                case groupedCategoryAxis_1.GroupedCategoryAxis.type:
                    axes.push(applyOptionValues(new groupedCategoryAxis_1.GroupedCategoryAxis(), axisOptions, { path: path, skip: skip }));
                    break;
                case timeAxis_1.TimeAxis.type:
                    axes.push(applyOptionValues(new timeAxis_1.TimeAxis(), axisOptions, { path: path, skip: skip }));
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
        title: caption_1.Caption,
        subtitle: caption_1.Caption,
        shadow: dropShadow_1.DropShadow,
        'axes[].crossLines[]': crossLine_1.CrossLine,
    },
    allowedTypes: {
        'series[].marker.shape': ['primitive', 'function'],
        'axis[].tick.count': ['primitive', 'class-instance'],
    },
};
function applyOptionValues(target, options, _a) {
    var _b = _a === void 0 ? {} : _a, skip = _b.skip, path = _b.path;
    var applyOpts = __assign(__assign(__assign({}, JSON_APPLY_OPTIONS), { skip: skip }), (path ? { path: path } : {}));
    return json_1.jsonApply(target, options, applyOpts);
}
function applySeriesValues(target, options, _a) {
    var path = (_a === void 0 ? {} : _a).path;
    var _b, _c;
    var skip = ['series[].listeners'];
    var ctrs = ((_b = JSON_APPLY_OPTIONS) === null || _b === void 0 ? void 0 : _b.constructors) || {};
    var seriesTypeOverrides = {
        constructors: __assign(__assign({}, ctrs), { title: target.type === 'pie' ? pieSeries_1.PieTitle : ctrs['title'] }),
    };
    var applyOpts = __assign(__assign(__assign(__assign({}, JSON_APPLY_OPTIONS), seriesTypeOverrides), { skip: __spread(['series[].type'], (skip || [])) }), (path ? { path: path } : {}));
    var result = json_1.jsonApply(target, options, applyOpts);
    var listeners = (_c = options) === null || _c === void 0 ? void 0 : _c.listeners;
    if (listeners != null) {
        registerListeners(target, listeners);
    }
    return result;
}
