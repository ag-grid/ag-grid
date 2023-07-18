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
Object.defineProperty(exports, "__esModule", { value: true });
exports.prepareOptions = exports.noDataCloneMergeOptions = exports.isAgPolarChartOptions = exports.isAgHierarchyChartOptions = exports.isAgCartesianChartOptions = exports.optionsType = void 0;
var defaults_1 = require("./defaults");
var json_1 = require("../../util/json");
var themes_1 = require("./themes");
var prepareSeries_1 = require("./prepareSeries");
var logger_1 = require("../../util/logger");
var axisTypes_1 = require("../factory/axisTypes");
var chartTypes_1 = require("../factory/chartTypes");
var seriesTypes_1 = require("../factory/seriesTypes");
function optionsType(input) {
    var _a, _b, _c, _d;
    return (_d = (_a = input.type) !== null && _a !== void 0 ? _a : (_c = (_b = input.series) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.type) !== null && _d !== void 0 ? _d : 'line';
}
exports.optionsType = optionsType;
function isAgCartesianChartOptions(input) {
    var specifiedType = optionsType(input);
    if (specifiedType == null) {
        return true;
    }
    if (specifiedType === 'cartesian') {
        logger_1.Logger.warnOnce("type '" + specifiedType + "' is deprecated, use a series type instead");
        return true;
    }
    return chartTypes_1.CHART_TYPES.isCartesian(specifiedType);
}
exports.isAgCartesianChartOptions = isAgCartesianChartOptions;
function isAgHierarchyChartOptions(input) {
    var specifiedType = optionsType(input);
    if (specifiedType == null) {
        return false;
    }
    if (specifiedType === 'hierarchy') {
        logger_1.Logger.warnOnce("type '" + specifiedType + "' is deprecated, use a series type instead");
        return true;
    }
    return chartTypes_1.CHART_TYPES.isHierarchy(specifiedType);
}
exports.isAgHierarchyChartOptions = isAgHierarchyChartOptions;
function isAgPolarChartOptions(input) {
    var specifiedType = optionsType(input);
    if (specifiedType == null) {
        return false;
    }
    if (specifiedType === 'polar') {
        logger_1.Logger.warnOnce("type '" + specifiedType + "' is deprecated, use a series type instead");
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
    return axisTypes_1.AXIS_TYPES.has(input);
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
exports.noDataCloneMergeOptions = {
    avoidDeepClone: ['data'],
};
function prepareOptions(newOptions, fallbackOptions) {
    var e_2, _a, e_3, _b;
    var _c, _d, _e, _f, _g, _h;
    var options = json_1.jsonMerge([fallbackOptions, newOptions], exports.noDataCloneMergeOptions);
    sanityCheckOptions(options);
    // Determine type and ensure it's explicit in the options config.
    var userSuppliedOptionsType = options.type;
    var type = optionsType(options);
    var globalTooltipPositionOptions = (_d = (_c = options.tooltip) === null || _c === void 0 ? void 0 : _c.position) !== null && _d !== void 0 ? _d : {};
    var checkSeriesType = function (type) {
        if (type != null && !(isSeriesOptionType(type) || seriesTypes_1.getSeriesDefaults(type))) {
            throw new Error("AG Charts - unknown series type: " + type + "; expected one of: " + chartTypes_1.CHART_TYPES.seriesTypes);
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
    var seriesDefaults = seriesTypes_1.getSeriesDefaults(type);
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
    var _l = prepareMainOptions(defaultOverrides, options), context = _l.context, mergedOptions = _l.mergedOptions, axesThemes = _l.axesThemes, seriesThemes = _l.seriesThemes;
    // Special cases where we have arrays of elements which need their own defaults.
    // Apply series themes before calling processSeriesOptions() as it reduces and renames some
    // properties, and in that case then cannot correctly have themes applied.
    mergedOptions.series = prepareSeries_1.processSeriesOptions(mergedOptions, ((_f = mergedOptions.series) !== null && _f !== void 0 ? _f : []).map(function (s) {
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
            logger_1.Logger.warnOnce("AG Charts - unknown axis type: " + type + "; expected one of: " + axisTypes_1.AXIS_TYPES.axesTypes + ", ignoring.");
        }
        return isAxisType;
    };
    if ('axes' in mergedOptions) {
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
                var axesTheme = json_1.jsonMerge([
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
    var deprecatedArrayProps = {
        yKeys: 'yKey',
        yNames: 'yName',
    };
    Object.entries(deprecatedArrayProps).forEach(function (_a) {
        var _b;
        var _c = __read(_a, 2), oldProp = _c[0], newProp = _c[1];
        if ((_b = options.series) === null || _b === void 0 ? void 0 : _b.some(function (s) { return s[oldProp] != null; })) {
            logger_1.Logger.warnOnce("property [series." + oldProp + "] is deprecated, please use [series." + newProp + "] and multiple series instead.");
        }
    });
}
function mergeSeriesOptions(series, type, seriesThemes, globalTooltipPositionOptions) {
    var _a, _b;
    var mergedTooltipPosition = json_1.jsonMerge([__assign({}, globalTooltipPositionOptions), (_a = series.tooltip) === null || _a === void 0 ? void 0 : _a.position], exports.noDataCloneMergeOptions);
    var mergedSeries = json_1.jsonMerge([
        (_b = seriesThemes[type]) !== null && _b !== void 0 ? _b : {},
        __assign(__assign({}, series), { type: type, tooltip: __assign(__assign({}, series.tooltip), { position: mergedTooltipPosition }) }),
    ], exports.noDataCloneMergeOptions);
    return mergedSeries;
}
function prepareMainOptions(defaultOverrides, options) {
    var _a = prepareTheme(options), theme = _a.theme, cleanedTheme = _a.cleanedTheme, axesThemes = _a.axesThemes, seriesThemes = _a.seriesThemes;
    var context = { colourIndex: 0, palette: theme.palette };
    var mergedOptions = json_1.jsonMerge([defaultOverrides, cleanedTheme, options], exports.noDataCloneMergeOptions);
    return { context: context, mergedOptions: mergedOptions, axesThemes: axesThemes, seriesThemes: seriesThemes };
}
function prepareTheme(options) {
    var _a, _b;
    var theme = themes_1.getChartTheme(options.theme);
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
        cleanedTheme: json_1.jsonMerge([themeConfig, { axes: json_1.DELETE, series: json_1.DELETE }]),
    };
}
function prepareSeries(context, input) {
    var defaults = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        defaults[_i - 2] = arguments[_i];
    }
    var paletteOptions = calculateSeriesPalette(context, input);
    // Part of the options interface, but not directly consumed by the series implementations.
    var removeOptions = { stacked: json_1.DELETE, grouped: json_1.DELETE };
    return json_1.jsonMerge(__spreadArray(__spreadArray([], __read(defaults)), [paletteOptions, input, removeOptions]), exports.noDataCloneMergeOptions);
}
seriesTypes_1.addSeriesPaletteFactory('pie', function (_a) {
    var takeColors = _a.takeColors, colorsCount = _a.colorsCount;
    return takeColors(colorsCount);
});
var singleSeriesPaletteFactory = function (_a) {
    var takeColors = _a.takeColors;
    var _b = takeColors(1), _c = __read(_b.fills, 1), fill = _c[0], _d = __read(_b.strokes, 1), stroke = _d[0];
    return { fill: fill, stroke: stroke };
};
seriesTypes_1.addSeriesPaletteFactory('area', singleSeriesPaletteFactory);
seriesTypes_1.addSeriesPaletteFactory('bar', singleSeriesPaletteFactory);
seriesTypes_1.addSeriesPaletteFactory('column', singleSeriesPaletteFactory);
seriesTypes_1.addSeriesPaletteFactory('histogram', singleSeriesPaletteFactory);
seriesTypes_1.addSeriesPaletteFactory('scatter', function (params) {
    var _a = singleSeriesPaletteFactory(params), fill = _a.fill, stroke = _a.stroke;
    return { marker: { fill: fill, stroke: stroke } };
});
seriesTypes_1.addSeriesPaletteFactory('line', function (params) {
    var _a = singleSeriesPaletteFactory(params), fill = _a.fill, stroke = _a.stroke;
    return {
        stroke: fill,
        marker: { fill: fill, stroke: stroke },
    };
});
function calculateSeriesPalette(context, input) {
    var _a;
    var paletteFactory = seriesTypes_1.getSeriesPaletteFactory(input.type);
    if (!paletteFactory) {
        return {};
    }
    var _b = context.palette, fills = _b.fills, strokes = _b.strokes;
    var inputAny = input;
    var seriesCount = countArrayElements((_a = inputAny['yKeys']) !== null && _a !== void 0 ? _a : []) || 1; // Defaults to 1 if no yKeys.
    var colorsCount = Math.max(fills.length, strokes.length);
    return paletteFactory({
        seriesCount: seriesCount,
        colorsCount: colorsCount,
        takeColors: function (count) {
            var colors = {
                fills: takeColours(context, fills, count),
                strokes: takeColours(context, strokes, count),
            };
            context.colourIndex += count;
            return colors;
        },
    });
}
function prepareAxis(axis, axisTheme) {
    // Remove redundant theme overload keys.
    var removeOptions = { top: json_1.DELETE, bottom: json_1.DELETE, left: json_1.DELETE, right: json_1.DELETE };
    // Special cross lines case where we have an array of cross line elements which need their own defaults.
    if (axis.crossLines) {
        if (!Array.isArray(axis.crossLines)) {
            logger_1.Logger.warn('axis[].crossLines should be an array.');
            axis.crossLines = [];
        }
        var crossLinesTheme_1 = axisTheme.crossLines;
        axis.crossLines = axis.crossLines.map(function (crossLine) { return json_1.jsonMerge([crossLinesTheme_1, crossLine]); });
    }
    var cleanTheme = { crossLines: json_1.DELETE };
    return json_1.jsonMerge([axisTheme, cleanTheme, axis, removeOptions], exports.noDataCloneMergeOptions);
}
function removeDisabledOptions(options) {
    // Remove configurations from all option objects with a `false` value for the `enabled` property.
    json_1.jsonWalk(options, function (_, visitingUserOpts) {
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
    json_1.jsonWalk(options, function (_, visitingUserOpts, visitingMergedOpts) {
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
    json_1.jsonWalk(mergedOptions, function (_, visitingMergedOpts) {
        if (visitingMergedOpts._enabledFromTheme != null) {
            // Do not apply special handling, base enablement on theme.
            delete visitingMergedOpts._enabledFromTheme;
        }
    }, { skip: ['data', 'theme'] });
}
function preparePieOptions(pieSeriesTheme, seriesOptions, mergedSeries) {
    if (Array.isArray(seriesOptions.innerLabels)) {
        mergedSeries.innerLabels = seriesOptions.innerLabels.map(function (ln) {
            return json_1.jsonMerge([pieSeriesTheme.innerLabels, ln]);
        });
    }
    else {
        mergedSeries.innerLabels = json_1.DELETE;
    }
}
//# sourceMappingURL=prepare.js.map