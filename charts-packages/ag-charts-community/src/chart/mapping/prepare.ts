import { AgChartOptions, AgHierarchyChartOptions, AgPolarChartOptions, AgCartesianChartOptions, AgChartThemePalette, AgLineSeriesOptions, AgBarSeriesOptions, AgAreaSeriesOptions, AgScatterSeriesOptions, AgHistogramSeriesOptions, AgPieSeriesOptions, AgTreemapSeriesOptions, AgLogAxisOptions, AgNumberAxisOptions, AgCategoryAxisOptions, AgGroupedCategoryAxisOptions, AgTimeAxisOptions } from "../agChartOptions";
import { CartesianChart } from "../cartesianChart";
import { PolarChart } from "../polarChart";
import { HierarchyChart } from "../hierarchyChart";
import { GroupedCategoryChart } from "../groupedCategoryChart";
import { Series } from "../series/series";

// TODO: Move these out of the old implementation?
import { AgChart, processSeriesOptions, getChartTheme } from '../agChart';
import { LineSeries } from "../series/cartesian/lineSeries";
import { Axis } from "../../axis";
import { LogAxis } from "../axis/logAxis";
import { SeriesOptionsTypes, DEFAULT_CARTESIAN_CHART_OPTIONS, DEFAULT_HIERARCHY_CHART_OPTIONS, DEFAULT_POLAR_CHART_OPTIONS, DEFAULT_BAR_CHART_OVERRIDES, DEFAULT_SCATTER_HISTOGRAM_CHART_OVERRIDES, DEFAULT_SERIES_OPTIONS, DEFAULT_AXES_OPTIONS, AxesOptionsTypes } from "./defaults";
import { jsonMerge, DELETE, jsonWalk } from "../../util/json";
import { applySeriesTransform } from "./transforms";
import { BarSeries } from "../series/cartesian/barSeries";
import { AreaSeries } from "../series/cartesian/areaSeries";
import { ScatterSeries } from "../series/cartesian/scatterSeries";
import { HistogramSeries } from "../series/cartesian/histogramSeries";
import { PieSeries } from "../series/polar/pieSeries";
import { TreemapSeries } from "../series/hierarchy/treemapSeries";
import { NumberAxis } from "../axis/numberAxis";
import { CategoryAxis } from "../axis/categoryAxis";
import { GroupedCategoryAxis } from "../axis/groupedCategoryAxis";
import { TimeAxis } from "../axis/timeAxis";

export type ChartType = CartesianChart | PolarChart | HierarchyChart;

export function optionsType(
    input: { type?: AgChartOptions['type'], series?: { type?: SeriesOptionsTypes['type']}[]}
): NonNullable<AgChartOptions['type']> {
    return input.type || input.series?.[0]?.type || 'cartesian';
}

