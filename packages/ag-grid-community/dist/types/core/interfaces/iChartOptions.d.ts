export interface ChartGroupsDef {
    columnGroup?: ('column' | 'stackedColumn' | 'normalizedColumn')[];
    barGroup?: ('bar' | 'stackedBar' | 'normalizedBar')[];
    pieGroup?: ('pie' | 'donut' | 'doughnut')[];
    lineGroup?: 'line'[];
    scatterGroup?: ('scatter' | 'bubble')[];
    areaGroup?: ('area' | 'stackedArea' | 'normalizedArea')[];
    combinationGroup?: ('columnLineCombo' | 'areaColumnCombo' | 'customCombo')[];
    polarGroup?: ('radarLine' | 'radarArea' | 'nightingale' | 'radialColumn' | 'radialBar')[];
    statisticalGroup?: ('boxPlot' | 'histogram' | 'rangeBar' | 'rangeArea')[];
    hierarchicalGroup?: ('treemap' | 'sunburst')[];
    specializedGroup?: ('heatmap' | 'waterfall')[];
}
export type ChartToolPanelName = 'settings' | 'data' | 'format';
/** Configuration for the `Chart` panel */
export interface ChartSettingsPanel {
    /** Chart groups customisations for which charts are displayed in the chart panel */
    chartGroupsDef?: ChartGroupsDef;
}
export type ChartFormatPanelGroup = 'chart' | 'titles' | 'legend' | 'axis' | 'horizontalAxis' | 'verticalAxis' | 'series' | 'navigator';
export type ChartDataPanelGroup = 'categories' | 'series' | 'seriesChartType' | 'chartSpecific';
export interface ChartPanelGroupDef<GroupType> {
    /** The panel group type */
    type: GroupType;
    /** Whether the panel group is open by default. If not specified, it is closed */
    isOpen?: boolean;
}
/** Configuration for the `Customize` panel */
export interface ChartFormatPanel {
    /** The customize panel group configurations, their order and whether they are shown. If not specified shows all groups */
    groups?: ChartPanelGroupDef<ChartFormatPanelGroup>[];
}
/** Configuration for the `Set Up` panel */
export interface ChartDataPanel {
    /** The set up panel group configurations, their order and whether they are shown. If not specified shows all groups */
    groups?: ChartPanelGroupDef<ChartDataPanelGroup>[];
}
export interface ChartToolPanelsDef {
    /** Customisations for the chart panel and chart menu items in the Context Menu. */
    settingsPanel?: ChartSettingsPanel;
    /** Customisations for the customize panel */
    formatPanel?: ChartFormatPanel;
    /** Customisations for the set up panel */
    dataPanel?: ChartDataPanel;
    /** The ordered list of panels to show in the chart tool panels. If none specified, all panels are shown */
    panels?: ChartToolPanelName[];
    /** The panel to open by default when the chart loads. If none specified, the tool panel is hidden by default and the first panel is open when triggered. */
    defaultToolPanel?: ChartToolPanelName;
}
export type CrossFilterChartType = 'column' | 'bar' | 'line' | 'scatter' | 'bubble' | 'pie' | 'donut' | 'doughnut' | 'area';
export type ChartToolPanelMenuOptions = 'chartSettings' | 'chartData' | 'chartFormat';
export type ChartToolbarMenuItemOptions = 'chartLink' | 'chartUnlink' | 'chartDownload' | 'chartMenu';
export interface SeriesChartType {
    colId: string;
    chartType: ChartType;
    secondaryAxis?: boolean;
}
export declare class ChartMappings {
    static readonly CHART_TYPE_TO_SERIES_TYPE: {
        readonly column: "bar";
        readonly groupedColumn: "bar";
        readonly stackedColumn: "bar";
        readonly normalizedColumn: "bar";
        readonly bar: "bar";
        readonly groupedBar: "bar";
        readonly stackedBar: "bar";
        readonly normalizedBar: "bar";
        readonly line: "line";
        readonly scatter: "scatter";
        readonly bubble: "bubble";
        readonly pie: "pie";
        readonly donut: "donut";
        readonly doughnut: "donut";
        readonly area: "area";
        readonly stackedArea: "area";
        readonly normalizedArea: "area";
        readonly histogram: "histogram";
        readonly radarLine: "radar-line";
        readonly radarArea: "radar-area";
        readonly nightingale: "nightingale";
        readonly radialColumn: "radial-column";
        readonly radialBar: "radial-bar";
        readonly sunburst: "sunburst";
        readonly rangeBar: "range-bar";
        readonly rangeArea: "range-area";
        readonly boxPlot: "box-plot";
        readonly treemap: "treemap";
        readonly heatmap: "heatmap";
        readonly waterfall: "waterfall";
    };
    static readonly COMBO_CHART_TYPES: readonly ["columnLineCombo", "areaColumnCombo", "customCombo"];
    static readonly SERIES_GROUP_TYPES: readonly ["grouped", "stacked", "normalized"];
}
export type ChartType = keyof typeof ChartMappings.CHART_TYPE_TO_SERIES_TYPE | (typeof ChartMappings.COMBO_CHART_TYPES)[number];
export type SeriesGroupType = (typeof ChartMappings.SERIES_GROUP_TYPES)[number];
