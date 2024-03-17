export interface ChartGroupsDef {
    columnGroup?: ('column' | 'stackedColumn' | 'normalizedColumn')[];
    barGroup?: ('bar' | 'stackedBar' | 'normalizedBar')[];
    pieGroup?: ('pie' | 'donut' | 'doughnut')[];
    lineGroup?: ('line')[];
    scatterGroup?: ('scatter' | 'bubble')[];
    areaGroup?: ('area' | 'stackedArea' | 'normalizedArea')[];
    combinationGroup?: ('columnLineCombo' | 'areaColumnCombo' | 'customCombo')[];
    polarGroup?: ('radarLine' | 'radarArea' | 'nightingale' | 'radialColumn' | 'radialBar')[];
    statisticalGroup?: ('boxPlot' | 'histogram' | 'rangeBar' | 'rangeArea')[];
    hierarchicalGroup?: ('treemap' | 'sunburst')[];
    specializedGroup?: ('heatmap' | 'waterfall')[];
}
export type ChartToolPanelName = 'settings' | 'data' | 'format';
export interface ChartSettingsPanel {
    /** Chart groups customisations for which charts are displayed in the chart panel */
    chartGroupsDef?: ChartGroupsDef;
}
export type ChartFormatPanelGroup = 'chart' | 'legend' | 'axis' | 'horizontalAxis' | 'verticalAxis' | 'series' | 'navigator';
export type ChartDataPanelGroup = 'categories' | 'series' | 'seriesChartType';
export interface ChartPanelGroupDef<GroupType> {
    /** The panel group type */
    type: GroupType;
    /** Whether the panel group is open by default. If not specified, it is closed */
    isOpen?: boolean;
}
export interface ChartFormatPanel {
    /** The format panel group configurations, their order and whether they are shown. If not specified shows all groups */
    groups?: ChartPanelGroupDef<ChartFormatPanelGroup>[];
}
export interface ChartDataPanel {
    /** The data panel group configurations, their order and whether they are shown. If not specified shows all groups */
    groups?: ChartPanelGroupDef<ChartDataPanelGroup>[];
}
export interface ChartToolPanelsDef {
    /** Customisations for the chart panel and chart menu items in the Context Menu. */
    settingsPanel?: ChartSettingsPanel;
    /** Customisations for the format panel */
    formatPanel?: ChartFormatPanel;
    /** Customisations for the data panel */
    dataPanel?: ChartDataPanel;
    /** The ordered list of panels to show in the chart tool panels. If none specified, all panels are shown */
    panels?: ChartToolPanelName[];
    /** The panel to open by default when the chart loads. If none specified, the tool panel is hidden by default and the first panel is open when triggered. */
    defaultToolPanel?: ChartToolPanelName;
}
export type ChartType = 'column' | 'groupedColumn' | 'stackedColumn' | 'normalizedColumn' | 'bar' | 'groupedBar' | 'stackedBar' | 'normalizedBar' | 'line' | 'scatter' | 'bubble' | 'pie' | 'donut' | 'doughnut' | 'area' | 'stackedArea' | 'normalizedArea' | 'histogram' | 'radarLine' | 'radarArea' | 'nightingale' | 'radialColumn' | 'radialBar' | 'sunburst' | 'rangeBar' | 'rangeArea' | 'boxPlot' | 'treemap' | 'sunburst' | 'heatmap' | 'waterfall' | 'columnLineCombo' | 'areaColumnCombo' | 'customCombo';
export type CrossFilterChartType = 'column' | 'bar' | 'line' | 'scatter' | 'bubble' | 'pie' | 'donut' | 'doughnut' | 'area';
export type ChartToolPanelMenuOptions = 'chartSettings' | 'chartData' | 'chartFormat';
export type ChartToolbarMenuItemOptions = 'chartLink' | 'chartUnlink' | 'chartDownload' | 'chartMenu';
export type ChartMenuOptions = ChartToolPanelMenuOptions | ChartToolbarMenuItemOptions;
export interface SeriesChartType {
    colId: string;
    chartType: ChartType;
    secondaryAxis?: boolean;
}
