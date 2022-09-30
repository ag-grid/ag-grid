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
const chart_1 = require("./chart");
const dropShadow_1 = require("../scene/dropShadow");
const json_1 = require("../util/json");
const groupedCategoryChart_1 = require("./groupedCategoryChart");
const prepare_1 = require("./mapping/prepare");
const crossLine_1 = require("./crossline/crossLine");
const window_1 = require("../util/window");
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
class AgChart {
    /** @deprecated use AgChart.create() or AgChart.update() instead. */
    static createComponent(options, type) {
        // console.warn('AG Charts - createComponent should no longer be used, use AgChart.update() instead.')
        if (type.indexOf('.series') >= 0) {
            const optionsWithType = Object.assign(Object.assign({}, options), { type: options.type || type.split('.')[0] });
            return createSeries([optionsWithType])[0];
        }
        return null;
    }
    static create(options, _container, _data) {
        return AgChartV2.create(options);
    }
    static update(chart, options, _container, _data) {
        return AgChartV2.update(chart, options);
    }
    static download(chart, options) {
        return AgChartV2.download(chart, options);
    }
}
exports.AgChart = AgChart;
class AgChartV2 {
    static create(userOptions) {
        debug('user options', userOptions);
        const mixinOpts = {};
        if (AgChartV2.DEBUG()) {
            mixinOpts['debug'] = true;
        }
        const { overrideDevicePixelRatio } = userOptions;
        delete userOptions['overrideDevicePixelRatio'];
        const mergedOptions = prepare_1.prepareOptions(userOptions, mixinOpts);
        const chart = prepare_1.isAgCartesianChartOptions(mergedOptions)
            ? mergedOptions.type === 'groupedCategory'
                ? new groupedCategoryChart_1.GroupedCategoryChart(document, overrideDevicePixelRatio)
                : new cartesianChart_1.CartesianChart(document, overrideDevicePixelRatio)
            : prepare_1.isAgHierarchyChartOptions(mergedOptions)
                ? new hierarchyChart_1.HierarchyChart(document, overrideDevicePixelRatio)
                : prepare_1.isAgPolarChartOptions(mergedOptions)
                    ? new polarChart_1.PolarChart(document, overrideDevicePixelRatio)
                    : undefined;
        if (!chart) {
            throw new Error(`AG Charts - couldn\'t apply configuration, check type of options: ${mergedOptions['type']}`);
        }
        chart.requestFactoryUpdate(() => __awaiter(this, void 0, void 0, function* () {
            if (chart.destroyed) {
                // Chart destroyed, skip processing.
                return;
            }
            yield AgChartV2.updateDelta(chart, mergedOptions, userOptions);
        }));
        return chart;
    }
    static update(chart, userOptions) {
        debug('user options', userOptions);
        const mixinOpts = {};
        if (AgChartV2.DEBUG()) {
            mixinOpts['debug'] = true;
        }
        chart.requestFactoryUpdate(() => __awaiter(this, void 0, void 0, function* () {
            if (chart.destroyed) {
                // Chart destroyed, skip processing.
                return;
            }
            const mergedOptions = prepare_1.prepareOptions(userOptions, chart.userOptions, mixinOpts);
            if (chartType(mergedOptions) !== chartType(chart.options)) {
                chart.destroy();
                console.warn('AG Charts - options supplied require a different type of chart, please recreate the chart.');
                return;
            }
            const deltaOptions = json_1.jsonDiff(chart.options, mergedOptions, {
                stringify: ['data'],
            });
            if (deltaOptions == null) {
                return;
            }
            yield AgChartV2.updateDelta(chart, deltaOptions, userOptions);
        }));
    }
    /**
     * Returns the content of the current canvas as an image.
     * @param opts The download options including `width` and `height` of the image as well as `fileName` and `fileFormat`.
     */
    static download(chart, opts) {
        let { width, height, fileName, fileFormat } = opts || {};
        const currentWidth = chart.width;
        const currentHeight = chart.height;
        const unchanged = (width === undefined && height === undefined) ||
            (chart.scene.canvas.pixelRatio === 1 && currentWidth === width && currentHeight === height);
        if (unchanged) {
            chart.scene.download(fileName, fileFormat);
            return;
        }
        width = (width !== null && width !== void 0 ? width : currentWidth);
        height = (height !== null && height !== void 0 ? height : currentHeight);
        const options = Object.assign(Object.assign({}, chart.userOptions), { container: document.createElement('div'), width,
            height, autoSize: false, overrideDevicePixelRatio: 1 });
        const clonedChart = AgChartV2.create(options);
        clonedChart.waitForUpdate().then(() => {
            clonedChart.scene.download(fileName, fileFormat);
            clonedChart.destroy();
        });
    }
    static updateDelta(chart, update, userOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            if (update.type == null) {
                update = Object.assign(Object.assign({}, update), { type: chart.options.type || prepare_1.optionsType(update) });
            }
            debug('delta update', update);
            yield chart.awaitUpdateCompletion();
            applyChartOptions(chart, update, userOptions);
        });
    }
}
exports.AgChartV2 = AgChartV2;
AgChartV2.DEBUG = () => { var _a; return _a = window_1.windowValue('agChartsDebug'), (_a !== null && _a !== void 0 ? _a : false); };
function debug(message, ...optionalParams) {
    if (AgChartV2.DEBUG()) {
        console.log(message, ...optionalParams);
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
        throw new Error(`AG Charts - couldn\'t apply configuration, check type of options and chart: ${options['type']}`);
    }
    let updateType = chart_1.ChartUpdateType.PERFORM_LAYOUT;
    let forceNodeDataRefresh = false;
    if (options.series && options.series.length > 0) {
        applySeries(chart, options);
    }
    if (prepare_1.isAgCartesianChartOptions(options) && options.axes) {
        const axesPresent = applyAxes(chart, options);
        if (axesPresent) {
            updateType = chart_1.ChartUpdateType.PROCESS_DATA;
            forceNodeDataRefresh = true;
        }
    }
    const seriesOpts = options.series;
    if (options.data) {
        chart.data = options.data;
        updateType = chart_1.ChartUpdateType.PROCESS_DATA;
    }
    else if ((_a = seriesOpts) === null || _a === void 0 ? void 0 : _a.some((s) => s.data != null)) {
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
    chart.update(updateType, { forceNodeDataRefresh });
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
            const previousOpts = ((_b = (_a = chart.options) === null || _a === void 0 ? void 0 : _a.series) === null || _b === void 0 ? void 0 : _b[i]) || {};
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
        const oldOpts = chart.options;
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
            // fall-through - bar and column are synonyms.
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
        source.addEventListener(property, listeners[property]);
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
        'series[].marker.shape': ['primitive', 'function'],
        'axis[].tick.count': ['primitive', 'class-instance'],
    },
};
function applyOptionValues(target, options, { skip, path } = {}) {
    const applyOpts = Object.assign(Object.assign(Object.assign({}, JSON_APPLY_OPTIONS), { skip }), (path ? { path } : {}));
    return json_1.jsonApply(target, options, applyOpts);
}
function applySeriesValues(target, options, { path } = {}) {
    var _a, _b;
    const skip = ['series[].listeners'];
    const ctrs = ((_a = JSON_APPLY_OPTIONS) === null || _a === void 0 ? void 0 : _a.constructors) || {};
    const seriesTypeOverrides = {
        constructors: Object.assign(Object.assign({}, ctrs), { title: target.type === 'pie' ? pieSeries_1.PieTitle : ctrs['title'] }),
    };
    const applyOpts = Object.assign(Object.assign(Object.assign(Object.assign({}, JSON_APPLY_OPTIONS), seriesTypeOverrides), { skip: ['series[].type', ...(skip || [])] }), (path ? { path } : {}));
    const result = json_1.jsonApply(target, options, applyOpts);
    const listeners = (_b = options) === null || _b === void 0 ? void 0 : _b.listeners;
    if (listeners != null) {
        registerListeners(target, listeners);
    }
    return result;
}
