"use strict";
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
const dropShadow_1 = require("../scene/dropShadow");
const json_1 = require("../util/json");
const groupedCategoryChart_1 = require("./groupedCategoryChart");
const prepare_1 = require("./mapping/prepare");
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
    static create(options, container, data) {
        return AgChartV2.create(options);
    }
    static update(chart, options, container, data) {
        return AgChartV2.update(chart, options);
    }
}
exports.AgChart = AgChart;
class AgChartV2 {
    static create(userOptions) {
        if (AgChartV2.DEBUG) {
            console.log('user options', userOptions);
        }
        const mergedOptions = prepare_1.prepareOptions(userOptions);
        const chart = prepare_1.isAgCartesianChartOptions(mergedOptions) ? (mergedOptions.type === 'groupedCategory' ? new groupedCategoryChart_1.GroupedCategoryChart(document) : new cartesianChart_1.CartesianChart(document)) :
            prepare_1.isAgHierarchyChartOptions(mergedOptions) ? new hierarchyChart_1.HierarchyChart(document) :
                prepare_1.isAgPolarChartOptions(mergedOptions) ? new polarChart_1.PolarChart(document) :
                    undefined;
        if (!chart) {
            throw new Error(`AG Charts - couldn\'t apply configuration, check type of options: ${mergedOptions['type']}`);
        }
        AgChartV2.updateDelta(chart, mergedOptions, userOptions);
        return chart;
    }
    static update(chart, userOptions) {
        if (AgChartV2.DEBUG) {
            console.log('user options', userOptions);
        }
        const mergedOptions = prepare_1.prepareOptions(userOptions, chart.userOptions);
        if (chartType(mergedOptions) !== chartType(chart.options)) {
            chart.destroy();
            console.warn('AG Charts - options supplied require a different type of chart, please recreate the chart.');
            return;
        }
        const deltaOptions = json_1.jsonDiff(chart.options, mergedOptions, { stringify: ['data'] });
        if (deltaOptions == null) {
            return;
        }
        AgChartV2.updateDelta(chart, deltaOptions, userOptions);
    }
    static updateDelta(chart, update, userOptions) {
        if (update.type == null) {
            update = Object.assign(Object.assign({}, update), { type: chart.options.type || prepare_1.optionsType(update) });
        }
        if (AgChartV2.DEBUG) {
            console.log('delta update', update);
        }
        applyChartOptions(chart, update, userOptions);
    }
}
exports.AgChartV2 = AgChartV2;
AgChartV2.DEBUG = false;
function applyChartOptions(chart, options, userOptions) {
    if (prepare_1.isAgCartesianChartOptions(options)) {
        applyOptionValues(chart, options, { skip: ['type', 'data', 'series', 'axes', 'autoSize', 'listeners', 'theme'] });
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
    let performProcessData = false;
    if (options.series && options.series.length > 0) {
        chart.series = createSeries(options.series);
    }
    if (prepare_1.isAgCartesianChartOptions(options) && options.axes) {
        chart.axes = createAxis(options.axes);
        performProcessData = true;
    }
    if (options.data) {
        chart.data = options.data;
        performProcessData = true;
    }
    // Needs to be done last to avoid overrides by width/height properties.
    if (options.autoSize != null) {
        chart.autoSize = options.autoSize;
    }
    if (options.listeners) {
        registerListeners(chart, options.listeners);
    }
    chart.layoutPending = true;
    if (performProcessData) {
        chart.processData();
    }
    chart.performLayout();
    chart.options = json_1.jsonMerge(chart.options || {}, options);
    chart.userOptions = json_1.jsonMerge(chart.userOptions || {}, userOptions);
}
function createSeries(options) {
    const series = [];
    const skip = ['listeners'];
    let index = 0;
    for (const seriesOptions of options || []) {
        const path = `series[${index++}]`;
        switch (seriesOptions.type) {
            case 'area':
                series.push(applySeriesValues(new areaSeries_1.AreaSeries(), seriesOptions, { path, skip }));
                break;
            case 'bar':
            case 'column':
                series.push(applySeriesValues(new barSeries_1.BarSeries(), seriesOptions, { path, skip }));
                break;
            case 'histogram':
                series.push(applySeriesValues(new histogramSeries_1.HistogramSeries(), seriesOptions, { path, skip }));
                break;
            case 'line':
                series.push(applySeriesValues(new lineSeries_1.LineSeries(), seriesOptions, { path, skip }));
                break;
            case 'scatter':
                series.push(applySeriesValues(new scatterSeries_1.ScatterSeries(), seriesOptions, { path, skip }));
                break;
            case 'pie':
                series.push(applySeriesValues(new pieSeries_1.PieSeries(), seriesOptions, { path, skip }));
                break;
            case 'treemap':
                series.push(applySeriesValues(new treemapSeries_1.TreemapSeries(), seriesOptions, { path, skip }));
                break;
            default:
                throw new Error('AG Charts - unknown series type: ' + seriesOptions.type);
        }
    }
    series.forEach((next, index) => {
        var _a, _b;
        const listeners = (_b = (_a = options) === null || _a === void 0 ? void 0 : _a[index]) === null || _b === void 0 ? void 0 : _b.listeners;
        if (listeners == null) {
            return;
        }
        registerListeners(next, listeners);
    });
    return series;
}
function createAxis(options) {
    const axes = [];
    let index = 0;
    for (const axisOptions of options || []) {
        const path = `axis[${index++}]`;
        switch (axisOptions.type) {
            case 'number':
                axes.push(applyAxisValues(new numberAxis_1.NumberAxis(), axisOptions, { path }));
                break;
            case logAxis_1.LogAxis.type:
                axes.push(applyAxisValues(new logAxis_1.LogAxis(), axisOptions, { path }));
                break;
            case categoryAxis_1.CategoryAxis.type:
                axes.push(applyAxisValues(new categoryAxis_1.CategoryAxis(), axisOptions, { path }));
                break;
            case groupedCategoryAxis_1.GroupedCategoryAxis.type:
                axes.push(applyAxisValues(new groupedCategoryAxis_1.GroupedCategoryAxis(), axisOptions, { path }));
                break;
            case timeAxis_1.TimeAxis.type:
                axes.push(applyAxisValues(new timeAxis_1.TimeAxis(), axisOptions, { path }));
                break;
            default:
                throw new Error('AG Charts - unknown axis type: ' + axisOptions['type']);
        }
    }
    return axes;
}
function registerListeners(source, listeners) {
    for (const property in listeners) {
        source.addEventListener(property, listeners[property]);
    }
}
const JSON_APPLY_OPTIONS = {
    constructors: {
        'title': caption_1.Caption,
        'subtitle': caption_1.Caption,
        'shadow': dropShadow_1.DropShadow,
    },
    allowedTypes: {
        'series[].marker.shape': ['primitive', 'function'],
        'axis[].tick.count': ['primitive', 'class-instance'],
    },
};
function applyOptionValues(target, options, { skip, path } = {}) {
    const applyOpts = Object.assign(Object.assign(Object.assign({}, JSON_APPLY_OPTIONS), { skip: ['type', ...(skip || [])] }), (path ? { path } : {}));
    return json_1.jsonApply(target, options, applyOpts);
}
function applySeriesValues(target, options, { skip, path } = {}) {
    var _a;
    const ctrs = ((_a = JSON_APPLY_OPTIONS) === null || _a === void 0 ? void 0 : _a.constructors) || {};
    const seriesTypeOverrides = {
        constructors: Object.assign(Object.assign({}, ctrs), { 'title': target.type === 'pie' ? pieSeries_1.PieTitle : ctrs['title'] }),
    };
    const applyOpts = Object.assign(Object.assign(Object.assign(Object.assign({}, JSON_APPLY_OPTIONS), seriesTypeOverrides), { skip: ['type', ...(skip || [])] }), (path ? { path } : {}));
    return json_1.jsonApply(target, options, applyOpts);
}
function applyAxisValues(target, options, { skip, path } = {}) {
    const applyOpts = Object.assign(Object.assign(Object.assign({}, JSON_APPLY_OPTIONS), { skip: ['type', ...(skip || [])] }), (path ? { path } : {}));
    return json_1.jsonApply(target, options, applyOpts);
}
//# sourceMappingURL=agChartV2.js.map