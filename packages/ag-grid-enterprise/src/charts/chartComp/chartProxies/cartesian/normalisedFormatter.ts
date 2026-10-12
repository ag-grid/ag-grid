import type { AgCartesianChartOptions } from 'ag-charts-types';

// AG Charts formats tooltips with the axis label formatter, so the '%' is scoped here to axis ticks and crosshair.
export const NORMALISED_CHART_FORMATTER: AgCartesianChartOptions['formatter'] = {
    y: (params) =>
        params.type === 'number' && (params.source === 'axis-label' || params.source === 'crosshair')
            ? `${Math.round(Number(params.value))}%`
            : undefined,
};
