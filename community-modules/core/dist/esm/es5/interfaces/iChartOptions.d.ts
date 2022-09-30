// Type definitions for @ag-grid-community/core v28.2.0
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
export declare const CHART_TYPE_KEYS: {
    columnGroup: {
        column: string;
        stackedColumn: string;
        normalizedColumn: string;
    };
    barGroup: {
        bar: string;
        stackedBar: string;
        normalizedBar: string;
    };
    pieGroup: {
        pie: string;
        doughnut: string;
    };
    lineGroup: {
        line: string;
    };
    scatterGroup: {
        scatter: string;
        bubble: string;
    };
    areaGroup: {
        area: string;
        stackedArea: string;
        normalizedArea: string;
    };
    histogramGroup: {
        histogram: string;
    };
    combinationGroup: {
        columnLineCombo: string;
        areaColumnCombo: string;
        customCombo: string;
    };
};
export declare type ChartTypeKeys = typeof CHART_TYPE_KEYS;
export declare type ChartGroupsDef = {
    [chartType in keyof ChartTypeKeys]: (keyof ChartTypeKeys[chartType])[];
};
export declare type PartialChartGroupsDef = Partial<ChartGroupsDef>;
/************************************************************************************************
 * If you update these, then also update the `integrated-charts-toolbar` docs. *
 ************************************************************************************************/
export declare const DEFAULT_CHART_GROUPS: PartialChartGroupsDef;
export declare type ChartToolPanelName = 'settings' | 'data' | 'format';
export declare type ChartToolPanelsDef = {
    settingsPanel?: {
        chartGroupsDef: PartialChartGroupsDef;
    };
    panels?: ChartToolPanelName[];
    defaultToolPanel?: ChartToolPanelName;
};
export declare type ChartType = 'column' | 'groupedColumn' | 'stackedColumn' | 'normalizedColumn' | 'bar' | 'groupedBar' | 'stackedBar' | 'normalizedBar' | 'line' | 'scatter' | 'bubble' | 'pie' | 'doughnut' | 'area' | 'stackedArea' | 'normalizedArea' | 'histogram' | 'columnLineCombo' | 'areaColumnCombo' | 'customCombo';
export declare type CrossFilterChartType = 'column' | 'bar' | 'line' | 'scatter' | 'bubble' | 'pie' | 'doughnut' | 'area';
export declare type ChartToolPanelMenuOptions = 'chartSettings' | 'chartData' | 'chartFormat';
export declare type ChartToolbarMenuItemOptions = 'chartLink' | 'chartUnlink' | 'chartDownload';
export declare type ChartMenuOptions = ChartToolPanelMenuOptions | ChartToolbarMenuItemOptions;
export declare const CHART_TOOL_PANEL_ALLOW_LIST: ChartToolPanelMenuOptions[];
export declare const CHART_TOOLBAR_ALLOW_LIST: ChartMenuOptions[];
export declare const CHART_TOOL_PANEL_MENU_OPTIONS: {
    [key in ChartToolPanelName]: ChartToolPanelMenuOptions;
};
export interface SeriesChartType {
    colId: string;
    chartType: ChartType;
    secondaryAxis?: boolean;
}
