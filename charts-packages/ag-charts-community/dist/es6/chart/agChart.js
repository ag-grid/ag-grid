var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
import { find } from "../util/array";
import mappings from './chartMappings';
var AgChart = /** @class */ (function () {
    function AgChart() {
    }
    AgChart.create = function (options, container, data) {
        options = Object.create(options); // avoid mutating user provided options
        if (container) {
            options.container = container;
        }
        if (data) {
            options.data = data;
        }
        // special handling when both `autoSize` and `width` / `height` are present in the options
        var autoSize = options && options.autoSize;
        var chart = create(options);
        if (chart && autoSize) { // `autoSize` takes precedence over `width` / `height`
            chart.autoSize = true;
        }
        // console.log(JSON.stringify(flattenObject(options), null, 4));
        return chart;
    };
    AgChart.update = function (chart, options) {
        var autoSize = options && options.autoSize;
        update(chart, Object.create(options));
        if (chart && autoSize) {
            chart.autoSize = true;
        }
    };
    return AgChart;
}());
export { AgChart };
var pathToSeriesTypeMap = {
    'cartesian.series': 'line',
    'line.series': 'line',
    'area.series': 'area',
    'bar.series': 'bar',
    'column.series': 'column',
    'scatter.series': 'scatter',
    'polar.series': 'pie',
    'pie.series': 'pie'
};
function provideDefaultType(options, path) {
    if (!path) { // if `path` is undefined, `options` is a top-level (chart) config
        provideDefaultChartType(options);
    }
    if (!options.type) {
        var seriesType = pathToSeriesTypeMap[path];
        if (seriesType) {
            options.type = seriesType;
        }
    }
}
function getMapping(path) {
    var parts = path.split('.');
    var value = mappings;
    parts.forEach(function (part) {
        value = value[part];
    });
    return value;
}
function create(options, path, component) {
    var _a;
    provideDefaultType(options, path);
    if (path) {
        if (options.type) {
            path = path + '.' + options.type;
        }
    }
    else {
        path = options.type;
    }
    var mapping = getMapping(path);
    if (mapping) {
        provideDefaultOptions(options, mapping);
        var meta = mapping.meta || {};
        var constructorParams = meta.constructorParams || [];
        var skipKeys = ['type', 'listeners'].concat(constructorParams);
        // TODO: Constructor params processing could be improved, but it's good enough for current params.
        var constructorParamValues = constructorParams
            .map(function (param) { return options[param]; })
            .filter(function (value) { return value !== undefined; });
        component = component || new ((_a = meta.constructor).bind.apply(_a, __spreadArrays([void 0], constructorParamValues)))();
        var _loop_1 = function (key) {
            // Process every non-special key in the config object.
            if (skipKeys.indexOf(key) < 0) {
                var value = options[key];
                if (value && key in mapping && !(meta.setAsIs && meta.setAsIs.indexOf(key) >= 0)) {
                    if (Array.isArray(value)) {
                        var subComponents = value.map(function (config) { return create(config, path + '.' + key); }).filter(function (config) { return !!config; });
                        component[key] = subComponents;
                    }
                    else {
                        if (mapping[key] && component[key]) {
                            // The instance property already exists on the component (e.g. chart.legend).
                            // Simply configure the existing instance, without creating a new one.
                            create(value, path + '.' + key, component[key]);
                        }
                        else {
                            var subComponent = create(value, value.type ? path : path + '.' + key);
                            if (subComponent) {
                                component[key] = subComponent;
                            }
                        }
                    }
                }
                else { // if (key in meta.constructor.defaults) { // prevent users from creating custom properties
                    component[key] = value;
                }
            }
        };
        for (var key in options) {
            _loop_1(key);
        }
        var listeners = options.listeners;
        if (component && component.addEventListener && listeners) {
            for (var key in listeners) {
                if (listeners.hasOwnProperty(key)) {
                    var listener = listeners[key];
                    if (typeof listener === 'function') {
                        component.addEventListener(key, listener);
                    }
                }
            }
        }
        return component;
    }
}
function update(component, options, path) {
    if (!(options && typeof options === 'object')) {
        return;
    }
    provideDefaultType(options, path);
    if (path) {
        if (options.type) {
            path = path + '.' + options.type;
        }
    }
    else {
        path = options.type;
    }
    var mapping = getMapping(path);
    if (mapping) {
        provideDefaultOptions(options, mapping);
        var meta = mapping.meta || {};
        var constructorParams = meta && meta.constructorParams || [];
        var skipKeys = ['type'].concat(constructorParams);
        for (var key in options) {
            if (skipKeys.indexOf(key) < 0) {
                var value = options[key];
                var keyPath = path + '.' + key;
                if (meta.setAsIs && meta.setAsIs.indexOf(key) >= 0) {
                    component[key] = value;
                }
                else {
                    var oldValue = component[key];
                    if (Array.isArray(oldValue) && Array.isArray(value)) {
                        if (path in mappings) { // component is a chart
                            if (key === 'series') {
                                var chart = component;
                                var configs = value;
                                var allSeries = oldValue;
                                var prevSeries = void 0;
                                var i = 0;
                                for (; i < configs.length; i++) {
                                    var config = configs[i];
                                    var series = allSeries[i];
                                    if (series) {
                                        provideDefaultType(config, keyPath);
                                        if (series.type === config.type) {
                                            update(series, config, keyPath);
                                        }
                                        else {
                                            var newSeries = create(config, keyPath);
                                            chart.removeSeries(series);
                                            chart.addSeriesAfter(newSeries, prevSeries);
                                            series = newSeries;
                                        }
                                    }
                                    else { // more new configs than existing series
                                        var newSeries = create(config, keyPath);
                                        chart.addSeries(newSeries);
                                    }
                                    prevSeries = series;
                                }
                                // more existing series than new configs
                                for (; i < allSeries.length; i++) {
                                    var series = allSeries[i];
                                    if (series) {
                                        chart.removeSeries(series);
                                    }
                                }
                            }
                            else if (key === 'axes') {
                                var chart = component;
                                var configs = value;
                                var axes = oldValue;
                                var axesToAdd = [];
                                var axesToUpdate = [];
                                var _loop_2 = function (config) {
                                    var axisToUpdate = find(axes, function (axis) {
                                        return axis.type === config.type && axis.position === config.position;
                                    });
                                    if (axisToUpdate) {
                                        axesToUpdate.push(axisToUpdate);
                                        update(axisToUpdate, config, keyPath);
                                    }
                                    else {
                                        var axisToAdd = create(config, keyPath);
                                        if (axisToAdd) {
                                            axesToAdd.push(axisToAdd);
                                        }
                                    }
                                };
                                for (var _i = 0, configs_1 = configs; _i < configs_1.length; _i++) {
                                    var config = configs_1[_i];
                                    _loop_2(config);
                                }
                                chart.axes = axesToUpdate.concat(axesToAdd);
                            }
                        }
                        else {
                            component[key] = value;
                        }
                    }
                    else if (typeof oldValue === 'object') {
                        if (value) {
                            update(oldValue, value, value.type ? path : keyPath);
                        }
                        else if (key in options) {
                            component[key] = value;
                        }
                    }
                    else {
                        var subComponent = isObject(value) && create(value, value.type ? path : keyPath);
                        if (subComponent) {
                            component[key] = subComponent;
                        }
                        else {
                            component[key] = value;
                        }
                    }
                }
            }
        }
    }
    if (path in mappings) { // top-level component (chart)
        component.performLayout();
    }
}
function provideDefaultChartType(options) {
    // If chart type is not specified, try to infer it from the type of first series.
    if (!options.type) {
        var series = options.series && options.series[0];
        if (series && series.type) {
            outerLoop: for (var chartType in mappings) {
                for (var seriesType in mappings[chartType].series) {
                    if (series.type === seriesType) {
                        options.type = chartType;
                        break outerLoop;
                    }
                }
            }
        }
        if (!options.type) {
            options.type = 'cartesian';
        }
    }
}
/**
 * If certain options were not provided by the user, use the defaults from the mapping.
 * @param options
 * @param mapping
 */
function provideDefaultOptions(options, mapping) {
    var defaults = mapping && mapping.meta && mapping.meta.defaults;
    if (defaults) {
        for (var key in defaults) {
            if (!(key in options)) {
                options[key] = defaults[key];
            }
        }
    }
}
function isObject(value) {
    return typeof value === 'object' && !Array.isArray(value);
}
