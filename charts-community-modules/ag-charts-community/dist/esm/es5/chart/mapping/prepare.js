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
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
import { DEFAULT_CARTESIAN_CHART_OVERRIDES, DEFAULT_BAR_CHART_OVERRIDES, DEFAULT_SCATTER_HISTOGRAM_CHART_OVERRIDES, } from './defaults';
import { jsonMerge, DELETE, jsonWalk } from '../../util/json';
import { applySeriesTransform } from './transforms';
import { getChartTheme } from './themes';
import { processSeriesOptions } from './prepareSeries';
import { Logger } from '../../util/logger';
import { CHART_TYPES } from '../factory/chartTypes';
import { CHART_AXES_TYPES } from '../chartAxesTypes';
import { getSeriesDefaults } from '../factory/seriesTypes';
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
    return CHART_TYPES.isCartesian(specifiedType);
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
    return CHART_TYPES.isHierarchy(specifiedType);
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
    return CHART_TYPES.isPolar(specifiedType);
}
function isSeriesOptionType(input) {
    if (input == null) {
        return false;
    }
    return CHART_TYPES.has(input);
}
function isAxisOptionType(input) {
    if (input == null) {
        return false;
    }
    return CHART_AXES_TYPES.has(input);
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
export function prepareOptions(newOptions, fallbackOptions) {
    var e_2, _a, e_3, _b;
    var _c, _d, _e, _f, _g, _h;
    var options = jsonMerge([fallbackOptions, newOptions], noDataCloneMergeOptions);
    sanityCheckOptions(options);
    // Determine type and ensure it's explicit in the options config.
    var userSuppliedOptionsType = options.type;
    var type = optionsType(options);
    var globalTooltipPositionOptions = (_d = (_c = options.tooltip) === null || _c === void 0 ? void 0 : _c.position) !== null && _d !== void 0 ? _d : {};
    var checkSeriesType = function (type) {
        if (type != null && !(isSeriesOptionType(type) || getSeriesDefaults(type))) {
            throw new Error("AG Charts - unknown series type: " + type + "; expected one of: " + CHART_TYPES.seriesTypes);
        }
    };
    checkSeriesType(type);
    try {
        for (var _j = __values((_e = options.series) !== null && _e !== void 0 ? _e : []), _k = _j.next(); !_k.done; _k = _j.next()) {
            var seriesType = _k.value.type;
            if (seriesType == null)
                continue;
            checkSeriesType(seriesType);
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (_k && !_k.done && (_a = _j.return)) _a.call(_j);
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
    var seriesDefaults = getSeriesDefaults(type);
    if (seriesDefaults) {
        defaultOverrides = seriesDefaults;
    }
    else if (type === 'bar') {
        defaultOverrides = DEFAULT_BAR_CHART_OVERRIDES;
    }
    else if (type === 'scatter' || type === 'histogram') {
        defaultOverrides = DEFAULT_SCATTER_HISTOGRAM_CHART_OVERRIDES;
    }
    else if (isAgCartesianChartOptions(options)) {
        defaultOverrides = DEFAULT_CARTESIAN_CHART_OVERRIDES;
    }
    removeDisabledOptions(options);
    var _l = prepareMainOptions(defaultOverrides, options), context = _l.context, mergedOptions = _l.mergedOptions, axesThemes = _l.axesThemes, seriesThemes = _l.seriesThemes;
    // Special cases where we have arrays of elements which need their own defaults.
    // Apply series themes before calling processSeriesOptions() as it reduces and renames some
    // properties, and in that case then cannot correctly have themes applied.
    mergedOptions.series = processSeriesOptions(((_f = mergedOptions.series) !== null && _f !== void 0 ? _f : []).map(function (s) {
        var type = defaultSeriesType;
        if (s.type) {
            type = s.type;
        }
        else if (isSeriesOptionType(userSuppliedOptionsType)) {
            type = userSuppliedOptionsType;
        }
        var mergedSeries = mergeSeriesOptions(s, type, seriesThemes, globalTooltipPositionOptions);
        if (type === 'pie') {
            preparePieOptions(seriesThemes.pie, s, mergedSeries);
        }
        return mergedSeries;
    })).map(function (s) { return prepareSeries(context, s); });
    var checkAxisType = function (type) {
        var isAxisType = isAxisOptionType(type);
        if (!isAxisType) {
            Logger.warnOnce("AG Charts - unknown axis type: " + type + "; expected one of: " + CHART_AXES_TYPES.axesTypes + ", ignoring.");
        }
        return isAxisType;
    };
    if (isAgCartesianChartOptions(mergedOptions)) {
        var validAxesTypes = true;
        try {
            for (var _m = __values((_g = mergedOptions.axes) !== null && _g !== void 0 ? _g : []), _o = _m.next(); !_o.done; _o = _m.next()) {
                var axisType = _o.value.type;
                if (!checkAxisType(axisType)) {
                    validAxesTypes = false;
                }
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_o && !_o.done && (_b = _m.return)) _b.call(_m);
            }
            finally { if (e_3) throw e_3.error; }
        }
        if (!validAxesTypes) {
            mergedOptions.axes = defaultOverrides.axes;
        }
        else {
            mergedOptions.axes = (_h = mergedOptions.axes) === null || _h === void 0 ? void 0 : _h.map(function (axis) {
                var _a, _b;
                var axisType = axis.type;
                var axesTheme = jsonMerge([
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
function mergeSeriesOptions(series, type, seriesThemes, globalTooltipPositionOptions) {
    var _a, _b;
    var mergedTooltipPosition = jsonMerge([__assign({}, globalTooltipPositionOptions), (_a = series.tooltip) === null || _a === void 0 ? void 0 : _a.position], noDataCloneMergeOptions);
    var mergedSeries = jsonMerge([
        (_b = seriesThemes[type]) !== null && _b !== void 0 ? _b : {},
        __assign(__assign({}, series), { type: type, tooltip: __assign(__assign({}, series.tooltip), { position: mergedTooltipPosition }) }),
    ], noDataCloneMergeOptions);
    return mergedSeries;
}
function prepareMainOptions(defaultOverrides, options) {
    var _a = prepareTheme(options), theme = _a.theme, cleanedTheme = _a.cleanedTheme, axesThemes = _a.axesThemes, seriesThemes = _a.seriesThemes;
    var context = { colourIndex: 0, palette: theme.palette };
    var mergedOptions = jsonMerge([defaultOverrides, cleanedTheme, options], noDataCloneMergeOptions);
    return { context: context, mergedOptions: mergedOptions, axesThemes: axesThemes, seriesThemes: seriesThemes };
}
function prepareTheme(options) {
    var _a, _b;
    var theme = getChartTheme(options.theme);
    var themeConfig = theme.config[(_a = optionsType(options)) !== null && _a !== void 0 ? _a : 'cartesian'];
    var seriesThemes = Object.entries(theme.config).reduce(function (result, _a) {
        var _b = __read(_a, 2), seriesType = _b[0], series = _b[1].series;
        result[seriesType] = series === null || series === void 0 ? void 0 : series[seriesType];
        return result;
    }, {});
    return {
        theme: theme,
        axesThemes: (_b = themeConfig['axes']) !== null && _b !== void 0 ? _b : {},
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
    var mergedResult = jsonMerge(__spreadArray(__spreadArray([], __read(defaults)), [paletteOptions, input, removeOptions]), noDataCloneMergeOptions);
    return applySeriesTransform(mergedResult);
}
function calculateSeriesPalette(context, input) {
    var _a;
    var paletteOptions = {};
    var _b = context.palette, fills = _b.fills, strokes = _b.strokes;
    var inputAny = input;
    var colourCount = countArrayElements((_a = inputAny['yKeys']) !== null && _a !== void 0 ? _a : []) || 1; // Defaults to 1 if no yKeys.
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
    var removeOptions = { top: DELETE, bottom: DELETE, left: DELETE, right: DELETE };
    // Special cross lines case where we have an array of cross line elements which need their own defaults.
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
function removeDisabledOptions(options) {
    // Remove configurations from all option objects with a `false` value for the `enabled` property.
    jsonWalk(options, function (_, visitingUserOpts) {
        if (!('enabled' in visitingUserOpts))
            return;
        if (visitingUserOpts.enabled === false) {
            Object.entries(visitingUserOpts).forEach(function (_a) {
                var _b = __read(_a, 1), key = _b[0];
                if (key === 'enabled')
                    return;
                delete visitingUserOpts[key];
            });
        }
    }, { skip: ['data', 'theme'] });
}
function prepareLegendEnabledOption(options, mergedOptions) {
    var _a, _b, _c;
    // Disable legend by default for single series cartesian charts
    if (((_a = options.legend) === null || _a === void 0 ? void 0 : _a.enabled) !== undefined || ((_b = mergedOptions.legend) === null || _b === void 0 ? void 0 : _b.enabled) !== undefined) {
        return;
    }
    if (((_c = options.series) !== null && _c !== void 0 ? _c : []).length > 1) {
        mergedOptions.legend.enabled = true;
        return;
    }
    mergedOptions.legend.enabled = false;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlcGFyZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jaGFydC9tYXBwaW5nL3ByZXBhcmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQVNBLE9BQU8sRUFFSCxpQ0FBaUMsRUFDakMsMkJBQTJCLEVBQzNCLHlDQUF5QyxHQUM1QyxNQUFNLFlBQVksQ0FBQztBQUNwQixPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQW9CLE1BQU0saUJBQWlCLENBQUM7QUFDaEYsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sY0FBYyxDQUFDO0FBQ3BELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFDekMsT0FBTyxFQUFFLG9CQUFvQixFQUFpQixNQUFNLGlCQUFpQixDQUFDO0FBQ3RFLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUMzQyxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDcEQsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFDckQsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFJM0QsTUFBTSxVQUFVLFdBQVcsQ0FBQyxLQUczQjs7SUFDRyxPQUFPLE1BQUEsTUFBQSxLQUFLLENBQUMsSUFBSSxtQ0FBSSxNQUFBLE1BQUEsS0FBSyxDQUFDLE1BQU0sMENBQUcsQ0FBQyxDQUFDLDBDQUFFLElBQUksbUNBQUksTUFBTSxDQUFDO0FBQzNELENBQUM7QUFFRCxNQUFNLFVBQVUseUJBQXlCLENBQUMsS0FBcUI7SUFDM0QsSUFBTSxhQUFhLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3pDLElBQUksYUFBYSxJQUFJLElBQUksRUFBRTtRQUN2QixPQUFPLElBQUksQ0FBQztLQUNm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