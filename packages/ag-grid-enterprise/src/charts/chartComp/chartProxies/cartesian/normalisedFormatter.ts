import type { AgCartesianChartOptions } from 'ag-charts-types';

// AG Charts formats tooltip and series-label values with the axis label formatter unless this chart-level
// formatter handles them, so the '%' must be limited to the sources that display the normalised axis position.
export const NORMALISED_CHART_FORMATTER: AgCartesianChartOptions['formatter'] = {
    y: (params) =>
        params.type === 'number' && (params.source === 'axis-label' || params.source === 'crosshair')
            ? `${Math.round(Number(params.value))}%`
            : undefined,
};
