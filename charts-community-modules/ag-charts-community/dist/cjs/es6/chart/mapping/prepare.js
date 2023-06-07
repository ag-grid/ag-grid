"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prepareOptions = exports.noDataCloneMergeOptions = exports.isAgPolarChartOptions = exports.isAgHierarchyChartOptions = exports.isAgCartesianChartOptions = exports.optionsType = void 0;
const defaults_1 = require("./defaults");
const json_1 = require("../../util/json");
const transforms_1 = require("./transforms");
const themes_1 = require("./themes");
const prepareSeries_1 = require("./prepareSeries");
const logger_1 = require("../../util/logger");
const chartTypes_1 = require("../factory/chartTypes");
const chartAxesTypes_1 = require("../chartAxesTypes");
const seriesTypes_1 = require("../factory/seriesTypes");
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
        logger_1.Logger.warnOnce(`type '${specifiedType}' is deprecated, use a series type instead`);
        return true;
    }
    return chartTypes_1.CHART_TYPES.isCartesian(specifiedType);
}
exports.isAgCartesianChartOptions = isAgCartesianChartOptions;
function isAgHierarchyChartOptions(input) {
    const specifiedType = optionsType(input);
    if (specifiedType == null) {
        return false;
    }
    if (specifiedType === 'hierarchy') {
        logger_1.Logger.warnOnce(`type '${specifiedType}' is deprecated, use a series type instead`);
        return true;
    }
    return chartTypes_1.CHART_TYPES.isHierarchy(specifiedType);
}
exports.isAgHierarchyChartOptions = isAgHierarchyChartOptions;
function isAgPolarChartOptions(input) {
    const specifiedType = optionsType(input);
    if (specifiedType == null) {
        return false;
    }
    if (specifiedType === 'polar') {
        logger_1.Logger.warnOnce(`type '${specifiedType}' is deprecated, use a series type instead`);
        return true;
    }
    return chartTypes_1.CHART_TYPES.isPolar(specifiedType);
}
exports.isAgPolarChartOptions = isAgPolarChartOptions;
function isSeriesOptionType(input) {
    if (input == null) {
        return false;
    }
    return chartTypes_1.CHART_TYPES.has(input);
}
function isAxisOptionType(input) {
    if (input == null) {
        return false;
    }
    return chartAxesTypes_1.CHART_AXES_TYPES.has(input);
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
function prepareOptions(newOptions, fallbackOptions) {
    var _a, _b, _c, _d, _e, _f;
    let options = json_1.jsonMerge([fallbackOptions, newOptions], exports.noDataCloneMergeOptions);
    sanityCheckOptions(options);
    // Determine type and ensure it's explicit in the options config.
    const userSuppliedOptionsType = options.type;
    const type = optionsType(options);
    const globalTooltipPositionOptions = (_b = (_a = options.tooltip) === null || _a === void 0 ? void 0 : _a.position) !== null && _b !== void 0 ? _b : {};
    const checkSeriesType = (type) => {
        if (type != null && !(isSeriesOptionType(type) || seriesTypes_1.getSeriesDefaults(type))) {
            throw new Error(`AG Charts - unknown series type: ${type}; expected one of: ${chartTypes_1.CHART_TYPES.seriesTypes}`);
        }
    };
    checkSeriesType(type);
    for (const { type: seriesType } of (_c = options.series) !== null && _c !== void 0 ? _c : []) {
        if (seriesType == null)
            continue;
        checkSeriesType(seriesType);
    }
    options = Object.assign(Object.assign({}, options), { type });
    let defaultSeriesType = 'line';
    if (isAgCartesianChartOptions(options)) {
        defaultSeriesType = 'line';
    }
    else if (isAgHierarchyChartOptions(options)) {
        defaultSeriesType = 'treemap';
    }
    else if (isAgPolarChartOptions(options)) {
        defaultSeriesType = 'pie';
    }
    let defaultOverrides = {};
    const seriesDefaults = seriesTypes_1.getSeriesDefaults(type);
    if (seriesDefaults) {
        defaultOverrides = seriesDefaults;
    }
    else if (type === 'bar') {
        defaultOverrides = defaults_1.DEFAULT_BAR_CHART_OVERRIDES;
    }
    else if (type === 'scatter' || type === 'histogram') {
        defaultOverrides = defaults_1.DEFAULT_SCATTER_HISTOGRAM_CHART_OVERRIDES;
    }
    else if (isAgCartesianChartOptions(options)) {
        defaultOverrides = defaults_1.DEFAULT_CARTESIAN_CHART_OVERRIDES;
    }
    removeDisabledOptions(options);
    const { context, mergedOptions, axesThemes, seriesThemes } = prepareMainOptions(defaultOverrides, options);
    // Special cases where we have arrays of elements which need their own defaults.
    // Apply series themes before calling processSeriesOptions() as it reduces and renames some
    // properties, and in that case then cannot correctly have themes applied.
    mergedOptions.series = prepareSeries_1.processSeriesOptions(((_d = mergedOptions.series) !== null && _d !== void 0 ? _d : []).map((s) => {
        let type = defaultSeriesType;
        if (s.type) {
            type = s.type;
        }
        else if (isSeriesOptionType(userSuppliedOptionsType)) {
            type = userSuppliedOptionsType;
        }
        const mergedSeries = mergeSeriesOptions(s, type, seriesThemes, globalTooltipPositionOptions);
        if (type === 'pie') {
            preparePieOptions(seriesThemes.pie, s, mergedSeries);
        }
        return mergedSeries;
    })).map((s) => prepareSeries(context, s));
    const checkAxisType = (type) => {
        const isAxisType = isAxisOptionType(type);
        if (!isAxisType) {
            logger_1.Logger.warnOnce(`AG Charts - unknown axis type: ${type}; expected one of: ${chartAxesTypes_1.CHART_AXES_TYPES.axesTypes}, ignoring.`);
        }
        return isAxisType;
    };
    if (isAgCartesianChartOptions(mergedOptions)) {
        let validAxesTypes = true;
        for (const { type: axisType } of (_e = mergedOptions.axes) !== null && _e !== void 0 ? _e : []) {
            if (!checkAxisType(axisType)) {
                validAxesTypes = false;
            }
        }
        if (!validAxesTypes) {
            mergedOptions.axes = defaultOverrides.axes;
        }
        else {
            mergedOptions.axes = (_f = mergedOptions.axes) === null || _f === void 0 ? void 0 : _f.map((axis) => {
                var _a, _b;
                const axisType = axis.type;
                const axesTheme = json_1.jsonMerge([
                    axesThemes[axisType],
                    (_b = axesThemes[axisType][(_a = axis.position) !== null && _a !== void 0 ? _a : 'unknown']) !== null && _b !== void 0 ? _b : {},
                ]);
                return prepareAxis(axis, axesTheme);
            });
        }
        prepareLegendEnabledOption(options, mergedOptions);
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
            logger_1.Logger.warnOnce(`property [series.${oldProp}] is deprecated, please use [series.${newProp}] and multiple series instead.`);
        }
    });
}
function mergeSeriesOptions(series, type, seriesThemes, globalTooltipPositionOptions) {
    var _a, _b;
    const mergedTooltipPosition = json_1.jsonMerge([Object.assign({}, globalTooltipPositionOptions), (_a = series.tooltip) === null || _a === void 0 ? void 0 : _a.position], exports.noDataCloneMergeOptions);
    const mergedSeries = json_1.jsonMerge([
        (_b = seriesThemes[type]) !== null && _b !== void 0 ? _b : {},
        Object.assign(Object.assign({}, series), { type, tooltip: Object.assign(Object.assign({}, series.tooltip), { position: mergedTooltipPosition }) }),
    ], exports.noDataCloneMergeOptions);
    return mergedSeries;
}
function prepareMainOptions(defaultOverrides, options) {
    const { theme, cleanedTheme, axesThemes, seriesThemes } = prepareTheme(options);
    const context = { colourIndex: 0, palette: theme.palette };
    const mergedOptions = json_1.jsonMerge([defaultOverrides, cleanedTheme, options], exports.noDataCloneMergeOptions);
    return { context, mergedOptions, axesThemes, seriesThemes };
}
function prepareTheme(options) {
    var _a, _b;
    const theme = themes_1.getChartTheme(options.theme);
    const themeConfig = theme.config[(_a = optionsType(options)) !== null && _a !== void 0 ? _a : 'cartesian'];
    const seriesThemes = Object.entries(theme.config).reduce((result, [seriesType, { series }]) => {
        result[seriesType] = series === null || series === void 0 ? void 0 : series[seriesType];
        return result;
    }, {});
    return {
        theme,
        axesThemes: (_b = themeConfig['axes']) !== null && _b !== void 0 ? _b : {},
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
    var _a;
    const paletteOptions = {};
    const { palette: { fills, strokes }, } = context;
    const inputAny = input;
    let colourCount = countArrayElements((_a = inputAny['yKeys']) !== null && _a !== void 0 ? _a : []) || 1; // Defaults to 1 if no yKeys.
    switch (input.type) {
        case 'pie':
            colourCount = Math.max(fills.length, strokes.length);
        // eslint-disable-next-line no-fallthrough
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
    }
    context.colourIndex += colourCount;
    return paletteOptions;
}
function prepareAxis(axis, axisTheme) {
    // Remove redundant theme overload keys.
    const removeOptions = { top: json_1.DELETE, bottom: json_1.DELETE, left: json_1.DELETE, right: json_1.DELETE };
    // Special cross lines case where we have an array of cross line elements which need their own defaults.
    if (axis.crossLines) {
        if (!Array.isArray(axis.crossLines)) {
            logger_1.Logger.warn('axis[].crossLines should be an array.');
            axis.crossLines = [];
        }
        const { crossLines: crossLinesTheme } = axisTheme;
        axis.crossLines = axis.crossLines.map((crossLine) => json_1.jsonMerge([crossLinesTheme, crossLine]));
    }
    const cleanTheme = { crossLines: json_1.DELETE };
    return json_1.jsonMerge([axisTheme, cleanTheme, axis, removeOptions], exports.noDataCloneMergeOptions);
}
function removeDisabledOptions(options) {
    // Remove configurations from all option objects with a `false` value for the `enabled` property.
    json_1.jsonWalk(options, (_, visitingUserOpts) => {
        if (!('enabled' in visitingUserOpts))
            return;
        if (visitingUserOpts.enabled === false) {
            Object.entries(visitingUserOpts).forEach(([key]) => {
                if (key === 'enabled')
                    return;
                delete visitingUserOpts[key];
            });
        }
    }, { skip: ['data', 'theme'] });
}
function prepareLegendEnabledOption(options, mergedOptions) {
    var _a, _b, _c, _d;
    // Disable legend by default for single series cartesian charts
    if (((_a = options.legend) === null || _a === void 0 ? void 0 : _a.enabled) !== undefined || ((_b = mergedOptions.legend) === null || _b === void 0 ? void 0 : _b.enabled) !== undefined) {
        return;
    }
    (_c = mergedOptions.legend) !== null && _c !== void 0 ? _c : (mergedOptions.legend = {});
    if (((_d = options.series) !== null && _d !== void 0 ? _d : []).length > 1) {
        mergedOptions.legend.enabled = true;
        return;
    }
    mergedOptions.legend.enabled = false;
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
