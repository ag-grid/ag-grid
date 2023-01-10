import { NumberAxis } from '../axis/numberAxis';
import { CategoryAxis } from '../axis/categoryAxis';
export var DEFAULT_CARTESIAN_CHART_OVERRIDES = {
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
export var DEFAULT_BAR_CHART_OVERRIDES = {
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
export var DEFAULT_SCATTER_HISTOGRAM_CHART_OVERRIDES = {
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
