import type { AgChartTheme, AgChartThemePalette } from '../../options/agChartOptions';
export declare function resolvePartialPalette(partialPalette: Partial<AgChartThemePalette> | null | undefined, basePalette: AgChartThemePalette): AgChartThemePalette | null;
export declare class ChartTheme {
    readonly palette: AgChartThemePalette;
    protected getPalette(): AgChartThemePalette;
    readonly config: any;
    private static getAxisDefaults;
    private static getSeriesDefaults;
    private static getCartesianSeriesMarkerDefaults;
    private static getLegendItemMarkerDefaults;
    private static getCaptionWrappingDefaults;
    private static getChartDefaults;
    private static readonly cartesianAxisDefault;
    constructor(options?: AgChartTheme);
    private createChartConfigPerChartType;
    private getDefaults;
    templateTheme<T>(themeTemplate: T): T;
    protected static getWaterfallSeriesDefaultPositiveColors(): {
        fill: string;
        stroke: string;
        label: {
            color: string;
        };
    };
    protected static getWaterfallSeriesDefaultNegativeColors(): {
        fill: string;
        stroke: string;
        label: {
            color: string;
        };
    };
    protected static getWaterfallSeriesDefaultTotalColors(): {
        fill: string;
        stroke: string;
        label: {
            color: string;
        };
    };
    getTemplateParameters(): {
        extensions: Map<any, any>;
        properties: Map<any, any>;
    };
}
