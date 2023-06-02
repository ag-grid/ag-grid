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

export const WATERFALL_BAR_DEFAULTS: AgCartesianChartOptions = {
    axes: [
        {
            type: 'category',
            position: 'left',
        },
        {
            type: 'number',
            position: 'bottom',
        },
    ],
};
