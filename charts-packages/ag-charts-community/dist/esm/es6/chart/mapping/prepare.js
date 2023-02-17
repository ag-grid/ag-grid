import { DEFAULT_CARTESIAN_CHART_OVERRIDES, DEFAULT_BAR_CHART_OVERRIDES, DEFAULT_SCATTER_HISTOGRAM_CHART_OVERRIDES, } from './defaults';
import { jsonMerge, DELETE, jsonWalk } from '../../util/json';
import { applySeriesTransform } from './transforms';
import { getChartTheme } from './themes';
import { processSeriesOptions } from './prepareSeries';
import { doOnce } from '../../util/function';
export function optionsType(input) {
    var _a, _b, _c, _d;
    return (_d = (_a = input.type) !== null && _a !== void 0 ? _a : (_c = (_b = input.series) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.type) !== null && _d !== void 0 ? _d : 'line';
}
export function isAgCartesianChartOptions(input) {
    const specifiedType = optionsType(input);
    if (specifiedType == null) {
        return true;
    }
    if (specifiedType === 'cartesian') {
        doOnce(() => console.warn(`AG Charts - type '${specifiedType}' is deprecated, use a series type instead`), `factory options type ${specifiedType}`);
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
    const specifiedType = optionsType(input);
    if (specifiedType == null) {
        return false;
    }
    if (specifiedType === 'hierarchy') {
        doOnce(() => console.warn(`AG Charts - type '${specifiedType}' is deprecated, use a series type instead`), `factory options type ${specifiedType}`);
        return true;
    }
    switch (specifiedType) {
        case 'treemap':
            return true;
        default:
            return false;
    }
}
export function isAgPolarChartOptions(input) {
    const specifiedType = optionsType(input);
    if (specifiedType == null) {
        return false;
    }
    if (specifiedType === 'polar') {
        doOnce(() => console.warn(`AG Charts - type '${specifiedType}' is deprecated, use a series type instead`), `factory options type ${specifiedType}`);
        return true;
    }
    switch (specifiedType) {
        case 'pie':
            return true;
        default:
            return false;
    }
}
const SERIES_OPTION_TYPES = ['line', 'bar', 'column', 'histogram', 'scatter', 'area', 'pie', 'treemap'];
function isSeriesOptionType(input) {
    if (input == null) {
        return false;
    }
    return SERIES_OPTION_TYPES.indexOf(input) >= 0;
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
export const noDataCloneMergeOptions = {
    avoidDeepClone: ['data'],
};
export function prepareOptions(newOptions, ...fallbackOptions) {
    var _a, _b;
    let options = jsonMerge([...fallbackOptions, newOptions], noDataCloneMergeOptions);
    sanityCheckOptions(options);
    // Determine type and ensure it's explicit in the options config.
    const userSuppliedOptionsType = options.type;
    const type = optionsType(options);
    const checkSeriesType = (type) => {
        if (type != null && !isSeriesOptionType(type)) {
            throw new Error(`AG Charts - unknown series type: ${type}; expected one of: ${SERIES_OPTION_TYPES.join(', ')}`);
        }
    };
    checkSeriesType(type);
    for (const { type: seriesType } of (_a = options.series) !== null && _a !== void 0 ? _a : []) {
        if (seriesType == null)
            continue;
        checkSeriesType(seriesType);
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
        ? DEFAULT_BAR_CHART_OVERRIDES
        : type === 'scatter'
            ? DEFAULT_SCATTER_HISTOGRAM_CHART_OVERRIDES
            : type === 'histogram'
                ? DEFAULT_SCATTER_HISTOGRAM_CHART_OVERRIDES
                : isAgCartesianChartOptions(options)
                    ? DEFAULT_CARTESIAN_CHART_OVERRIDES
                    : {};
    const { context, mergedOptions, axesThemes, seriesThemes } = prepareMainOptions(defaultOverrides, options);
    // Special cases where we have arrays of elements which need their own defaults.
    // Apply series themes before calling processSeriesOptions() as it reduces and renames some
    // properties, and in that case then cannot correctly have themes applied.
    mergedOptions.series = processSeriesOptions((mergedOptions.series || []).map((s) => {
        const type = s.type
            ? s.type
            : isSeriesOptionType(userSuppliedOptionsType)
                ? userSuppliedOptionsType
                : defaultSeriesType;
        const mergedSeries = jsonMerge([seriesThemes[type] || {}, Object.assign(Object.assign({}, s), { type })], noDataCloneMergeOptions);
        if (type === 'pie') {
            preparePieOptions(seriesThemes.pie, s, mergedSeries);
        }
        return mergedSeries;
    })).map((s) => prepareSeries(context, s));
    if (isAgCartesianChartOptions(mergedOptions)) {
        mergedOptions.axes = (_b = mergedOptions.axes) === null || _b === void 0 ? void 0 : _b.map((a) => {
            var _a;
            const type = (_a = a.type) !== null && _a !== void 0 ? _a : 'number';
            const axis = Object.assign(Object.assign({}, a), { type });
            const axesTheme = jsonMerge([axesThemes[type], axesThemes[type][a.position || 'unknown'] || {}]);
            return prepareAxis(axis, axesTheme);
        });
    }
    prepareEnabledOptions(options, mergedOptions);
    return mergedOptions;
}
function sanityCheckOptions(options) {
    const deprecatedArrayProps = {
        yKeys: 'yKey',
        yNames: 'yName',
    };
    Object.entries(deprecatedArrayProps).forEach(([oldProp, newProp]) => {
        var _a;
        if ((_a = options.series) === null || _a === void 0 ? void 0 : _a.some((s) => s[oldProp] != null)) {
            doOnce(() => console.warn(`AG Charts - Property [series.${oldProp}] is deprecated, please use [series.${newProp}] and multiple series instead.`), `deprecated series.${oldProp} array`);
        }
    });
}
function prepareMainOptions(defaultOverrides, options) {
    const { theme, cleanedTheme, axesThemes, seriesThemes } = prepareTheme(options);
    const context = { colourIndex: 0, palette: theme.palette };
    const mergedOptions = jsonMerge([defaultOverrides, cleanedTheme, options], noDataCloneMergeOptions);
    return { context, mergedOptions, axesThemes, seriesThemes };
}
function prepareTheme(options) {
    const theme = getChartTheme(options.theme);
    const themeConfig = theme.config[optionsType(options) || 'cartesian'];
    const seriesThemes = Object.entries(theme.config).reduce((result, [seriesType, { series }]) => {
        result[seriesType] = series === null || series === void 0 ? void 0 : series[seriesType];
        return result;
    }, {});
    return {
        theme,
        axesThemes: themeConfig['axes'] || {},
        seriesThemes: seriesThemes,
        cleanedTheme: jsonMerge([themeConfig, { axes: DELETE, series: DELETE }]),
    };
}
function prepareSeries(context, input, ...defaults) {
    const paletteOptions = calculateSeriesPalette(context, input);
    // Part of the options interface, but not directly consumed by the series implementations.
    const removeOptions = { stacked: DELETE };
    const mergedResult = jsonMerge([...defaults, paletteOptions, input, removeOptions], noDataCloneMergeOptions);
    return applySeriesTransform(mergedResult);
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
    const removeOptions = { top: DELETE, bottom: DELETE, left: DELETE, right: DELETE };
    // Special cross lines case where we have an arrays of cross line elements which need their own defaults.
    if (axis.crossLines) {
        if (!Array.isArray(axis.crossLines)) {
            console.warn('AG Charts - axis[].crossLines should be an array.');
            axis.crossLines = [];
        }
        const { crossLines: crossLinesTheme } = axisTheme;
        axis.crossLines = axis.crossLines.map((crossLine) => jsonMerge([crossLinesTheme, crossLine]));
    }
    const cleanTheme = { crossLines: DELETE };
    return jsonMerge([axisTheme, cleanTheme, axis, removeOptions], noDataCloneMergeOptions);
}
function prepareEnabledOptions(options, mergedOptions) {
    // Set `enabled: true` for all option objects where the user has provided values.
    jsonWalk(options, (_, visitingUserOpts, visitingMergedOpts) => {
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
    jsonWalk(mergedOptions, (_, visitingMergedOpts) => {
        if (visitingMergedOpts._enabledFromTheme != null) {
            // Do not apply special handling, base enablement on theme.
            delete visitingMergedOpts._enabledFromTheme;
        }
    }, { skip: ['data', 'theme'] });
}
function preparePieOptions(pieSeriesTheme, seriesOptions, mergedSeries) {
    if (Array.isArray(seriesOptions.innerLabels)) {
        mergedSeries.innerLabels = seriesOptions.innerLabels.map((ln) => {
            return jsonMerge([pieSeriesTheme.innerLabels, ln]);
        });
    }
    else {
        mergedSeries.innerLabels = DELETE;
    }
}
