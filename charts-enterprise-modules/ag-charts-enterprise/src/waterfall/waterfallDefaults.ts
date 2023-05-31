import { AgCartesianChartOptions } from 'ag-charts-community';

export const WATERFALL_COLUMN_DEFAULTS: AgCartesianChartOptions = {
    axes: [
        {
            type: 'number',
            position: 'left',
        },
        {
            type: 'category',
            position: 'bottom',
        },
    ],
};
