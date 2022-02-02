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
import { Chart } from "./chart";
import { Series } from "./series/series";
import { LegendMarker } from "./legend";
import { ChartTheme, mergeOptions } from "./themes/chartTheme";
import { DarkTheme } from './themes/darkTheme';
import { MaterialLight } from "./themes/materialLight";
import { MaterialDark } from "./themes/materialDark";
import { PastelLight } from "./themes/pastelLight";
import { PastelDark } from "./themes/pastelDark";
import { SolarLight } from "./themes/solarLight";
import { SolarDark } from "./themes/solarDark";
import { VividLight } from "./themes/vividLight";
import { VividDark } from "./themes/vividDark";
import { find } from "../util/array";
import { deepMerge, getValue, isObject } from "../util/object";
// In the config object consumed by the factory we don't specify the types of objects we want to create,
// and in the rare cases when we do, the string type is not the same as corresponding constructor's name.
// Also, the user provided config might miss certain mandatory properties.
// For that reason, we must be able to tell what to instantiate and with what defaults using only
// property's name and position in the config's hierarchy. To be able to do that we need the extra
// information missing from the user provided config. Such information is provided by chart mappings.
import { mappings } from './agChartMappings';
var lightTheme = new ChartTheme();
var darkTheme = new DarkTheme();
export var lightThemes = {
    'undefined': lightTheme,
    'null': lightTheme,
    'ag-default': lightTheme,
    'ag-material': new MaterialLight(),
    'ag-pastel': new PastelLight(),
    'ag-solar': new SolarLight(),
    'ag-vivid': new VividLight(),
};
export var darkThemes = {
    'undefined': darkTheme,
    'null': darkTheme,
    'ag-default-dark': darkTheme,
    'ag-material-dark': new MaterialDark(),
    'ag-pastel-dark': new PastelDark(),
    'ag-solar-dark': new SolarDark(),
    'ag-vivid-dark': new VividDark(),
};
export var themes = __assign(__assign({}, darkThemes), lightThemes);
export function getChartTheme(value) {
    if (value instanceof ChartTheme) {
        return value;
    }
    var stockTheme = themes[value];
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
var firstColorIndex = 0;
var AgChart = /** @class */ (function () {
    function AgChart() {
    }
    AgChart.create = function (options, container, data) {
        options = Object.create(options); // avoid mutating user provided options
        return AgChart.createOrUpdate({
            options: options,
            container: container,
            data: data,
            operation: function (options, theme) { return create(options, undefined, undefined, theme); },
        });
    };
    AgChart.update = function (chart, options, container, data) {
        if (!(chart && options)) {
            return;
        }
        return AgChart.createOrUpdate({
            chart: chart,
            options: options,
            container: container,
            data: data,
            operation: function (options, theme) { return update(chart, options, undefined, theme); },
        });
    };
    AgChart.createOrUpdate = function (_a) {
        var chart = _a.chart, options = _a.options, container = _a.container, data = _a.data, operation = _a.operation;
        if (container) {
            options.container = container;
        }
        if (data) {
            options.data = data;
        }
        if (options.series && options.series.length > 0) {
            options.series = processSeriesOptions(options.series);
        }
        // special handling when both `autoSize` and `width` / `height` are present in the options
        var autoSize = options && options.autoSize !== false;
        var theme = getChartTheme(options.theme);
        firstColorIndex = 0;
        var result = operation(options, theme);
        if (chart == null && result instanceof Chart) {
            chart = result;
        }
        if (chart && autoSize) { // `autoSize` takes precedence over `width` / `height`
            chart.autoSize = true;
        }
        return result;
    };
    AgChart.createComponent = create;
    return AgChart;
}());
export { AgChart };
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
var actualSeriesTypeMap = {
    // Identity mappings.
    'area': 'area',
    'bar': 'bar',
    'histogram': 'histogram',
    'line': 'line',
    'pie': 'pie',
    'scatter': 'scatter',
    'ohlc': 'ohlc',
    'treemap': 'treemap',
    // Aliases.
    'column': 'bar',
};
function create(options, path, component, theme) {
    var _a;
    // Deprecate `chart.legend.item.marker.type` in integrated chart options.
    options = Object.create(options);
    if (component instanceof LegendMarker) {
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
    var mapping = getValue(mappings, path);
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
            component = new ((_a = meta.constructor).bind.apply(_a, __spread([void 0], constructorParamValues)))();
            if (theme && component instanceof Series) {
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
                            var axis = create(config, path + '.' + key, undefined, theme);
                            if (theme && key === 'axes') {
                                var fakeTheme = {
                                    getConfig: function (path) {
                                        var parts = path.split('.');
                                        var modifiedPath = parts.slice(0, 3).join('.') + '.' + axis.position;
                                        var after = parts.slice(3);
                                        if (after.length) {
                                            modifiedPath += '.' + after.join('.');
                                        }
                                        var config = theme.getConfig(path);
                                        var modifiedConfig = theme.getConfig(modifiedPath);
                                        isObject(theme.getConfig(modifiedPath));
                                        if (isObject(config) && isObject(modifiedConfig)) {
                                            return deepMerge(config, modifiedConfig, mergeOptions);
                                        }
                                        return modifiedConfig;
                                    }
                                };
                                update(axis, config, path + '.' + key, fakeTheme);
                            }
                            return axis;
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
    if (!(options && isObject(options))) {
        return;
    }
    // Deprecate `chart.legend.item.marker.type` in integrated chart options.
    if (component instanceof LegendMarker) {
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
    var chart = path in mappings ? component : undefined;
    var mapping = getValue(mappings, path);
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
                    else if (isObject(oldValue)) {
                        if (value) {
                            update(oldValue, value, value.type ? path : keyPath, theme);
                        }
                        else if (key in options) {
                            component[key] = value;
                        }
                    }
                    else {
                        var subComponent = isObject(value) && create(value, value.type ? path : keyPath, undefined, theme);
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
    var e_1, _a;
    var axes = chart.axes;
    var axesToAdd = [];
    var axesToUpdate = [];
    var _loop_2 = function (config) {
        var axisToUpdate = find(axes, function (axis) {
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
    try {
        for (var configs_1 = __values(configs), configs_1_1 = configs_1.next(); !configs_1_1.done; configs_1_1 = configs_1.next()) {
            var config = configs_1_1.value;
            _loop_2(config);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (configs_1_1 && !configs_1_1.done && (_a = configs_1.return)) _a.call(configs_1);
        }
        finally { if (e_1) throw e_1.error; }
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
        options = Object.create(options);
        options.type = series.type;
        return options;
    }
    // If chart type is not specified in the first series either, set it to 'cartesian'.
    options = Object.create(options);
    options.type = 'cartesian';
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
/**
 * Groups the series options objects if they are of type `column` or `bar` and places them in an array at the index where the first instance of this series type was found.
 * Returns an array of arrays containing the ordered and grouped series options objects.
 */
export function groupSeriesByType(seriesOptions) {
    var e_2, _a;
    var indexMap = {
        column: [],
        bar: [],
        line: [],
        scatter: [],
        area: [],
        histogram: [],
        ohlc: [],
        pie: [],
        treemap: [],
    };
    var result = [];
    try {
        for (var seriesOptions_1 = __values(seriesOptions), seriesOptions_1_1 = seriesOptions_1.next(); !seriesOptions_1_1.done; seriesOptions_1_1 = seriesOptions_1.next()) {
            var s = seriesOptions_1_1.value;
            var isColumnOrBar = s.type === 'column' || s.type === 'bar';
            var isStackedArea = s.type === 'area' && s.stacked === true;
            if (!isColumnOrBar && !isStackedArea) {
                // No need to use index for these cases.
                result.push([s]);
                continue;
            }
            var seriesType = s.type || 'line';
            if (seriesType === 'pie' || seriesType === 'treemap') {
                throw new Error("AG Grid - Unexpected series type of: " + seriesType);
            }
            else if (indexMap[seriesType].length === 0) {
                // Add indexed array to result on first addition.
                result.push(indexMap[seriesType]);
            }
            indexMap[seriesType].push(s);
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (seriesOptions_1_1 && !seriesOptions_1_1.done && (_a = seriesOptions_1.return)) _a.call(seriesOptions_1);
        }
        finally { if (e_2) throw e_2.error; }
    }
    return result;
}
/**
 * Takes an array of bar or area series options objects and returns a single object with the combined area series options.
 */
export function reduceSeries(series, enableBarSeriesSpecialCases) {
    var e_3, _a;
    var options = {};
    var arrayValueProperties = ['yKeys', 'fills', 'strokes', 'yNames', 'hideInChart', 'hideInLegend'];
    var stringValueProperties = ['yKey', 'fill', 'stroke', 'yName'];
    try {
        for (var series_1 = __values(series), series_1_1 = series_1.next(); !series_1_1.done; series_1_1 = series_1.next()) {
            var s = series_1_1.value;
            for (var property in s) {
                var arrayValueProperty = arrayValueProperties.indexOf(property) > -1;
                var stringValueProperty = stringValueProperties.indexOf(property) > -1;
                if (arrayValueProperty && s[property].length > 0) {
                    options[property] = __spread((options[property] || []), s[property]);
                }
                else if (stringValueProperty) {
                    options[property + "s"] = __spread((options[property + "s"] || []), [s[property]]);
                }
                else if (enableBarSeriesSpecialCases && property === 'showInLegend') {
                    if (s[property] === false) {
                        options.hideInLegend = __spread((options.hideInLegend || []), (s.yKey ? [s.yKey] : s.yKeys));
                    }
                }
                else if (enableBarSeriesSpecialCases && property === 'grouped') {
                    if (s[property] === true) {
                        options[property] = s[property];
                    }
                }
                else {
                    options[property] = s[property];
                }
            }
        }
    }
    catch (e_3_1) { e_3 = { error: e_3_1 }; }
    finally {
        try {
            if (series_1_1 && !series_1_1.done && (_a = series_1.return)) _a.call(series_1);
        }
        finally { if (e_3) throw e_3.error; }
    }
    return options;
}
/**
 * Transforms provided series options array into an array containing series options which are compatible with standalone charts series options.
 */
export function processSeriesOptions(seriesOptions) {
    var e_4, _a;
    var result = [];
    try {
        for (var _b = __values(groupSeriesByType(seriesOptions)), _c = _b.next(); !_c.done; _c = _b.next()) {
            var series = _c.value;
            switch (series[0].type) {
                case 'column':
                case 'bar':
                    result.push(reduceSeries(series, true));
                    break;
                case 'area':
                    result.push(reduceSeries(series, false));
                    break;
                case 'line':
                default:
                    if (series.length > 1) {
                        throw new Error('AG-Grid - unexpected grouping of series type: ' + series[0].type);
                    }
                    result.push(series[0]);
                    break;
            }
        }
    }
    catch (e_4_1) { e_4 = { error: e_4_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_4) throw e_4.error; }
    }
    return result;
}
//# sourceMappingURL=agChart.js.map