"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chart_1 = require("./chart");
const series_1 = require("./series/series");
const legend_1 = require("./legend");
const chartTheme_1 = require("./themes/chartTheme");
const darkTheme_1 = require("./themes/darkTheme");
const materialLight_1 = require("./themes/materialLight");
const materialDark_1 = require("./themes/materialDark");
const pastelLight_1 = require("./themes/pastelLight");
const pastelDark_1 = require("./themes/pastelDark");
const solarLight_1 = require("./themes/solarLight");
const solarDark_1 = require("./themes/solarDark");
const vividLight_1 = require("./themes/vividLight");
const vividDark_1 = require("./themes/vividDark");
const array_1 = require("../util/array");
const object_1 = require("../util/object");
// In the config object consumed by the factory we don't specify the types of objects we want to create,
// and in the rare cases when we do, the string type is not the same as corresponding constructor's name.
// Also, the user provided config might miss certain mandatory properties.
// For that reason, we must be able to tell what to instantiate and with what defaults using only
// property's name and position in the config's hierarchy. To be able to do that we need the extra
// information missing from the user provided config. Such information is provided by chart mappings.
const agChartMappings_1 = require("./agChartMappings");
const lightTheme = new chartTheme_1.ChartTheme();
const darkTheme = new darkTheme_1.DarkTheme();
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
exports.themes = Object.assign(Object.assign({}, exports.darkThemes), exports.lightThemes);
function getChartTheme(value) {
    if (value instanceof chartTheme_1.ChartTheme) {
        return value;
    }
    const stockTheme = exports.themes[value];
    if (stockTheme) {
        return stockTheme;
    }
    value = value;
    if (value.baseTheme || value.overrides || value.palette) {
        const baseTheme = getChartTheme(value.baseTheme);
        return new baseTheme.constructor(value);
    }
    return lightTheme;
}
exports.getChartTheme = getChartTheme;
let firstColorIndex = 0;
class AgChart {
    static create(options, container, data) {
        options = Object.create(options); // avoid mutating user provided options
        return AgChart.createOrUpdate({
            options,
            container,
            data,
            operation: (options, theme) => create(options, undefined, undefined, theme),
        });
    }
    static update(chart, options, container, data) {
        if (!(chart && options)) {
            return;
        }
        return AgChart.createOrUpdate({
            chart,
            options,
            container,
            data,
            operation: (options, theme) => update(chart, options, undefined, theme),
        });
    }
    static createOrUpdate({ chart, options, container, data, operation }) {
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
        const autoSize = options && options.autoSize !== false;
        const theme = getChartTheme(options.theme);
        firstColorIndex = 0;
        const result = operation(options, theme);
        if (chart == null && result instanceof chart_1.Chart) {
            chart = result;
        }
        if (chart && autoSize) { // `autoSize` takes precedence over `width` / `height`
            chart.autoSize = true;
        }
        return result;
    }
}
exports.AgChart = AgChart;
AgChart.createComponent = create;
const pathToSeriesTypeMap = {
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
const actualSeriesTypeMap = {
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
    const mapping = object_1.getValue(agChartMappings_1.mappings, path);
    if (mapping) {
        options = provideDefaultOptions(path, options, mapping, theme);
        const meta = mapping.meta || {};
        const constructorParams = meta.constructorParams || [];
        const skipKeys = ['type', 'listeners'].concat(constructorParams);
        // TODO: Constructor params processing could be improved, but it's good enough for current params.
        const constructorParamValues = constructorParams
            .map((param) => options[param])
            .filter((value) => value !== undefined);
        if (!component) {
            component = new meta.constructor(...constructorParamValues);
            if (theme && component instanceof series_1.Series) {
                firstColorIndex = theme.setSeriesColors(component, options, firstColorIndex);
            }
        }
        for (const key in options) {
            // Process every non-special key in the config object.
            if (skipKeys.indexOf(key) < 0) {
                const value = options[key];
                if (value && key in mapping && !(meta.setAsIs && meta.setAsIs.indexOf(key) >= 0)) {
                    if (Array.isArray(value)) {
                        const subComponents = value
                            .map(config => {
                            const axis = create(config, path + '.' + key, undefined, theme);
                            if (theme && key === 'axes') {
                                const fakeTheme = {
                                    getConfig(path) {
                                        const parts = path.split('.');
                                        let modifiedPath = parts.slice(0, 3).join('.') + '.' + axis.position;
                                        const after = parts.slice(3);
                                        if (after.length) {
                                            modifiedPath += '.' + after.join('.');
                                        }
                                        const config = theme.getConfig(path);
                                        const modifiedConfig = theme.getConfig(modifiedPath);
                                        object_1.isObject(theme.getConfig(modifiedPath));
                                        if (object_1.isObject(config) && object_1.isObject(modifiedConfig)) {
                                            return object_1.deepMerge(config, modifiedConfig, chartTheme_1.mergeOptions);
                                        }
                                        return modifiedConfig;
                                    }
                                };
                                update(axis, config, path + '.' + key, fakeTheme);
                            }
                            return axis;
                        })
                            .filter(instance => !!instance);
                        component[key] = subComponents;
                    }
                    else {
                        if (mapping[key] && component[key]) {
                            // The instance property already exists on the component (e.g. chart.legend).
                            // Simply configure the existing instance, without creating a new one.
                            create(value, path + '.' + key, component[key], theme);
                        }
                        else {
                            const subComponent = create(value, value.type ? path : path + '.' + key, undefined, theme);
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
        }
        const listeners = options.listeners;
        if (component && component.addEventListener && listeners) {
            for (const key in listeners) {
                if (listeners.hasOwnProperty(key)) {
                    const listener = listeners[key];
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
    const chart = path in agChartMappings_1.mappings ? component : undefined;
    const mapping = object_1.getValue(agChartMappings_1.mappings, path);
    if (mapping) {
        options = provideDefaultOptions(path, options, mapping, theme);
        const meta = mapping.meta || {};
        const constructorParams = meta && meta.constructorParams || [];
        const skipKeys = ['type'].concat(constructorParams);
        for (const key in options) {
            if (skipKeys.indexOf(key) < 0) {
                const value = options[key];
                const keyPath = path + '.' + key;
                if (meta.setAsIs && meta.setAsIs.indexOf(key) >= 0) {
                    component[key] = value;
                }
                else {
                    const oldValue = component[key];
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
                        const subComponent = object_1.isObject(value) && create(value, value.type ? path : keyPath, undefined, theme);
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
    const allSeries = chart.series.slice();
    let prevSeries;
    let i = 0;
    for (; i < configs.length; i++) {
        let config = configs[i];
        let series = allSeries[i];
        if (series) {
            config = provideDefaultType(config, keyPath);
            const type = actualSeriesTypeMap[config.type];
            if (series.type === type) {
                if (theme) {
                    firstColorIndex = theme.setSeriesColors(series, config, firstColorIndex);
                }
                update(series, config, keyPath, theme);
            }
            else {
                const newSeries = create(config, keyPath, undefined, theme);
                chart.removeSeries(series);
                chart.addSeriesAfter(newSeries, prevSeries);
                series = newSeries;
            }
        }
        else { // more new configs than existing series
            const newSeries = create(config, keyPath, undefined, theme);
            chart.addSeries(newSeries);
        }
        prevSeries = series;
    }
    // more existing series than new configs
    for (; i < allSeries.length; i++) {
        const series = allSeries[i];
        if (series) {
            chart.removeSeries(series);
        }
    }
}
function updateAxes(chart, configs, keyPath, theme) {
    const axes = chart.axes;
    const axesToAdd = [];
    const axesToUpdate = [];
    for (const config of configs) {
        const axisToUpdate = array_1.find(axes, axis => {
            return axis.type === config.type && axis.position === config.position;
        });
        if (axisToUpdate) {
            axesToUpdate.push(axisToUpdate);
            update(axisToUpdate, config, keyPath, theme);
        }
        else {
            const axisToAdd = create(config, keyPath, undefined, theme);
            if (axisToAdd) {
                axesToAdd.push(axisToAdd);
            }
        }
    }
    chart.axes = axesToUpdate.concat(axesToAdd);
}
function provideDefaultChartType(options) {
    if (options.type) {
        return options;
    }
    // If chart type is not specified, try to infer it from the type of first series.
    const series = options.series && options.series[0];
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
        const seriesType = pathToSeriesTypeMap[path];
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
const enabledKey = 'enabled';
/**
 * If certain options were not provided by the user, use the defaults from the theme and the mapping.
 * All three objects are provided for the current path in the config tree, not necessarily top-level.
 */
function provideDefaultOptions(path, options, mapping, theme) {
    const isChartConfig = path.indexOf('.') < 0;
    const themeDefaults = theme && theme.getConfig(path);
    const defaults = mapping && mapping.meta && mapping.meta.defaults;
    const isExplicitlyDisabled = options.enabled === false; // by the user
    if (defaults || themeDefaults) {
        options = Object.create(options);
    }
    // Fill in the gaps for properties not configured by the user using theme provided values.
    for (const key in themeDefaults) {
        // The default values for these special chart configs always come from the mappings, not theme.
        if (isChartConfig && skipThemeKey(key)) {
            continue;
        }
        if (!(key in options)) {
            options[key] = themeDefaults[key];
        }
    }
    // Fill in the gaps for properties not configured by the user, nor theme using chart mappings.
    for (const key in defaults) {
        if ((!themeDefaults || !(key in themeDefaults) || skipThemeKey(key)) && !(key in options)) {
            options[key] = defaults[key];
        }
    }
    // Special handling for the 'enabled' property. For example:
    // title: { text: 'Quarterly Revenue' } // means title is enabled
    // legend: {} // means legend is enabled
    const hasEnabledKey = (themeDefaults && enabledKey in themeDefaults) ||
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
function groupSeriesByType(seriesOptions) {
    const indexMap = {
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
    const result = [];
    for (const s of seriesOptions) {
        const isColumnOrBar = s.type === 'column' || s.type === 'bar';
        const isStackedArea = s.type === 'area' && s.stacked === true;
        if (!isColumnOrBar && !isStackedArea) {
            // No need to use index for these cases.
            result.push([s]);
            continue;
        }
        const seriesType = s.type || 'line';
        if (seriesType === 'pie' || seriesType === 'treemap') {
            throw new Error(`AG Grid - Unexpected series type of: ${seriesType}`);
        }
        else if (indexMap[seriesType].length === 0) {
            // Add indexed array to result on first addition.
            result.push(indexMap[seriesType]);
        }
        indexMap[seriesType].push(s);
    }
    return result;
}
exports.groupSeriesByType = groupSeriesByType;
/**
 * Takes an array of bar or area series options objects and returns a single object with the combined area series options.
 */
function reduceSeries(series, enableBarSeriesSpecialCases) {
    let options = {};
    const arrayValueProperties = ['yKeys', 'fills', 'strokes', 'yNames', 'hideInChart', 'hideInLegend'];
    const stringValueProperties = ['yKey', 'fill', 'stroke', 'yName'];
    for (const s of series) {
        for (const property in s) {
            const arrayValueProperty = arrayValueProperties.indexOf(property) > -1;
            const stringValueProperty = stringValueProperties.indexOf(property) > -1;
            if (arrayValueProperty && s[property].length > 0) {
                options[property] = [...(options[property] || []), ...s[property]];
            }
            else if (stringValueProperty) {
                options[`${property}s`] = [...(options[`${property}s`] || []), s[property]];
            }
            else if (enableBarSeriesSpecialCases && property === 'showInLegend') {
                if (s[property] === false) {
                    options.hideInLegend = [...(options.hideInLegend || []), ...(s.yKey ? [s.yKey] : s.yKeys)];
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
    return options;
}
exports.reduceSeries = reduceSeries;
/**
 * Transforms provided series options array into an array containing series options which are compatible with standalone charts series options.
 */
function processSeriesOptions(seriesOptions) {
    const result = [];
    for (const series of groupSeriesByType(seriesOptions)) {
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
    return result;
}
exports.processSeriesOptions = processSeriesOptions;
//# sourceMappingURL=agChart.js.map