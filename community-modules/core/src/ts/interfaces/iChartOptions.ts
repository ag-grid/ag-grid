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

export type ChartGroupsDef = {
    [chartType in keyof ChartTypeKeys]: (keyof ChartTypeKeys[chartType])[];
};

export type PartialChartGroupsDef = Partial<ChartGroupsDef>;

/************************************************************************************************
 * If you update these, then also update the `integrated-charts-toolbar` docs. *
 ************************************************************************************************/
export const DEFAULT_CHART_GROUPS: PartialChartGroupsDef = {
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

export type ChartToolPanelName = 'settings' | 'data' | 'format';

export type ChartToolPanelsDef = {
    settingsPanel?: {
        chartGroupsDef: PartialChartGroupsDef,
    },
    panels?: ChartToolPanelName[],
    defaultToolPanel?: ChartToolPanelName
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

export type ChartToolPanelMenuOptions = 'chartSettings' | 'chartData' | 'chartFormat';
export type ChartToolbarMenuItemOptions = 'chartLink' | 'chartUnlink' | 'chartDownload';
export type ChartMenuOptions = ChartToolPanelMenuOptions | ChartToolbarMenuItemOptions;
export const CHART_TOOL_PANEL_ALLOW_LIST: ChartToolPanelMenuOptions[] = [
    'chartSettings', 
    'chartData', 
    'chartFormat'
];
export const CHART_TOOLBAR_ALLOW_LIST: ChartMenuOptions[] = [
    'chartUnlink',
    'chartLink',
    'chartDownload'
];

export const CHART_TOOL_PANEL_MENU_OPTIONS: { [key in ChartToolPanelName]: ChartToolPanelMenuOptions } = {
    settings: "chartSettings",
    data: "chartData",
    format: "chartFormat"
}

export interface SeriesChartType {
    colId: string;
    chartType: ChartType;
    secondaryAxis?: boolean;
}
