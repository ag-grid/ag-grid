import { CartesianChart } from './cartesianChart';
import { PolarChart } from './polarChart';
import { HierarchyChart } from './hierarchyChart';
import { Caption } from '../caption';
import { AreaSeries } from './series/cartesian/areaSeries';
import { BarSeries } from './series/cartesian/barSeries';
import { HistogramSeries } from './series/cartesian/histogramSeries';
import { LineSeries } from './series/cartesian/lineSeries';
import { ScatterSeries } from './series/cartesian/scatterSeries';
import { PieSeries, PieTitle } from './series/polar/pieSeries';
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
export class AgChart {
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
}
export class AgChartV2 {
    static create(userOptions) {
        debug('user options', userOptions);
        const mixinOpts = {};
        if (AgChartV2.DEBUG()) {
            mixinOpts['debug'] = true;
        }
        const mergedOptions = prepareOptions(userOptions, mixinOpts);
        const chart = isAgCartesianChartOptions(mergedOptions)
            ? mergedOptions.type === 'groupedCategory'
                ? new GroupedCategoryChart(document)
                : new CartesianChart(document)
            : isAgHierarchyChartOptions(mergedOptions)
                ? new HierarchyChart(document)
                : isAgPolarChartOptions(mergedOptions)
                    ? new PolarChart(document)
                    : undefined;
        if (!chart) {
            throw new Error(`AG Charts - couldn\'t apply configuration, check type of options: ${mergedOptions['type']}`);
        }
        AgChartV2.updateDelta(chart, mergedOptions, userOptions);
        return chart;
    }
    static update(chart, userOptions) {
        debug('user options', userOptions);
        const mixinOpts = {};
        if (AgChartV2.DEBUG()) {
            mixinOpts['debug'] = true;
        }
        const mergedOptions = prepareOptions(userOptions, chart.userOptions, mixinOpts);
        if (chartType(mergedOptions) !== chartType(chart.options)) {
            chart.destroy();
            console.warn('AG Charts - options supplied require a different type of chart, please recreate the chart.');
            return;
        }
        const deltaOptions = jsonDiff(chart.options, mergedOptions, {
            stringify: ['data'],
        });
        if (deltaOptions == null) {
            return;
        }
        AgChartV2.updateDelta(chart, deltaOptions, userOptions);
    }
    static updateDelta(chart, update, userOptions) {
        if (update.type == null) {
            update = Object.assign(Object.assign({}, update), { type: chart.options.type || optionsType(update) });
        }
        debug('delta update', update);
        applyChartOptions(chart, update, userOptions);
    }
}
AgChartV2.DEBUG = () => { var _a; return _a = windowValue('agChartsDebug'), (_a !== null && _a !== void 0 ? _a : false); };
function debug(message, ...optionalParams) {
    if (AgChartV2.DEBUG()) {
        console.log(message, ...optionalParams);
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
        throw new Error(`AG Charts - couldn\'t apply configuration, check type of options and chart: ${options['type']}`);
    }
    let updateType = ChartUpdateType.PERFORM_LAYOUT;
    if (options.series && options.series.length > 0) {
        applySeries(chart, options);
    }
    if (isAgCartesianChartOptions(options) && options.axes) {
        const axesPresent = applyAxes(chart, options);
        if (axesPresent) {
            updateType = ChartUpdateType.PROCESS_DATA;
        }
    }
    const seriesOpts = options.series;
    if (options.data) {
        chart.data = options.data;
        updateType = ChartUpdateType.PROCESS_DATA;
    }
    else if ((_a = seriesOpts) === null || _a === void 0 ? void 0 : _a.some((s) => s.data != null)) {
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
    chart.update(updateType);
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
            const seriesDiff = jsonDiff(previousOpts, optSeries[i] || {});
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
        if (isAgCartesianChartOptions(oldOpts)) {
            chart.axes.forEach((a, i) => {
                var _a;
                const previousOpts = ((_a = oldOpts.axes) === null || _a === void 0 ? void 0 : _a[i]) || {};
                const axisDiff = jsonDiff(previousOpts, optAxes[i]);
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
                series.push(applySeriesValues(new AreaSeries(), seriesOptions, { path }));
                break;
            case 'bar':
            // fall-through - bar and column are synonyms.
            case 'column':
                series.push(applySeriesValues(new BarSeries(), seriesOptions, { path }));
                break;
            case 'histogram':
                series.push(applySeriesValues(new HistogramSeries(), seriesOptions, { path }));
                break;
            case 'line':
                series.push(applySeriesValues(new LineSeries(), seriesOptions, { path }));
                break;
            case 'scatter':
                series.push(applySeriesValues(new ScatterSeries(), seriesOptions, { path }));
                break;
            case 'pie':
                series.push(applySeriesValues(new PieSeries(), seriesOptions, { path }));
                break;
            case 'treemap':
                series.push(applySeriesValues(new TreemapSeries(), seriesOptions, { path }));
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
                axes.push(applyOptionValues(new NumberAxis(), axisOptions, { path, skip }));
                break;
            case LogAxis.type:
                axes.push(applyOptionValues(new LogAxis(), axisOptions, { path, skip }));
                break;
            case CategoryAxis.type:
                axes.push(applyOptionValues(new CategoryAxis(), axisOptions, { path, skip }));
                break;
            case GroupedCategoryAxis.type:
                axes.push(applyOptionValues(new GroupedCategoryAxis(), axisOptions, { path, skip }));
                break;
            case TimeAxis.type:
                axes.push(applyOptionValues(new TimeAxis(), axisOptions, { path, skip }));
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
        title: Caption,
        subtitle: Caption,
        shadow: DropShadow,
        'axes[].crossLines[]': CrossLine,
    },
    allowedTypes: {
        'series[].marker.shape': ['primitive', 'function'],
        'axis[].tick.count': ['primitive', 'class-instance'],
    },
};
function applyOptionValues(target, options, { skip, path } = {}) {
    const applyOpts = Object.assign(Object.assign(Object.assign({}, JSON_APPLY_OPTIONS), { skip }), (path ? { path } : {}));
    return jsonApply(target, options, applyOpts);
}
function applySeriesValues(target, options, { path } = {}) {
    var _a, _b;
    const skip = ['series[].listeners'];
    const ctrs = ((_a = JSON_APPLY_OPTIONS) === null || _a === void 0 ? void 0 : _a.constructors) || {};
    const seriesTypeOverrides = {
        constructors: Object.assign(Object.assign({}, ctrs), { title: target.type === 'pie' ? PieTitle : ctrs['title'] }),
    };
    const applyOpts = Object.assign(Object.assign(Object.assign(Object.assign({}, JSON_APPLY_OPTIONS), seriesTypeOverrides), { skip: ['series[].type', ...(skip || [])] }), (path ? { path } : {}));
    const result = jsonApply(target, options, applyOpts);
    const listeners = (_b = options) === null || _b === void 0 ? void 0 : _b.listeners;
    if (listeners != null) {
        registerListeners(target, listeners);
    }
    return result;
}
