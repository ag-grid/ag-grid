"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prepareOptions = exports.noDataCloneMergeOptions = exports.isAgPolarChartOptions = exports.isAgHierarchyChartOptions = exports.isAgCartesianChartOptions = exports.optionsType = void 0;
const defaults_1 = require("./defaults");
const json_1 = require("../../util/json");
const transforms_1 = require("./transforms");
const themes_1 = require("./themes");
const prepareSeries_1 = require("./prepareSeries");
const function_1 = require("../../util/function");
function optionsType(input) {
    var _a, _b, _c, _d;
    return (_d = (_a = input.type) !== null && _a !== void 0 ? _a : (_c = (_b = input.series) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.type) !== null && _d !== void 0 ? _d : 'line';
}
exports.optionsType = optionsType;
function isAgCartesianChartOptions(input) {
    const specifiedType = optionsType(input);
    if (specifiedType == null) {
        return true;
    }
    if (specifiedType === 'cartesian') {
        function_1.doOnce(() => console.warn(`AG Charts - type '${specifiedType}' is deprecated, use a series type instead`), `factory options type ${specifiedType}`);
        return true;
    }
    switch (specifiedType) {
        case 'area':
        case 'bar':
        case 'column':
        case 'histogram':
        case 'line':
        case 'scatter':
            return true;
        default:
            return false;
    }
}
exports.isAgCartesianChartOptions = isAgCartesianChartOptions;
function isAgHierarchyChartOptions(input) {
    const specifiedType = optionsType(input);
    if (specifiedType == null) {
        return false;
    }
    if (specifiedType === 'hierarchy') {
        function_1.doOnce(() => console.warn(`AG Charts - type '${specifiedType}' is deprecated, use a series type instead`), `factory options type ${specifiedType}`);
        return true;
    }
    switch (specifiedType) {
        case 'treemap':
            return true;
        default:
            return false;
    }
}
exports.isAgHierarchyChartOptions = isAgHierarchyChartOptions;
function isAgPolarChartOptions(input) {
    const specifiedType = optionsType(input);
    if (specifiedType == null) {
        return false;
    }
    if (specifiedType === 'polar') {
        function_1.doOnce(() => console.warn(`AG Charts - type '${specifiedType}' is deprecated, use a series type instead`), `factory options type ${specifiedType}`);
        return true;
    }
    switch (specifiedType) {
        case 'pie':
            return true;
        default:
            return false;
    }
}
exports.isAgPolarChartOptions = isAgPolarChartOptions;
function isSeriesOptionType(input) {
    if (input == null) {
        return false;
    }
    return ['line', 'bar', 'column', 'histogram', 'scatter', 'area', 'pie', 'treemap'].indexOf(input) >= 0;
}
function countArrayElements(input) {
    let count = 0;
    for (const next of input) {
        if (next instanceof Array) {
            count += countArrayElements(next);
        }
        if (next != null) {
            count++;
        }
    }
    return count;
}
function takeColours(context, colours, maxCount) {
    const result = [];
    for (let count = 0; count < maxCount; count++) {
        result.push(colours[(count + context.colourIndex) % colours.length]);
    }
    return result;
}
exports.noDataCloneMergeOptions = {
    avoidDeepClone: ['data'],
};
function prepareOptions(newOptions, ...fallbackOptions) {
    var _a;
    let options = json_1.jsonMerge([...fallbackOptions, newOptions], exports.noDataCloneMergeOptions);
    sanityCheckOptions(options);
    // Determine type and ensure it's explicit in the options config.
    const userSuppliedOptionsType = options.type;
    const type = optionsType(options);
    if (type != null && !isSeriesOptionType(type)) {
        throw new Error(`AG Charts - unknown series type: ${type}`);
    }
    options = Object.assign(Object.assign({}, options), { type });
    const defaultSeriesType = isAgCartesianChartOptions(options)
        ? 'line'
        : isAgHierarchyChartOptions(options)
            ? 'treemap'
            : isAgPolarChartOptions(options)
                ? 'pie'
                : 'line';
    const defaultOverrides = type === 'bar'
        ? defaults_1.DEFAULT_BAR_CHART_OVERRIDES
        : type === 'scatter'
            ? defaults_1.DEFAULT_SCATTER_HISTOGRAM_CHART_OVERRIDES
            : type === 'histogram'
                ? defaults_1.DEFAULT_SCATTER_HISTOGRAM_CHART_OVERRIDES
                : isAgCartesianChartOptions(options)
                    ? defaults_1.DEFAULT_CARTESIAN_CHART_OVERRIDES
                    : {};
    const { context, mergedOptions, axesThemes, seriesThemes } = prepareMainOptions(defaultOverrides, options);
    // Special cases where we have arrays of elements which need their own defaults.
    // Apply series themes before calling processSeriesOptions() as it reduces and renames some
    // properties, and in that case then cannot correctly have themes applied.
    mergedOptions.series = prepareSeries_1.processSeriesOptions((mergedOptions.series || []).map((s) => {
        const type = s.type
            ? s.type
            : isSeriesOptionType(userSuppliedOptionsType)
                ? userSuppliedOptionsType
                : defaultSeriesType;
        const mergedSeries = json_1.jsonMerge([seriesThemes[type] || {}, Object.assign(Object.assign({}, s), { type })], exports.noDataCloneMergeOptions);
        if (type === 'pie') {
            preparePieOptions(seriesThemes.pie, s, mergedSeries);
        }
        return mergedSeries;
    })).map((s) => prepareSeries(context, s));
    if (isAgCartesianChartOptions(mergedOptions)) {
        mergedOptions.axes = (_a = mergedOptions.axes) === null || _a === void 0 ? void 0 : _a.map((a) => {
            var _a;
            const type = (_a = a.type) !== null && _a !== void 0 ? _a : 'number';
            const axis = Object.assign(Object.assign({}, a), { type });
            const axesTheme = json_1.jsonMerge([axesThemes[type], axesThemes[type][a.position || 'unknown'] || {}]);
            return prepareAxis(axis, axesTheme);
        });
    }
    prepareEnabledOptions(options, mergedOptions);
    return mergedOptions;
}
exports.prepareOptions = prepareOptions;
function sanityCheckOptions(options) {
    const deprecatedArrayProps = {
        yKeys: 'yKey',
        yNames: 'yName',
    };
    Object.entries(deprecatedArrayProps).forEach(([oldProp, newProp]) => {
        var _a;
        if ((_a = options.series) === null || _a === void 0 ? void 0 : _a.some((s) => s[oldProp] != null)) {
            function_1.doOnce(() => console.warn(`AG Charts - Property [series.${oldProp}] is deprecated, please use [series.${newProp}] and multiple series instead.`), `deprecated series.${oldProp} array`);
        }
    });
}
function prepareMainOptions(defaultOverrides, options) {
    const { theme, cleanedTheme, axesThemes, seriesThemes } = prepareTheme(options);
    const context = { colourIndex: 0, palette: theme.palette };
    const mergedOptions = json_1.jsonMerge([defaultOverrides, cleanedTheme, options], exports.noDataCloneMergeOptions);
    return { context, mergedOptions, axesThemes, seriesThemes };
}
function prepareTheme(options) {
    const theme = themes_1.getChartTheme(options.theme);
    const themeConfig = theme.config[optionsType(options) || 'cartesian'];
    const seriesThemes = Object.entries(theme.config).reduce((result, [seriesType, { series }]) => {
        result[seriesType] = series === null || series === void 0 ? void 0 : series[seriesType];
        return result;
    }, {});
    return {
        theme,
        axesThemes: themeConfig['axes'] || {},
        seriesThemes: seriesThemes,
        cleanedTheme: json_1.jsonMerge([themeConfig, { axes: json_1.DELETE, series: json_1.DELETE }]),
    };
}
function prepareSeries(context, input, ...defaults) {
    const paletteOptions = calculateSeriesPalette(context, input);
    // Part of the options interface, but not directly consumed by the series implementations.
    const removeOptions = { stacked: json_1.DELETE };
    const mergedResult = json_1.jsonMerge([...defaults, paletteOptions, input, removeOptions], exports.noDataCloneMergeOptions);
    return transforms_1.applySeriesTransform(mergedResult);
}
function calculateSeriesPalette(context, input) {
    const paletteOptions = {};
    const { palette: { fills, strokes }, } = context;
    const inputAny = input;
    let colourCount = countArrayElements(inputAny['yKeys'] || []) || 1; // Defaults to 1 if no yKeys.
    switch (input.type) {
        case 'pie':
            colourCount = Math.max(fills.length, strokes.length);
        // fall-through - only colourCount varies for `pie`.
        case 'area':
        case 'bar':
        case 'column':
            paletteOptions.fills = takeColours(context, fills, colourCount);
            paletteOptions.strokes = takeColours(context, strokes, colourCount);
            break;
        case 'histogram':
            paletteOptions.fill = takeColours(context, fills, 1)[0];
            paletteOptions.stroke = takeColours(context, strokes, 1)[0];
            break;
        case 'scatter':
            paletteOptions.marker = {
                stroke: takeColours(context, strokes, 1)[0],
                fill: takeColours(context, fills, 1)[0],
            };
            break;
        case 'line':
            paletteOptions.stroke = takeColours(context, fills, 1)[0];
            paletteOptions.marker = {
                stroke: takeColours(context, strokes, 1)[0],
                fill: takeColours(context, fills, 1)[0],
            };
            break;
        case 'treemap':
            break;
        default:
            throw new Error('AG Charts - unknown series type: ' + input.type);
    }
    context.colourIndex += colourCount;
    return paletteOptions;
}
function prepareAxis(axis, axisTheme) {
    // Remove redundant theme overload keys.
    const removeOptions = { top: json_1.DELETE, bottom: json_1.DELETE, left: json_1.DELETE, right: json_1.DELETE };
    // Special cross lines case where we have an arrays of cross line elements which need their own defaults.
    if (axis.crossLines) {
        if (!Array.isArray(axis.crossLines)) {
            console.warn('AG Charts - axis[].crossLines should be an array.');
            axis.crossLines = [];
        }
        const { crossLines: crossLinesTheme } = axisTheme;
        axis.crossLines = axis.crossLines.map((crossLine) => json_1.jsonMerge([crossLinesTheme, crossLine]));
    }
    const cleanTheme = { crossLines: json_1.DELETE };
    return json_1.jsonMerge([axisTheme, cleanTheme, axis, removeOptions], exports.noDataCloneMergeOptions);
}
function prepareEnabledOptions(options, mergedOptions) {
    // Set `enabled: true` for all option objects where the user has provided values.
    json_1.jsonWalk(options, (_, visitingUserOpts, visitingMergedOpts) => {
        if (!visitingMergedOpts)
            return;
        const { _enabledFromTheme } = visitingMergedOpts;
        if (_enabledFromTheme != null) {
            // Do not apply special handling, base enablement on theme.
            delete visitingMergedOpts._enabledFromTheme;
        }
        if (!('enabled' in visitingMergedOpts))
            return;
        if (_enabledFromTheme)
            return;
        if (visitingUserOpts.enabled == null) {
            visitingMergedOpts.enabled = true;
        }
    }, { skip: ['data', 'theme'] }, mergedOptions);
    // Cleanup any special properties.
    json_1.jsonWalk(mergedOptions, (_, visitingMergedOpts) => {
        if (visitingMergedOpts._enabledFromTheme != null) {
            // Do not apply special handling, base enablement on theme.
            delete visitingMergedOpts._enabledFromTheme;
        }
    }, { skip: ['data', 'theme'] });
}
function preparePieOptions(pieSeriesTheme, seriesOptions, mergedSeries) {
    if (Array.isArray(seriesOptions.innerLabels)) {
        mergedSeries.innerLabels = seriesOptions.innerLabels.map((ln) => {
            return json_1.jsonMerge([pieSeriesTheme.innerLabels, ln]);
        });
    }
    else {
        mergedSeries.innerLabels = json_1.DELETE;
    }
}
