export interface ChartGroupsDef {
    columnGroup?: ('column' | 'stackedColumn' | 'normalizedColumn')[];
    barGroup?: ('bar' | 'stackedBar' | 'normalizedBar')[];
    pieGroup?: ('pie' | 'doughnut')[];
    lineGroup?: ('line')[];
    scatterGroup?: ('scatter' | 'bubble')[];
    areaGroup?: ('area' | 'stackedArea' | 'normalizedArea')[];
    histogramGroup?: ('histogram')[];
    combinationGroup?: ('columnLineCombo' | 'areaColumnCombo' | 'customCombo')[];
}
export declare const DEFAULT_CHART_GROUPS: ChartGroupsDef;
export declare type ChartToolPanelName = 'settings' | 'data' | 'format';
export interface ChartSettingsPanel {
    /** Chart groups customisations for which charts are displayed in the settings panel */
    chartGroupsDef?: ChartGroupsDef;
}
export declare type ChartFormatPanelGroup = 'chart' | 'legend' | 'axis' | 'series' | 'navigator';
export interface ChartFormatPanelGroupDef {
    /** The format panel group type */
    type: ChartFormatPanelGroup;
    /** Whether the format panel group is open by default. If not specified, it is closed */
    isOpen?: boolean;
}
export interface ChartFormatPanel {
    /** The format panel group configurations, their order and whether they are shown. If not specified shows all groups */
    groups?: ChartFormatPanelGroupDef[];
}
export interface ChartToolPanelsDef {
    /** Customisations for the settings panel */
    settingsPanel?: ChartSettingsPanel;
    /** Customisations for the format panel */
    formatPanel?: ChartFormatPanel;
    /** The ordered list of panels to show in the chart tool panels. If none specified, all panels are shown */
    panels?: ChartToolPanelName[];
    /** The panel to open by default when the chart loads. If none specified, the tool panel is hidden by default and the first panel is open when triggered. */
    defaultToolPanel?: ChartToolPanelName;
}
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
