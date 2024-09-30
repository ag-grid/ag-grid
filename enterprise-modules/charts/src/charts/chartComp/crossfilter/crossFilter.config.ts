import type { ChartType } from '@ag-grid-community/core';

import type { CrossFilterChartConfig, CrossFilterChartConfigItem } from './crossFilterAPI';

const CROSSFILTER_CHART_CONFIG_DEFAULT: CrossFilterChartConfigItem = {
    categories: {
        ifSource: 'preserve',
        ifTarget: 'filter',
    },
    data: {
        ifSource: 'preserve',
        ifTarget: 'filter',
    },
};

const CROSSFILTER_CHART_CONFIG: CrossFilterChartConfig = {
    area: {
        categories: {
            ifSource: 'preserve',
            ifTarget: 'filter',
        },
        data: {
            ifSource: 'preserve',
            ifTarget: 'filter',
        },
    },
    line: {
        categories: {
            ifSource: 'preserve',
            ifTarget: 'filter',
        },
        data: {
            ifSource: 'preserve',
            ifTarget: 'filter',
        },
    },
};

export const getCrossFilterChartConfig = (chartType: ChartType): CrossFilterChartConfigItem => {
    return CROSSFILTER_CHART_CONFIG[chartType] ?? CROSSFILTER_CHART_CONFIG_DEFAULT;
};
