import { AgChartThemePalette, AgChartThemeOptions } from "../agChartOptions";
import { Series } from "../series/series";
export declare class ChartTheme {
    readonly palette: AgChartThemePalette;
    protected getPalette(): AgChartThemePalette;
    private readonly config;
    private static fontFamily;
    private static getAxisDefaults;
    private static getSeriesDefaults;
    private static getBarSeriesDefaults;
    private static getCartesianSeriesMarkerDefaults;
    private static getChartDefaults;
    private static readonly cartesianDefaults;
    static readonly defaults: any;
    constructor(options?: AgChartThemeOptions);
    private static cartesianSeriesTypes;
    private static polarSeriesTypes;
    private static seriesTypes;
    private createChartConfigPerSeries;
    getConfig<T = any>(path: string): T;
    /**
     * Meant to be overridden in subclasses. For example:
     * ```
     *     getDefaults() {
     *         const subclassDefaults = { ... };
     *         return this.mergeWithParentDefaults(subclassDefaults);
     *     }
     * ```
     */
    protected getDefaults(): any;
    protected mergeWithParentDefaults(defaults: any): any;
    setSeriesColors(series: Series, seriesOptions: any, firstColorIndex: number): number;
    /**
     * This would typically correspond to the number of dependent variables the series plots.
     * If the color count is not fixed, for example it's data-dependent with one color per data point,
     * return Infinity to fetch all unique colors and manage them in the series.
     */
    getSeriesColorCount(seriesOptions: any): number;
}
