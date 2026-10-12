import type { AgCartesianChartOptions, FormatterParams } from 'ag-charts-types';

type ChartFormatter = NonNullable<AgCartesianChartOptions['formatter']>;

// AG Charts formats tooltips with the axis label formatter, so the '%' is scoped here to axis ticks and crosshair.
// Any theme formatter (e.g. chartThemeOverrides.common.formatter) still formats everything else, as the chart-level
// formatter set here replaces it.
export function createNormalisedFormatter(themeFormatter: ChartFormatter | undefined): ChartFormatter {
    const formatWithTheme = (params: FormatterParams) => {
        const formatter = typeof themeFormatter === 'function' ? themeFormatter : themeFormatter?.[params.property];
        return typeof formatter === 'function' ? formatter(params) : undefined;
    };
    const formatter = (params: FormatterParams) =>
        params.property === 'y' &&
        params.type === 'number' &&
        (params.source === 'axis-label' || params.source === 'crosshair')
            ? `${Math.round(Number(params.value))}%`
            : formatWithTheme(params);

    return typeof themeFormatter === 'object' ? { ...themeFormatter, y: formatter } : formatter;
}
