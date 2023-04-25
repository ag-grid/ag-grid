import { AgCartesianChartOptions } from 'ag-charts-community';

export const heatmapDefaults: AgCartesianChartOptions = {
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
