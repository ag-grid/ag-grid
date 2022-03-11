"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const defaults_1 = require("./defaults");
const json_1 = require("../../util/json");
const transforms_1 = require("./transforms");
const themes_1 = require("./themes");
const prepareSeries_1 = require("./prepareSeries");
function optionsType(input) {
    var _a, _b;
    return input.type || ((_b = (_a = input.series) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.type) || 'cartesian';
}
exports.optionsType = optionsType;
function isAgCartesianChartOptions(input) {
    const specifiedType = optionsType(input);
    if (specifiedType == null) {
        return true;
    }
    switch (specifiedType) {
        case 'cartesian':
        case 'area':
        case 'bar':
        case 'column':
        case 'groupedCategory':
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
    switch (input.type) {
        case 'hierarchy':
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
    switch (input.type) {
        case 'polar':
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
exports.isSeriesOptionType = isSeriesOptionType;
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
function prepareOptions(newOptions, fallbackOptions) {
    let options = fallbackOptions == null ? newOptions : json_1.jsonMerge(fallbackOptions, newOptions);
    sanityCheckOptions(options);
    // Determine type and ensure it's explicit in the options config.
    const userSuppliedOptionsType = options.type;
    const type = optionsType(options);
    options = Object.assign(Object.assign({}, options), { type });
    const defaultOptions = isAgCartesianChartOptions(options) ? defaults_1.DEFAULT_CARTESIAN_CHART_OPTIONS :
        isAgHierarchyChartOptions(options) ? defaults_1.DEFAULT_HIERARCHY_CHART_OPTIONS :
            isAgPolarChartOptions(options) ? defaults_1.DEFAULT_POLAR_CHART_OPTIONS :
                {};
    const defaultSeriesType = isAgCartesianChartOptions(options) ? 'line' :
        isAgHierarchyChartOptions(options) ? 'treemap' :
            isAgPolarChartOptions(options) ? 'pie' :
                'line';
    const defaultOverrides = type === 'bar' ? defaults_1.DEFAULT_BAR_CHART_OVERRIDES :
        type === 'scatter' ? defaults_1.DEFAULT_SCATTER_HISTOGRAM_CHART_OVERRIDES :
            type === 'histogram' ? defaults_1.DEFAULT_SCATTER_HISTOGRAM_CHART_OVERRIDES :
                {};
    const { context, mergedOptions, axesThemes, seriesThemes } = prepareMainOptions(defaultOptions, defaultOverrides, options);
    // Special cases where we have arrays of elements which need their own defaults.
    mergedOptions.series = prepareSeries_1.processSeriesOptions(mergedOptions.series || [])
        .map((s) => {
        const type = s.type ? s.type :
            isSeriesOptionType(userSuppliedOptionsType) ? userSuppliedOptionsType :
                defaultSeriesType;
        const series = Object.assign(Object.assign({}, s), { type });
        return prepareSeries(context, series, defaults_1.DEFAULT_SERIES_OPTIONS[type], seriesThemes[type] || {});
    });
    if (isAgCartesianChartOptions(mergedOptions)) {
        (mergedOptions.axes || []).forEach((a, i) => {
            const type = a.type || 'number';
            const axis = Object.assign(Object.assign({}, a), { type });
            const axesTheme = json_1.jsonMerge(axesThemes[type], axesThemes[type][a.position || 'unknown'] || {});
            mergedOptions.axes[i] = prepareAxis(axis, defaults_1.DEFAULT_AXES_OPTIONS[type], axesTheme);
        });
    }
    prepareEnabledOptions(options, mergedOptions);
    return mergedOptions;
}
exports.prepareOptions = prepareOptions;
function sanityCheckOptions(options) {
    var _a, _b;
    if ((_a = options.series) === null || _a === void 0 ? void 0 : _a.some((s) => s.yKeys != null && s.yKey != null)) {
        console.warn('AG Charts - series options yKeys and yKey are mutually exclusive, please only use yKey for future compatibility.');
    }
    if ((_b = options.series) === null || _b === void 0 ? void 0 : _b.some((s) => s.yNames != null && s.yName != null)) {
        console.warn('AG Charts - series options yNames and yName are mutually exclusive, please only use yName for future compatibility.');
    }
}
function prepareMainOptions(defaultOptions, defaultOverrides, options) {
    const { theme, cleanedTheme, axesThemes, seriesThemes } = prepareTheme(options);
    const context = { colourIndex: 0, palette: theme.palette };
    const mergedOptions = json_1.jsonMerge(defaultOptions, defaultOverrides, cleanedTheme, options);
    return { context, mergedOptions, axesThemes, seriesThemes };
}
function prepareTheme(options) {
    const theme = themes_1.getChartTheme(options.theme);
    const themeConfig = theme.getConfig(optionsType(options) || 'cartesian');
    return {
        theme,
        axesThemes: themeConfig['axes'] || {},
        seriesThemes: themeConfig['series'] || {},
        cleanedTheme: json_1.jsonMerge(themeConfig, { axes: json_1.DELETE, series: json_1.DELETE }),
    };
}
function prepareSeries(context, input, ...defaults) {
    const paletteOptions = calculateSeriesPalette(context, input);
    // Part of the options interface, but not directly consumed by the series implementations.
    const removeOptions = { stacked: json_1.DELETE };
    const mergedResult = json_1.jsonMerge(...defaults, paletteOptions, input, removeOptions);
    return transforms_1.applySeriesTransform(mergedResult);
}
function calculateSeriesPalette(context, input) {
    let paletteOptions = {};
    const { palette: { fills, strokes } } = context;
    const inputAny = input;
    let colourCount = countArrayElements(inputAny['yKeys'] || []) || 1; // Defaults to 1 if no yKeys.
    switch (input.type) {
        case 'pie':
            colourCount = Math.max(fills.length, strokes.length);
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
            paletteOptions.fill = takeColours(context, fills, 1)[0];
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
function prepareAxis(input, ...defaults) {
    // Remove redundant theme overload keys.
    const removeOptions = { top: json_1.DELETE, bottom: json_1.DELETE, left: json_1.DELETE, right: json_1.DELETE };
    return json_1.jsonMerge(...defaults, input, removeOptions);
}
function prepareEnabledOptions(options, mergedOptions) {
    // Set `enabled: true` for all option objects where the user has provided values.
    json_1.jsonWalk(options, (_, userOpts, mergedOpts) => {
        if (!mergedOpts) {
            return;
        }
        if ('enabled' in mergedOpts && userOpts.enabled == null) {
            mergedOpts.enabled = true;
        }
    }, { skip: ['data'] }, mergedOptions);
}
//# sourceMappingURL=prepare.js.map