export function isAgCartesianChartOptions(input: AgChartOptions): input is AgCartesianChartOptions {
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

export function isAgHierarchyChartOptions(input: AgChartOptions): input is AgHierarchyChartOptions {
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

export function isAgPolarChartOptions(input: AgChartOptions): input is AgPolarChartOptions {
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

function countArrayElements<T extends any[]|any[][]>(input: T): number {
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

function takeColours(context: PreparationContext, colours: string[], maxCount: number): string[] {
    const result = [];

    for (let count = 0; count < Math.min(maxCount, colours.length); count++) {
        result.push(colours[(count + context.colourIndex) % colours.length]);
    }

    return result;
}

interface PreparationContext {
    colourIndex: number;
    palette: AgChartThemePalette;
}

export function prepareOptions<T extends AgChartOptions>(options: T): T {
    // Determine type and ensure it's explicit in the options config.
    const type = optionsType(options);
    options = {...options, type };

    const defaultOptions = isAgCartesianChartOptions(options) ? DEFAULT_CARTESIAN_CHART_OPTIONS :
        isAgHierarchyChartOptions(options) ? DEFAULT_HIERARCHY_CHART_OPTIONS :
        isAgPolarChartOptions(options) ? DEFAULT_POLAR_CHART_OPTIONS :
        {};

    const defaultOverrides =
        type === 'bar' ? DEFAULT_BAR_CHART_OVERRIDES :
        type === 'scatter' ? DEFAULT_SCATTER_HISTOGRAM_CHART_OVERRIDES :
        type === 'histogram' ? DEFAULT_SCATTER_HISTOGRAM_CHART_OVERRIDES :
        {};

    const { context, mergedOptions, axesThemes, seriesThemes } =
        prepareMainOptions<T>(defaultOptions as T, defaultOverrides as T, options);

    // Special cases where we have arrays of elements which need their own defaults.
    mergedOptions.series = processSeriesOptions(mergedOptions.series || [])
        .map((s: SeriesOptionsTypes) => {
            const type = s.type || 'line';
            const series = { ...s, type };
            return prepareSeries(context, series, DEFAULT_SERIES_OPTIONS[type], seriesThemes[type] || {});
        });
    if (isAgCartesianChartOptions(mergedOptions)) {
        (mergedOptions.axes || []).forEach((a, i) => {
            const type = a.type || 'number';
            const axis = { ...a, type };
            const axesTheme = jsonMerge(axesThemes[type], axesThemes[type][a.position || 'unknown'] || {});
            mergedOptions.axes![i] = prepareAxis(axis, DEFAULT_AXES_OPTIONS[type], axesTheme);
        });
    }

    prepareEnabledOptions<T>(options, mergedOptions);

    return mergedOptions;
}

function prepareMainOptions<T>(defaultOptions: T, defaultOverrides: T, options: T): { context: PreparationContext, mergedOptions: T; axesThemes: any; seriesThemes: any; } {
    const { theme, cleanedTheme, axesThemes, seriesThemes } = prepareTheme(options);
    const context: PreparationContext = { colourIndex: 0, palette: theme.palette };        
    const mergedOptions = jsonMerge(defaultOptions as T, defaultOverrides, cleanedTheme, options);

    return { context, mergedOptions, axesThemes, seriesThemes };
}

function prepareTheme<T extends AgChartOptions>(options: T) {
    const theme = getChartTheme(options.theme);
    const themeConfig = theme.getConfig(optionsType(options) || 'cartesian');
    return {
        theme,
        axesThemes: themeConfig['axes'] || {},
        seriesThemes: themeConfig['series'] || {},
        cleanedTheme: jsonMerge(themeConfig, { axes: DELETE, series: DELETE }),
    };
}

function prepareSeries<T extends SeriesOptionsTypes>(context: PreparationContext, input: T, ...defaults: T[]): T {
    const paletteOptions = calculateSeriesPalette(context, input);

    // Part of the options interface, but not directly consumed by the series implementations.
    const removeOptions = { stacked: DELETE } as T;
    const mergedResult = jsonMerge(...defaults, paletteOptions, input, removeOptions);

    return applySeriesTransform(mergedResult);
}

function calculateSeriesPalette<T extends SeriesOptionsTypes>(context: PreparationContext, input: T): T {
    let paletteOptions: {
        stroke?: string;
        fill?: string;
        fills?: string[];
        strokes?: string[];
        marker?: { fill?: string; stroke?: string; };
        callout?: { colors?: string[]; };
    } = {};

    const { palette: { fills, strokes } } = context;
    
    const inputAny = (input as any);
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
            paletteOptions.stroke = takeColours(context, strokes, 1)[0];
            paletteOptions.marker = {
                stroke: takeColours(context, strokes, 1)[0],
                fill: takeColours(context, fills, 1)[0],
            };
            break;
        case 'treemap':
            break;
        case 'ohlc':
        default:
            throw new Error('AG Charts - unknown series type: ' + input.type);
    }
    context.colourIndex += colourCount;

    return paletteOptions as T;
}

function prepareAxis<T extends AxesOptionsTypes>(input: T, ...defaults: T[]): T {
    // Remove redundant theme overload keys.
    const removeOptions = { top: DELETE, bottom: DELETE, left: DELETE, right: DELETE } as any;
    return jsonMerge(...defaults, input, removeOptions);
}

function prepareEnabledOptions<T extends AgChartOptions>(options: T, mergedOptions: any) {
    // Set `enabled: true` for all option objects where the user has provided values.
    jsonWalk(options, (_, userOpts, mergedOpts) => {
        if (!mergedOpts) {
            return;
        }
        if ('enabled' in mergedOpts && userOpts.enabled == null) {
            mergedOpts.enabled = true;
        }
    }, { skip: ['data'] }, mergedOptions);
}
