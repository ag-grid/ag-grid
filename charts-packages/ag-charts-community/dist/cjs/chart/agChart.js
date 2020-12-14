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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var series_1 = require("./series/series");
var legend_1 = require("./legend");
var chartTheme_1 = require("./themes/chartTheme");
var darkTheme_1 = require("./themes/darkTheme");
var materialLight_1 = require("./themes/materialLight");
var materialDark_1 = require("./themes/materialDark");
var pastelLight_1 = require("./themes/pastelLight");
var pastelDark_1 = require("./themes/pastelDark");
var solarLight_1 = require("./themes/solarLight");
var solarDark_1 = require("./themes/solarDark");
var vividLight_1 = require("./themes/vividLight");
var vividDark_1 = require("./themes/vividDark");
var array_1 = require("../util/array");
var object_1 = require("../util/object");
var agChartMappings_1 = require("./agChartMappings");
var lightTheme = new chartTheme_1.ChartTheme();
var darkTheme = new darkTheme_1.DarkTheme();
exports.lightThemes = {
    'undefined': lightTheme,
    'null': lightTheme,
    'ag-default': lightTheme,
    'ag-material': new materialLight_1.MaterialLight(),
    'ag-pastel': new pastelLight_1.PastelLight(),
    'ag-solar': new solarLight_1.SolarLight(),
    'ag-vivid': new vividLight_1.VividLight(),
};
exports.darkThemes = {
    'undefined': darkTheme,
    'null': darkTheme,
    'ag-default-dark': darkTheme,
    'ag-material-dark': new materialDark_1.MaterialDark(),
    'ag-pastel-dark': new pastelDark_1.PastelDark(),
    'ag-solar-dark': new solarDark_1.SolarDark(),
    'ag-vivid-dark': new vividDark_1.VividDark(),
};
exports.themes = __assign(__assign({}, exports.darkThemes), exports.lightThemes);
function getChartTheme(value) {
    if (value instanceof chartTheme_1.ChartTheme) {
        return value;
    }
    var stockTheme = exports.themes[value];
    if (stockTheme) {
        return stockTheme;
    }
    value = value;
    if (value.baseTheme || value.overrides || value.palette) {
        var baseTheme = getChartTheme(value.baseTheme);
        return new baseTheme.constructor(value);
    }
    return lightTheme;
}
exports.getChartTheme = getChartTheme;
var firstColorIndex = 0;
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
        var autoSize = options && options.autoSize !== false;
        var theme = getChartTheme(options.theme);
        firstColorIndex = 0;
        var chart = create(options, undefined, undefined, theme);
        if (chart) {
            if (autoSize) { // `autoSize` takes precedence over `width` / `height`
                chart.autoSize = true;
            }
        }
        return chart;
    };
    AgChart.update = function (chart, options, container, data) {
        if (!(chart && options)) {
            return;
        }
        options = Object.create(options);
        if (container) {
            options.container = container;
        }
        if (data) {
            options.data = data;
        }
        var autoSize = options && options.autoSize !== false;
        var theme = getChartTheme(options.theme);
        firstColorIndex = 0;
        update(chart, options, undefined, theme);
        if (autoSize) {
            chart.autoSize = true;
        }
    };
    AgChart.save = function (component) {
        var target = {};
        save(component, target);
        return target;
    };
    AgChart.createComponent = create;
    return AgChart;
}());
exports.AgChart = AgChart;
var pathToSeriesTypeMap = {
    'cartesian.series': 'line',
    'line.series': 'line',
    'area.series': 'area',
    'bar.series': 'bar',
    'column.series': 'column',
    'histogram.series': 'histogram',
    'scatter.series': 'scatter',
    'polar.series': 'pie',
    'pie.series': 'pie'
};
var actualSeriesTypeMap = (function () {
    var map = {};
    var actualSeries = ['area', 'bar', 'histogram', 'line', 'pie', 'scatter'];
    actualSeries.forEach(function (series) { return map[series] = series; });
    // Aliases:
    map['column'] = 'bar';
    return map;
})();
function save(component, target, mapping) {
    if (target === void 0) { target = {}; }
    if (mapping === void 0) { mapping = agChartMappings_1.default; }
    if (component.constructor && component.constructor.type && !mapping.meta) {
        mapping = mapping[component.constructor.type];
    }
    var defaults = mapping && mapping.meta && mapping.meta.defaults;
    var keys = Object.keys(defaults);
    keys.forEach(function (key) {
        var value = component[key];
        if (object_1.isObject(value) && (!mapping.meta.nonSerializable || mapping.meta.nonSerializable.indexOf(key) < 0)) {
            target[key] = {};
            // save(value, target[key], mapping[key]);
        }
        else if (Array.isArray(value)) {
            // target[key] = [];
            // save(value, target[key], map[key]);
        }
        else {
            target[key] = component[key];
        }
    });
}
function create(options, path, component, theme) {
    var _a;
    // Deprecate `chart.legend.item.marker.type` in integrated chart options.
    options = Object.create(options);
    if (component instanceof legend_1.LegendMarker) {
        if (options.type) {
            options.shape = options.type;
        }
    }
    else {
        options = provideDefaultType(options, path);
        if (path) {
            if (options.type) {
                path = path + '.' + options.type;
            }
        }
        else {
            path = options.type;
        }
    }
    if (!path) {
        return;
    }
    var mapping = object_1.getValue(agChartMappings_1.default, path);
    if (mapping) {
        options = provideDefaultOptions(path, options, mapping, theme);
        var meta = mapping.meta || {};
        var constructorParams = meta.constructorParams || [];
        var skipKeys = ['type', 'listeners'].concat(constructorParams);
        // TODO: Constructor params processing could be improved, but it's good enough for current params.
        var constructorParamValues = constructorParams
            .map(function (param) { return options[param]; })
            .filter(function (value) { return value !== undefined; });
        if (!component) {
            component = new ((_a = meta.constructor).bind.apply(_a, __spreadArrays([void 0], constructorParamValues)))();
            if (theme && component instanceof series_1.Series) {
                firstColorIndex = theme.setSeriesColors(component, options, firstColorIndex);
            }
        }
        var _loop_1 = function (key) {
            // Process every non-special key in the config object.
            if (skipKeys.indexOf(key) < 0) {
                var value = options[key];
                if (value && key in mapping && !(meta.setAsIs && meta.setAsIs.indexOf(key) >= 0)) {
                    if (Array.isArray(value)) {
                        var subComponents = value
                            .map(function (config) {
                            return create(config, path + '.' + key, undefined, theme);
                        })
                            .filter(function (instance) { return !!instance; });
                        component[key] = subComponents;
                    }
                    else {
                        if (mapping[key] && component[key]) {
                            // The instance property already exists on the component (e.g. chart.legend).
                            // Simply configure the existing instance, without creating a new one.
                            create(value, path + '.' + key, component[key], theme);
                        }
                        else {
                            var subComponent = create(value, value.type ? path : path + '.' + key, undefined, theme);
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
function update(component, options, path, theme) {
    if (!(options && object_1.isObject(options))) {
        return;
    }
    // Deprecate `chart.legend.item.marker.type` in integrated chart options.
    if (component instanceof legend_1.LegendMarker) {
        if (options.type) {
            options.shape = options.type;
        }
    }
    else {
        options = provideDefaultType(options, path);
        if (path) {
            if (options.type) {
                path = path + '.' + options.type;
            }
        }
        else {
            path = options.type;
        }
    }
    if (!path) {
        return;
    }
    var chart = path in agChartMappings_1.default ? component : undefined;
    var mapping = object_1.getValue(agChartMappings_1.default, path);
    if (mapping) {
        options = provideDefaultOptions(path, options, mapping, theme);
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
                        if (chart) {
                            if (key === 'series') {
                                updateSeries(component, value, keyPath, theme);
                            }
                            else if (key === 'axes') {
                                updateAxes(component, value, keyPath, theme);
                            }
                        }
                        else {
                            component[key] = value;
                        }
                    }
                    else if (object_1.isObject(oldValue)) {
                        if (value) {
                            update(oldValue, value, value.type ? path : keyPath, theme);
                        }
                        else if (key in options) {
                            component[key] = value;
                        }
                    }
                    else {
                        var subComponent = object_1.isObject(value) && create(value, value.type ? path : keyPath, undefined, theme);
                        if (subComponent) {
                            component[key] = subComponent;
                        }
                        else {
                            if (chart && options.autoSize && (key === 'width' || key === 'height')) {
                                continue;
                            }
                            component[key] = value;
                        }
                    }
                }
            }
        }
    }
    if (chart) {
        chart.layoutPending = true;
    }
}
function updateSeries(chart, configs, keyPath, theme) {
    var allSeries = chart.series.slice();
    var prevSeries;
    var i = 0;
    for (; i < configs.length; i++) {
        var config = configs[i];
        var series = allSeries[i];
        if (series) {
            config = provideDefaultType(config, keyPath);
            var type = actualSeriesTypeMap[config.type];
            if (series.type === type) {
                if (theme) {
                    firstColorIndex = theme.setSeriesColors(series, config, firstColorIndex);
                }
                update(series, config, keyPath, theme);
            }
            else {
                var newSeries = create(config, keyPath, undefined, theme);
                chart.removeSeries(series);
                chart.addSeriesAfter(newSeries, prevSeries);
                series = newSeries;
            }
        }
        else { // more new configs than existing series
            var newSeries = create(config, keyPath, undefined, theme);
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
function updateAxes(chart, configs, keyPath, theme) {
    var axes = chart.axes;
    var axesToAdd = [];
    var axesToUpdate = [];
    var _loop_2 = function (config) {
        var axisToUpdate = array_1.find(axes, function (axis) {
            return axis.type === config.type && axis.position === config.position;
        });
        if (axisToUpdate) {
            axesToUpdate.push(axisToUpdate);
            update(axisToUpdate, config, keyPath, theme);
        }
        else {
            var axisToAdd = create(config, keyPath, undefined, theme);
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
function provideDefaultChartType(options) {
    if (options.type) {
        return options;
    }
    // If chart type is not specified, try to infer it from the type of first series.
    var series = options.series && options.series[0];
    if (series && series.type) {
        outerLoop: for (var chartType in agChartMappings_1.default) {
            for (var seriesType in agChartMappings_1.default[chartType].series) {
                if (series.type === seriesType) {
                    options = Object.create(options);
                    options.type = chartType;
                    break outerLoop;
                }
            }
        }
    }
    if (!options.type) {
        options = Object.create(options);
        options.type = 'cartesian';
    }
    return options;
}
function provideDefaultType(options, path) {
    if (!path) { // if `path` is undefined, `options` is a top-level (chart) config
        path = '';
        options = provideDefaultChartType(options);
    }
    if (!options.type) {
        var seriesType = pathToSeriesTypeMap[path];
        if (seriesType) {
            options = Object.create(options);
            options.type = seriesType;
        }
    }
    return options;
}
function skipThemeKey(key) {
    return ['axes', 'series'].indexOf(key) >= 0;
}
var enabledKey = 'enabled';
/**
 * If certain options were not provided by the user, use the defaults from the theme and the mapping.
 * All three objects are provided for the current path in the config tree, not necessarily top-level.
 */
function provideDefaultOptions(path, options, mapping, theme) {
    var isChartConfig = path.indexOf('.') < 0;
    var themeDefaults = theme && theme.getConfig(path);
    var defaults = mapping && mapping.meta && mapping.meta.defaults;
    var isExplicitlyDisabled = options.enabled === false; // by the user
    if (defaults || themeDefaults) {
        options = Object.create(options);
    }
    // Fill in the gaps for properties not configured by the user using theme provided values.
    for (var key in themeDefaults) {
        // The default values for these special chart configs always come from the mappings, not theme.
        if (isChartConfig && skipThemeKey(key)) {
            continue;
        }
        if (!(key in options)) {
            options[key] = themeDefaults[key];
        }
    }
    // Fill in the gaps for properties not configured by the user, nor theme using chart mappings.
    for (var key in defaults) {
        if ((!themeDefaults || !(key in themeDefaults) || skipThemeKey(key)) && !(key in options)) {
            options[key] = defaults[key];
        }
    }
    // Special handling for the 'enabled' property. For example:
    // title: { text: 'Quarterly Revenue' } // means title is enabled
    // legend: {} // means legend is enabled
    var hasEnabledKey = (themeDefaults && enabledKey in themeDefaults) ||
        (defaults && enabledKey in defaults);
    if (hasEnabledKey && !isExplicitlyDisabled) {
        options[enabledKey] = true;
    }
    return options;
}
//# sourceMappingURL=agChart.js.map