import type { AgCartesianAxisOptions, AgCartesianChartOptions, FormatterParams } from 'ag-charts-types';

type ChartFormatter = NonNullable<AgCartesianChartOptions['formatter']>;

const toPercent = (value: unknown) => `${Math.round(Number(value))}%`;

const isObject = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

function mergeFirstWins(first: unknown, second: unknown): unknown {
    if (isObject(first) && isObject(second)) {
        const merged: Record<string, unknown> = { ...second };
        const keys = Object.keys(first);
        for (let i = 0, len = keys.length; i < len; ++i) {
            const key = keys[i];
            merged[key] = mergeFirstWins(first[key], second[key]);
        }
        return merged;
    }
    return first ?? second;
}

/**
 * Merges formatters, highest priority first, as AG Charts merges theme overrides: the first defined value wins, and
 * formatters keyed by property merge property by property.
 */
export function mergeThemeFormatters(formatters: (ChartFormatter | undefined)[]): ChartFormatter | undefined {
    return formatters.reduce<unknown>(mergeFirstWins, undefined) as ChartFormatter | undefined;
}

// AG Charts formats tooltips with the axis label formatter, so the '%' is scoped here to axis ticks and crosshair.
// This replaces the theme's chart-level formatter, so it delegates everything else to it.
function createNormalisedFormatter(themeFormatter: ChartFormatter | undefined): ChartFormatter {
    const formatWithTheme = (params: FormatterParams) => {
        const formatter = typeof themeFormatter === 'function' ? themeFormatter : themeFormatter?.[params.property];
        return typeof formatter === 'function' ? formatter(params) : undefined;
    };
    const formatter = (params: FormatterParams) =>
        params.property === 'y' &&
        params.type === 'number' &&
        (params.source === 'axis-label' || params.source === 'crosshair')
            ? toPercent(params.value)
            : formatWithTheme(params);

    return typeof themeFormatter === 'object' ? { ...themeFormatter, y: formatter } : formatter;
}

/**
 * Shows the value axis of a 100% stacked chart as percentages. A theme `y` format string (or time format) can't be
 * composed with, so it is left to format everything, and the '%' goes on the value axis label, which wins for ticks.
 * Tooltips are formatted by the theme's `y` format before AG Charts would fall back to the axis label formatter.
 * The chart options carry over between updates, so a formatter installed by an earlier update is removed.
 */
export function applyNormalisedFormatting(
    options: AgCartesianChartOptions,
    valueAxis: AgCartesianAxisOptions,
    themeFormatter: ChartFormatter | undefined
): AgCartesianChartOptions {
    const themeY = typeof themeFormatter === 'object' ? themeFormatter.y : undefined;
    if (themeY != null && typeof themeY !== 'function') {
        valueAxis.label = { ...valueAxis.label, formatter: (params) => toPercent(params.value) };
        const { formatter: _, ...withoutFormatter } = options;
        return withoutFormatter;
    }
    return { ...options, formatter: createNormalisedFormatter(themeFormatter) };
}
