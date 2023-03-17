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
import { DEFAULT_CARTESIAN_CHART_OVERRIDES, DEFAULT_BAR_CHART_OVERRIDES, DEFAULT_SCATTER_HISTOGRAM_CHART_OVERRIDES, } from './defaults';
import { jsonMerge, DELETE, jsonWalk } from '../../util/json';
import { applySeriesTransform } from './transforms';
import { getChartTheme } from './themes';
import { processSeriesOptions } from './prepareSeries';
import { Logger } from '../../util/logger';
export function optionsType(input) {
    var _a, _b, _c, _d;
    return (_d = (_a = input.type) !== null && _a !== void 0 ? _a : (_c = (_b = input.series) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.type) !== null && _d !== void 0 ? _d : 'line';
}
export function isAgCartesianChartOptions(input) {
    var specifiedType = optionsType(input);
    if (specifiedType == null) {
        return true;
    }
    if (specifiedType === 'cartesian') {
        Logger.warnOnce("type '" + specifiedType + "' is deprecated, use a series type instead");
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
export function isAgHierarchyChartOptions(input) {
    var specifiedType = optionsType(input);
    if (specifiedType == null) {
        return false;
    }
    if (specifiedType === 'hierarchy') {
        Logger.warnOnce("type '" + specifiedType + "' is deprecated, use a series type instead");
        return true;
    }
    return specifiedType === 'treemap';
}
export function isAgPolarChartOptions(input) {
    var specifiedType = optionsType(input);
    if (specifiedType == null) {
        return false;
    }
    if (specifiedType === 'polar') {
        Logger.warnOnce("type '" + specifiedType + "' is deprecated, use a series type instead");
        return true;
    }
    return specifiedType === 'pie';
}
var SERIES_OPTION_TYPES = ['line', 'bar', 'column', 'histogram', 'scatter', 'area', 'pie', 'treemap'];
function isSeriesOptionType(input) {
    if (input == null) {
        return false;
    }
    return SERIES_OPTION_TYPES.indexOf(input) >= 0;
}
function countArrayElements(input) {
    var e_1, _a;
    var count = 0;
    try {
        for (var input_1 = __values(input), input_1_1 = input_1.next(); !input_1_1.done; input_1_1 = input_1.next()) {
            var next = input_1_1.value;
            if (next instanceof Array) {
                count += countArrayElements(next);
            }
            if (next != null) {
                count++;
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (input_1_1 && !input_1_1.done && (_a = input_1.return)) _a.call(input_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return count;
}
function takeColours(context, colours, maxCount) {
    var result = [];
    for (var count = 0; count < maxCount; count++) {
        result.push(colours[(count + context.colourIndex) % colours.length]);
    }
    return result;
}
export var noDataCloneMergeOptions = {
    avoidDeepClone: ['data'],
};
export function prepareOptions(newOptions) {
    var e_2, _a;
    var _b, _c;
    var fallbackOptions = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        fallbackOptions[_i - 1] = arguments[_i];
    }
    var options = jsonMerge(__spread(fallbackOptions, [newOptions]), noDataCloneMergeOptions);
    sanityCheckOptions(options);
    // Determine type and ensure it's explicit in the options config.
    var userSuppliedOptionsType = options.type;
    var type = optionsType(options);
    var checkSeriesType = function (type) {
        if (type != null && !isSeriesOptionType(type)) {
            throw new Error("AG Charts - unknown series type: " + type + "; expected one of: " + SERIES_OPTION_TYPES.join(', '));
        }
    };
    checkSeriesType(type);
    try {
        for (var _d = __values((_b = options.series) !== null && _b !== void 0 ? _b : []), _e = _d.next(); !_e.done; _e = _d.next()) {
            var seriesType = _e.value.type;
            if (seriesType == null)
                continue;
            checkSeriesType(seriesType);
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (_e && !_e.done && (_a = _d.return)) _a.call(_d);
        }
        finally { if (e_2) throw e_2.error; }
    }
    options = __assign(__assign({}, options), { type: type });
    var defaultSeriesType = 'line';
    if (isAgCartesianChartOptions(options)) {
        defaultSeriesType = 'line';
    }
    else if (isAgHierarchyChartOptions(options)) {
        defaultSeriesType = 'treemap';
    }
    else if (isAgPolarChartOptions(options)) {
        defaultSeriesType = 'pie';
    }
    var defaultOverrides = {};
    if (type === 'bar') {
        defaultOverrides = DEFAULT_BAR_CHART_OVERRIDES;
    }
    else if (type === 'scatter' || type === 'histogram') {
        defaultOverrides = DEFAULT_SCATTER_HISTOGRAM_CHART_OVERRIDES;
    }
    else if (isAgCartesianChartOptions(options)) {
        defaultOverrides = DEFAULT_CARTESIAN_CHART_OVERRIDES;
    }
    var _f = prepareMainOptions(defaultOverrides, options), context = _f.context, mergedOptions = _f.mergedOptions, axesThemes = _f.axesThemes, seriesThemes = _f.seriesThemes;
    // Special cases where we have arrays of elements which need their own defaults.
    // Apply series themes before calling processSeriesOptions() as it reduces and renames some
    // properties, and in that case then cannot correctly have themes applied.
    mergedOptions.series = processSeriesOptions((mergedOptions.series || []).map(function (s) {
        var type = defaultSeriesType;
        if (s.type) {
            type = s.type;
        }
        else if (isSeriesOptionType(userSuppliedOptionsType)) {
            type = userSuppliedOptionsType;
        }
        var mergedSeries = jsonMerge([seriesThemes[type] || {}, __assign(__assign({}, s), { type: type })], noDataCloneMergeOptions);
        if (type === 'pie') {
            preparePieOptions(seriesThemes.pie, s, mergedSeries);
        }
        return mergedSeries;
    })).map(function (s) { return prepareSeries(context, s); });
    if (isAgCartesianChartOptions(mergedOptions)) {
        mergedOptions.axes = (_c = mergedOptions.axes) === null || _c === void 0 ? void 0 : _c.map(function (a) {
            var _a;
            var type = (_a = a.type) !== null && _a !== void 0 ? _a : 'number';
            var axis = __assign(__assign({}, a), { type: type });
            var axesTheme = jsonMerge([axesThemes[type], axesThemes[type][a.position || 'unknown'] || {}]);
            return prepareAxis(axis, axesTheme);
        });
    }
    prepareEnabledOptions(options, mergedOptions);
    return mergedOptions;
}
function sanityCheckOptions(options) {
    var deprecatedArrayProps = {
        yKeys: 'yKey',
        yNames: 'yName',
    };
    Object.entries(deprecatedArrayProps).forEach(function (_a) {
        var _b;
        var _c = __read(_a, 2), oldProp = _c[0], newProp = _c[1];
        if ((_b = options.series) === null || _b === void 0 ? void 0 : _b.some(function (s) { return s[oldProp] != null; })) {
            Logger.warnOnce("property [series." + oldProp + "] is deprecated, please use [series." + newProp + "] and multiple series instead.");
        }
    });
}
function prepareMainOptions(defaultOverrides, options) {
    var _a = prepareTheme(options), theme = _a.theme, cleanedTheme = _a.cleanedTheme, axesThemes = _a.axesThemes, seriesThemes = _a.seriesThemes;
    var context = { colourIndex: 0, palette: theme.palette };
    var mergedOptions = jsonMerge([defaultOverrides, cleanedTheme, options], noDataCloneMergeOptions);
    return { context: context, mergedOptions: mergedOptions, axesThemes: axesThemes, seriesThemes: seriesThemes };
}
function prepareTheme(options) {
    var theme = getChartTheme(options.theme);
    var themeConfig = theme.config[optionsType(options) || 'cartesian'];
    var seriesThemes = Object.entries(theme.config).reduce(function (result, _a) {
        var _b = __read(_a, 2), seriesType = _b[0], series = _b[1].series;
        result[seriesType] = series === null || series === void 0 ? void 0 : series[seriesType];
        return result;
    }, {});
    return {
        theme: theme,
        axesThemes: themeConfig['axes'] || {},
        seriesThemes: seriesThemes,
        cleanedTheme: jsonMerge([themeConfig, { axes: DELETE, series: DELETE }]),
    };
}
function prepareSeries(context, input) {
    var defaults = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        defaults[_i - 2] = arguments[_i];
    }
    var paletteOptions = calculateSeriesPalette(context, input);
    // Part of the options interface, but not directly consumed by the series implementations.
    var removeOptions = { stacked: DELETE };
    var mergedResult = jsonMerge(__spread(defaults, [paletteOptions, input, removeOptions]), noDataCloneMergeOptions);
    return applySeriesTransform(mergedResult);
}
function calculateSeriesPalette(context, input) {
    var paletteOptions = {};
    var _a = context.palette, fills = _a.fills, strokes = _a.strokes;
    var inputAny = input;
    var colourCount = countArrayElements(inputAny['yKeys'] || []) || 1; // Defaults to 1 if no yKeys.
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
    var removeOptions = { top: DELETE, bottom: DELETE, left: DELETE, right: DELETE };
    // Special cross lines case where we have an arrays of cross line elements which need their own defaults.
    if (axis.crossLines) {
        if (!Array.isArray(axis.crossLines)) {
            Logger.warn('axis[].crossLines should be an array.');
            axis.crossLines = [];
        }
        var crossLinesTheme_1 = axisTheme.crossLines;
        axis.crossLines = axis.crossLines.map(function (crossLine) { return jsonMerge([crossLinesTheme_1, crossLine]); });
    }
    var cleanTheme = { crossLines: DELETE };
    return jsonMerge([axisTheme, cleanTheme, axis, removeOptions], noDataCloneMergeOptions);
}
function prepareEnabledOptions(options, mergedOptions) {
    // Set `enabled: true` for all option objects where the user has provided values.
    jsonWalk(options, function (_, visitingUserOpts, visitingMergedOpts) {
        if (!visitingMergedOpts)
            return;
        var _enabledFromTheme = visitingMergedOpts._enabledFromTheme;
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
    jsonWalk(mergedOptions, function (_, visitingMergedOpts) {
        if (visitingMergedOpts._enabledFromTheme != null) {
            // Do not apply special handling, base enablement on theme.
            delete visitingMergedOpts._enabledFromTheme;
        }
    }, { skip: ['data', 'theme'] });
}
function preparePieOptions(pieSeriesTheme, seriesOptions, mergedSeries) {
    if (Array.isArray(seriesOptions.innerLabels)) {
        mergedSeries.innerLabels = seriesOptions.innerLabels.map(function (ln) {
            return jsonMerge([pieSeriesTheme.innerLabels, ln]);
        });
    }
    else {
        mergedSeries.innerLabels = DELETE;
    }
}
