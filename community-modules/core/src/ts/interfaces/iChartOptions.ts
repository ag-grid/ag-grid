export const CHART_TYPE_KEYS = {
    columnGroup: {
        column: 'column',
        stackedColumn: 'stackedColumn',
        normalizedColumn: 'normalizedColumn'
    },
    barGroup: {
        bar: 'bar',
        stackedBar: 'stackedBar',
        normalizedBar: 'normalizedBar'
    },
    pieGroup: {
        pie: 'pie',
        doughnut: 'doughnut'
    },
    lineGroup: {
        line: 'line'
    },
    scatterGroup: {
        scatter: 'scatter',
        bubble: 'bubble'
    },
    areaGroup: {
        area: 'area',
        stackedArea: 'stackedArea',
        normalizedArea: 'normalizedArea'
    },
    histogramGroup: {
        histogram: 'histogram'
    },
    combinationGroup: {
        columnLineCombo: 'columnLineCombo',
        areaColumnCombo: 'areaColumnCombo',
        customCombo: 'customCombo'
    }
}

export type ChartTypeKeys = typeof CHART_TYPE_KEYS;

export type ChartGroups = {
    [chartType in keyof ChartTypeKeys]: (keyof ChartTypeKeys[chartType])[];
};

export type PartialChartGroups = Partial<ChartGroups>;

/************************************************************************************************
 * If you update these, then also update the `integrated-charts-toolbar` docs. *
 ************************************************************************************************/
export const DEFAULT_CHART_GROUPS: PartialChartGroups = {
    columnGroup: [
        'column',
        'stackedColumn',
        'normalizedColumn'
    ],
    barGroup: [
        'bar',
        'stackedBar',
        'normalizedBar'
    ],
    pieGroup: [
        'pie',
        'doughnut'
    ],
    lineGroup: [
        'line'
    ],
    scatterGroup: [
        'scatter',
        'bubble'
    ],
    areaGroup: [
        'area',
        'stackedArea',
        'normalizedArea'
    ],
    histogramGroup: [
        'histogram'
    ],
    combinationGroup: [
        'columnLineCombo',
        'areaColumnCombo',
        'customCombo'
    ]
}

export type ChartToolPanels = {
    settingsPanel: {
        chartGroups: PartialChartGroups
    }
}

export type ChartType =
      'column'
    | 'groupedColumn'
    | 'stackedColumn'
    | 'normalizedColumn'
    | 'bar'
    | 'groupedBar'
    | 'stackedBar'
    | 'normalizedBar'
    | 'line'
    | 'scatter'
    | 'bubble'
    | 'pie'
    | 'doughnut'
    | 'area'
    | 'stackedArea'
    | 'normalizedArea'
    | 'histogram'
    | 'columnLineCombo'
    | 'areaColumnCombo'
    | 'customCombo';

export type CrossFilterChartType =
      'column'
    | 'bar'
    | 'line'
    | 'scatter'
    | 'bubble'
    | 'pie'
    | 'doughnut'
    | 'area';

export type ChartMenuOptions =
      'chartSettings'
    | 'chartData'
    | 'chartFormat'
    | 'chartLink'
    | 'chartUnlink'
    | 'chartDownload';

export interface SeriesChartType {
    colId: string;
    chartType: ChartType;
    secondaryAxis?: boolean;
}
