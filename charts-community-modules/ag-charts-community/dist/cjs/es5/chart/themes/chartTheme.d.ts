import { AgPolarSeriesTheme, AgChartThemePalette, AgChartThemeOptions, AgCartesianThemeOptions, AgPolarThemeOptions, AgHierarchyThemeOptions, AgCartesianSeriesTheme, AgHierarchySeriesTheme, AgChartInteractionRange } from '../agChartOptions';
declare type ChartThemeDefaults = {
    cartesian: AgCartesianThemeOptions;
    groupedCategory: AgCartesianThemeOptions;
    polar: AgPolarThemeOptions;
    hierarchy: AgHierarchyThemeOptions;
} & {
    [key in keyof AgCartesianSeriesTheme]?: AgCartesianThemeOptions;
} & {
    [key in keyof AgPolarSeriesTheme]?: AgPolarThemeOptions;
} & {
    [key in keyof AgHierarchySeriesTheme]?: AgHierarchyThemeOptions;
};
export interface ChartThemeParams {
    seriesDefaults: any;
    defaultFontFamily: string;
}
export declare class ChartTheme {
    readonly palette: AgChartThemePalette;
    protected getPalette(): AgChartThemePalette;
    readonly config: any;
    static fontFamily: string;
    private static getAxisDefaults;
    static getSeriesDefaults(): {
        tooltip: {
            enabled: boolean;
            renderer: undefined;
        };
        visible: boolean;
        showInLegend: boolean;
        highlightStyle: {
            item: {
                fill: string;
                fillOpacity: number;
            };
            series: {
                dimOpacity: number;
            };
            text: {
                color: string;
            };
        };
        nodeClickRange: AgChartInteractionRange;
    };
    private static getBarSeriesDefaults;
    private static getLineSeriesDefaults;
    private static getAreaSeriesDefaults;
    private static getScatterSeriesDefaults;
    private static getCartesianSeriesMarkerDefaults;
    private static getChartDefaults;
    static seriesThemeOverrides: Record<string, (params: ChartThemeParams) => any>;
    private static readonly cartesianDefaults;
    private static readonly polarDefaults;
    private static readonly hierarchyDefaults;
    private static readonly defaults;
    constructor(options?: AgChartThemeOptions);
    private createChartConfigPerChartType;
    /**
     * Meant to be overridden in subclasses. For example:
     * ```
     *     getDefaults() {
     *         const subclassDefaults = { ... };
     *         return this.mergeWithParentDefaults(subclassDefaults);
     *     }
     * ```
     */
    protected getDefaults(): ChartThemeDefaults;
    protected mergeWithParentDefaults(parentDefaults: ChartThemeDefaults, defaults: ChartThemeDefaults): ChartThemeDefaults;
}
export {};
