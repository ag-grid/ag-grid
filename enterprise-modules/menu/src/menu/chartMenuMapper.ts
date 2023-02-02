import { ChartGroupsDef, ChartType } from '@ag-grid-community/core';

export type ChartMenuOptionName =
    'pivotChart' |
    'chartRange' |
    'pivotColumnChart' |
    'pivotGroupedColumn' |
    'pivotStackedColumn' |
    'pivotNormalizedColumn' |
    'rangeColumnChart' |
    'rangeGroupedColumn' |
    'rangeStackedColumn' |
    'rangeNormalizedColumn' |
    'pivotBarChart' |
    'pivotGroupedBar' |
    'pivotStackedBar' |
    'pivotNormalizedBar' |
    'rangeBarChart' |
    'rangeGroupedBar' |
    'rangeStackedBar' |
    'rangeNormalizedBar' |
    'pivotPieChart' |
    'pivotPie' |
    'pivotDoughnut' |
    'rangePieChart' |
    'rangePie' |
    'rangeDoughnut' |
    'pivotLineChart' |
    'rangeLineChart' |
    'pivotXYChart' |
    'pivotScatter' |
    'pivotBubble' |
    'rangeXYChart' |
    'rangeScatter' |
    'rangeBubble' |
    'pivotAreaChart' |
    'pivotArea' |
    'pivotStackedArea' |
    'pivotNormalizedArea' |
    'rangeAreaChart' |
    'rangeArea' |
    'rangeStackedArea' |
    'rangeNormalizedArea' |
    'rangeHistogramChart' |
    'rangeColumnLineCombo' |
    'rangeAreaColumnCombo' |
    'rangeCombinationChart';

const chartGroupsDefToMenu: {
    [K in keyof ChartGroupsDef]-?: ChartGroupsDef[K] extends ((infer P)[] | undefined) ?
    [P] extends [ChartType] ?
    { [T in P]-?: ChartMenuOptionName[] } : never
    : never
} = {
    columnGroup: {
        column: ['pivotGroupedColumn', 'rangeGroupedColumn'],
        stackedColumn: ['pivotStackedColumn', 'rangeStackedColumn'],
        normalizedColumn: ['pivotNormalizedColumn', 'rangeNormalizedColumn'],
    },
    barGroup: {
        bar: ['pivotGroupedBar', 'rangeGroupedBar'],
        stackedBar: ['pivotStackedBar', 'rangeStackedBar'],
        normalizedBar: ['pivotNormalizedBar', 'rangeNormalizedBar']
    },
    pieGroup: {
        pie: ['pivotPie', 'rangePie'],
        doughnut: ['pivotDoughnut', 'rangeDoughnut']
    },
    lineGroup: {
        line: ['pivotLineChart', 'rangeLineChart']
    },
    scatterGroup: {
        bubble: ['pivotBubble', 'rangeBubble'],
        scatter: ['pivotScatter', 'rangeScatter']
    },
    areaGroup: {
        area: ['pivotArea', 'rangeArea'],
        stackedArea: ['pivotStackedArea', 'rangeStackedArea'],
        normalizedArea: ['pivotNormalizedArea', 'rangeNormalizedArea']
    },
    histogramGroup: {
        histogram: ['rangeHistogramChart']
    },
    combinationGroup: {
        columnLineCombo: ['rangeColumnLineCombo'],
        areaColumnCombo: ['rangeAreaColumnCombo'],
        customCombo: []
    }
};

/**
 * Get a list of the valid chart menu items based off the provided ChartGroupsDef
 */
export function getValidChartMenuItems(def: ChartGroupsDef) {
    let valid: string[] = [];
    Object.keys(def).forEach((k: keyof ChartGroupsDef) => {
        const charts = def[k];
        const validOps = chartGroupsDefToMenu[k];
        charts?.forEach((c: any) => {
            const options = (validOps as any)[c]
            valid = [...valid, ...options]
        })
    });
    return valid;
}