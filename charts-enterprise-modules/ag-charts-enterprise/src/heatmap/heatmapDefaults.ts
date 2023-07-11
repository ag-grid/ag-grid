import type { AgCartesianChartOptions } from 'ag-charts-community';

export const HEATMAP_DEFAULTS: AgCartesianChartOptions = {
    axes: [
        {
            type: 'category',
            position: 'left',
        },
        {
            type: 'category',
            position: 'bottom',
        },
    ],
};
