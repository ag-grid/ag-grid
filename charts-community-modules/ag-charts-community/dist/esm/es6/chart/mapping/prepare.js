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
    const specifiedType = optionsType(input);
    if (specifiedType == null) {
        return true;
    }
    if (specifiedType === 'cartesian') {
        Logger.warnOnce(`type '${specifiedType}' is deprecated, use a series type instead`);
        return true;
    }
    return CHART_TYPES.isCartesian(specifiedType);
}
export function isAgHierarchyChartOptions(input) {
    const specifiedType = optionsType(input);
    if (specifiedType == null) {
        return false;
    }
    if (specifiedType === 'hierarchy') {
        Logger.warnOnce(`type '${specifiedType}' is deprecated, use a series type instead`);
        return true;
    }
    return CHART_TYPES.isHierarchy(specifiedType);
}
export function isAgPolarChartOptions(input) {
    const specifiedType = optionsType(input);
    if (specifiedType == null) {
        return false;
    }
    if (specifiedType === 'polar') {
        Logger.warnOnce(`type '${specifiedType}' is deprecated, use a series type instead`);
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
export function prepareOptions(newOptions, fallbackOptions) {
    var _a, _b, _c, _d, _e, _f;
    let options = jsonMerge([fallbackOptions, newOptions], noDataCloneMergeOptions);
    sanityCheckOptions(options);
    // Determine type and ensure it's explicit in the options config.
    const userSuppliedOptionsType = options.type;
    const type = optionsType(options);
    const globalTooltipPositionOptions = (_b = (_a = options.tooltip) === null || _a === void 0 ? void 0 : _a.position) !== null && _b !== void 0 ? _b : {};
    const checkSeriesType = (type) => {
        if (type != null && !(isSeriesOptionType(type) || getSeriesDefaults(type))) {
            throw new Error(`AG Charts - unknown series type: ${type}; expected one of: ${CHART_TYPES.seriesTypes}`);
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
    const seriesDefaults = getSeriesDefaults(type);
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
    const { context, mergedOptions, axesThemes, seriesThemes } = prepareMainOptions(defaultOverrides, options);
    // Special cases where we have arrays of elements which need their own defaults.
    // Apply series themes before calling processSeriesOptions() as it reduces and renames some
    // properties, and in that case then cannot correctly have themes applied.
    mergedOptions.series = processSeriesOptions(((_d = mergedOptions.series) !== null && _d !== void 0 ? _d : []).map((s) => {
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
            Logger.warnOnce(`AG Charts - unknown axis type: ${type}; expected one of: ${CHART_AXES_TYPES.axesTypes}, ignoring.`);
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
                const axesTheme = jsonMerge([
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
    const deprecatedArrayProps = {
        yKeys: 'yKey',
        yNames: 'yName',
    };
    Object.entries(deprecatedArrayProps).forEach(([oldProp, newProp]) => {
        var _a;
        if ((_a = options.series) === null || _a === void 0 ? void 0 : _a.some((s) => s[oldProp] != null)) {
            Logger.warnOnce(`property [series.${oldProp}] is deprecated, please use [series.${newProp}] and multiple series instead.`);
        }
    });
}
function mergeSeriesOptions(series, type, seriesThemes, globalTooltipPositionOptions) {
    var _a, _b;
    const mergedTooltipPosition = jsonMerge([Object.assign({}, globalTooltipPositionOptions), (_a = series.tooltip) === null || _a === void 0 ? void 0 : _a.position], noDataCloneMergeOptions);
    const mergedSeries = jsonMerge([
        (_b = seriesThemes[type]) !== null && _b !== void 0 ? _b : {},
        Object.assign(Object.assign({}, series), { type, tooltip: Object.assign(Object.assign({}, series.tooltip), { position: mergedTooltipPosition }) }),
    ], noDataCloneMergeOptions);
    return mergedSeries;
}
function prepareMainOptions(defaultOverrides, options) {
    const { theme, cleanedTheme, axesThemes, seriesThemes } = prepareTheme(options);
    const context = { colourIndex: 0, palette: theme.palette };
    const mergedOptions = jsonMerge([defaultOverrides, cleanedTheme, options], noDataCloneMergeOptions);
    return { context, mergedOptions, axesThemes, seriesThemes };
}
function prepareTheme(options) {
    var _a, _b;
    const theme = getChartTheme(options.theme);
    const themeConfig = theme.config[(_a = optionsType(options)) !== null && _a !== void 0 ? _a : 'cartesian'];
    const seriesThemes = Object.entries(theme.config).reduce((result, [seriesType, { series }]) => {
        result[seriesType] = series === null || series === void 0 ? void 0 : series[seriesType];
        return result;
    }, {});
    return {
        theme,
        axesThemes: (_b = themeConfig['axes']) !== null && _b !== void 0 ? _b : {},
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
    const removeOptions = { top: DELETE, bottom: DELETE, left: DELETE, right: DELETE };
    // Special cross lines case where we have an array of cross line elements which need their own defaults.
    if (axis.crossLines) {
        if (!Array.isArray(axis.crossLines)) {
            Logger.warn('axis[].crossLines should be an array.');
            axis.crossLines = [];
        }
        const { crossLines: crossLinesTheme } = axisTheme;
        axis.crossLines = axis.crossLines.map((crossLine) => jsonMerge([crossLinesTheme, crossLine]));
    }
    const cleanTheme = { crossLines: DELETE };
    return jsonMerge([axisTheme, cleanTheme, axis, removeOptions], noDataCloneMergeOptions);
}
function removeDisabledOptions(options) {
    // Remove configurations from all option objects with a `false` value for the `enabled` property.
    jsonWalk(options, (_, visitingUserOpts) => {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlcGFyZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jaGFydC9tYXBwaW5nL3ByZXBhcmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBU0EsT0FBTyxFQUVILGlDQUFpQyxFQUNqQywyQkFBMkIsRUFDM0IseUNBQXlDLEdBQzVDLE1BQU0sWUFBWSxDQUFDO0FBQ3BCLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBb0IsTUFBTSxpQkFBaUIsQ0FBQztBQUNoRixPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFDcEQsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUN6QyxPQUFPLEVBQUUsb0JBQW9CLEVBQWlCLE1BQU0saUJBQWlCLENBQUM7QUFDdEUsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBQzNDLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUNwRCxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUNyRCxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUkzRCxNQUFNLFVBQVUsV0FBVyxDQUFDLEtBRzNCOztJQUNHLE9BQU8sTUFBQSxNQUFBLEtBQUssQ0FBQyxJQUFJLG1DQUFJLE1BQUEsTUFBQSxLQUFLLENBQUMsTUFBTSwwQ0FBRyxDQUFDLENBQUMsMENBQUUsSUFBSSxtQ0FBSSxNQUFNLENBQUM7QUFDM0QsQ0FBQztBQUVELE1BQU0sVUFBVSx5QkFBeUIsQ0FBQyxLQUFxQjtJQUMzRCxNQUFNLGFBQWEsR0FBRyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDekMsSUFBSSxhQUFhLElBQUksSUFBSSxFQUFFO1FBQ3ZCLE9BQU8sSUFBSSxDQUFDO0tBQ2Y7SUFFRCxJQUFLLGFBQXdCLEtBQUssV0FBVyxFQUFFO1FBQzNDLE1BQU0s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