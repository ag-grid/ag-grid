import type { AgPolarSeriesTheme, AgChartThemePalette, AgChartThemeOptions, AgCartesianThemeOptions, AgPolarThemeOptions, AgHierarchyThemeOptions, AgCartesianSeriesTheme, AgHierarchySeriesTheme, AgChartInteractionRange } from '../agChartOptions';
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
export declare const EXTENDS_AXES_DEFAULTS: unique symbol;
export declare const EXTENDS_AXES_LABEL_DEFAULTS: unique symbol;
export declare const EXTENDS_AXES_LINE_DEFAULTS: unique symbol;
export declare const EXTENDS_SERIES_DEFAULTS: unique symbol;
export declare const OVERRIDE_SERIES_LABEL_DEFAULTS: unique symbol;
export declare const DEFAULT_FONT_FAMILY: unique symbol;
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
    private static getCaptionWrappingDefaults;
    private static getChartDefaults;
    private static readonly cartesianDefaults;
    private static readonly polarDefaults;
    private static readonly hierarchyDefaults;
    private static readonly defaults;
    constructor(options?: AgChartThemeOptions);
    private createChartConfigPerChartType;
    protected getDefaults(): ChartThemeDefaults;
    protected templateTheme(themeTemplate: {}): {};
    protected getTemplateParameters(): {
        extensions: Map<any, any>;
        properties: Map<any, any>;
    };
    protected mergeWithParentDefaults(parentDefaults: ChartThemeDefaults, defaults: ChartThemeDefaults): ChartThemeDefaults;
}
export {};
//# sourceMappingURL=chartTheme.d.ts.map