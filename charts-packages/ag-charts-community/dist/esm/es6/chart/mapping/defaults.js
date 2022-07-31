import { NumberAxis } from '../axis/numberAxis';
import { ChartAxisPosition } from '../chartAxis';
import { CategoryAxis } from '../axis/categoryAxis';
export const DEFAULT_CARTESIAN_CHART_OVERRIDES = {
    type: 'cartesian',
    axes: [
        {
            type: NumberAxis.type,
            position: ChartAxisPosition.Left,
        },
        {
            type: CategoryAxis.type,
            position: ChartAxisPosition.Bottom,
        },
    ],
};
export const DEFAULT_BAR_CHART_OVERRIDES = {
    axes: [
        {
            type: 'number',
            position: ChartAxisPosition.Bottom,
        },
        {
            type: 'category',
            position: ChartAxisPosition.Left,
        },
    ],
};
export const DEFAULT_SCATTER_HISTOGRAM_CHART_OVERRIDES = {
    axes: [
        {
            type: 'number',
            position: ChartAxisPosition.Bottom,
        },
        {
            type: 'number',
            position: ChartAxisPosition.Left,
        },
    ],
};
