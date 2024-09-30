import type { ChartType } from '@ag-grid-community/core';

export const CROSS_FILTER_FIELD_POSTFIX = '$$Filter$$';

type CrossFilterBehavior = 'preserve' | 'filter';

type BehaviorConfig = {
    ifSource: CrossFilterBehavior;
    ifTarget: CrossFilterBehavior;
};

export type CrossFilterChartConfigItem = {
    categories: BehaviorConfig;
    data: BehaviorConfig;
};

export type CrossFilterChartConfig = Partial<{ [key in ChartType]: CrossFilterChartConfigItem }>;
