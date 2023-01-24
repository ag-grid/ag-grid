import { AgCartesianChartOptions, AgChartOptions } from '../agChartOptions';
import { NumberAxis } from '../axis/numberAxis';
import { CategoryAxis } from '../axis/categoryAxis';

export type SeriesOptionsTypes = NonNullable<AgChartOptions['series']>[number];

export const DEFAULT_CARTESIAN_CHART_OVERRIDES: AgCartesianChartOptions = {
    type: 'cartesian',
    axes: [
        {
            type: NumberAxis.type,
            position: 'left',
        },
        {
            type: CategoryAxis.type,
            position: 'bottom',
        },
    ],
};

export const DEFAULT_BAR_CHART_OVERRIDES: AgCartesianChartOptions = {
    axes: [
        {
            type: 'number',
            position: 'bottom',
        },
        {
            type: 'category',
            position: 'left',
        },
    ],
};

export const DEFAULT_SCATTER_HISTOGRAM_CHART_OVERRIDES: AgCartesianChartOptions = {
    axes: [
        {
            type: 'number',
            position: 'bottom',
        },
        {
            type: 'number',
            position: 'left',
        },
    ],
};
