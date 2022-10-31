import { AgPolarSeriesTheme, AgChartThemePalette, AgChartThemeOptions, AgCartesianThemeOptions, AgPolarThemeOptions, AgHierarchyThemeOptions, AgCartesianSeriesTheme, AgHierarchySeriesTheme } from '../agChartOptions';
declare function arrayMerge(_target: any, source: any, _options: any): any;
declare function isMergeableObject(value: any): boolean;
export declare const mergeOptions: {
    arrayMerge: typeof arrayMerge;
    isMergeableObject: typeof isMergeableObject;
};
export declare type ChartThemeDefaults = {
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
export declare class ChartTheme {
    readonly palette: AgChartThemePalette;
    protected getPalette(): AgChartThemePalette;
    readonly config: any;
    private static fontFamily;
    private static getAxisDefaults;
    private static getSeriesDefaults;
    private static getBarSeriesDefaults;
    private static getLineSeriesDefaults;
    private static getCartesianSeriesMarkerDefaults;
    private static getChartDefaults;
    private static readonly cartesianDefaults;
    private static readonly polarDefaults;
    private static readonly hierarchyDefaults;
    static readonly defaults: ChartThemeDefaults;
    constructor(options?: AgChartThemeOptions);
    private static cartesianSeriesTypes;
    private static polarSeriesTypes;
    private static hierarchySeriesTypes;
    private static seriesTypes;
    private createChartConfigPerSeries;
    getConfig<T = any>(path: string, defaultValue?: T): T;
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
