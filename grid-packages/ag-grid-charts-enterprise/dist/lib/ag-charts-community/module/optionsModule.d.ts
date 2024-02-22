import { type SeriesOptions } from '../chart/factory/seriesTypes';
import type { ChartTheme } from '../chart/themes/chartTheme';
import type { AgChartOptions } from '../options/chart/chartBuilderOptions';
import type { BaseModule, ModuleInstance } from './baseModule';
import type { AxisContext, ModuleContextWithParent } from './moduleContext';
type AxisType = 'category' | 'number' | 'log' | 'time';
export interface AxisOptionModule<M extends ModuleInstance = ModuleInstance> extends BaseModule {
    type: 'axis-option';
    axisTypes: AxisType[];
    instanceConstructor: new (ctx: ModuleContextWithParent<AxisContext>) => M;
    themeTemplate: {
        [K in AxisType]?: object;
    };
}
interface ChartSpecialOverrides {
    document: Document;
    window: Window;
    overrideDevicePixelRatio?: number;
    sceneMode?: 'simple';
}
type GroupingOptions = {
    grouped?: boolean;
    stacked?: boolean;
    stackGroup?: string;
    seriesGrouping?: {
        groupIndex: number;
        groupCount: number;
        stackIndex: number;
        stackCount: number;
    };
};
type GroupingSeriesOptions = SeriesOptions & GroupingOptions & {
    xKey?: string;
};
type SeriesGroup = {
    groupType: GroupingType;
    seriesType: string;
    series: GroupingSeriesOptions[];
};
declare enum GroupingType {
    DEFAULT = "default",
    STACK = "stack",
    GROUP = "group"
}
export declare class ChartOptions<T extends AgChartOptions = AgChartOptions> {
    activeTheme: ChartTheme;
    processedOptions: T;
    seriesDefaults: T;
    userOptions: Partial<T>;
    specialOverrides: ChartSpecialOverrides;
    constructor(userOptions: T, specialOverrides?: Partial<ChartSpecialOverrides>);
    getOptions(): T;
    diffOptions(options: T): Partial<T> | null;
    protected getSeriesThemeConfig(seriesType: string): any;
    protected getOptionsDefaults(options: T): T;
    protected optionsType(options: Partial<T>): "area" | "line" | "bar" | "scatter" | "box-plot" | "bubble" | "bullet" | "heatmap" | "histogram" | "range-area" | "range-bar" | "waterfall" | "sunburst" | "treemap" | "donut" | "radial-column" | "nightingale" | "pie" | "radar-line" | "radar-area" | "radial-bar";
    protected sanityCheckAndCleanup(options: Partial<T>): void;
    protected swapAxesPosition(options: T): void;
    protected processAxesOptions(options: T, axesThemes: any): void;
    protected processSeriesOptions(options: T): void;
    protected getSeriesPalette(seriesType: string, options: {
        colourIndex: number;
        userPalette: boolean;
    }): import("./coreModulesTypes").SeriesPaletteOptions<"area" | "line" | "bar" | "scatter" | "box-plot" | "bubble" | "bullet" | "heatmap" | "histogram" | "range-area" | "range-bar" | "waterfall" | "sunburst" | "treemap" | "donut" | "radial-column" | "nightingale" | "pie" | "radar-line" | "radar-area" | "radial-bar", (import("../main").AgCartesianSeriesOptions | import("../main").AgHierarchySeriesOptions | import("../options/series/polar/polarOptions").AgPolarSeriesOptions) & {
        type: "area" | "line" | "bar" | "scatter" | "box-plot" | "bubble" | "bullet" | "heatmap" | "histogram" | "range-area" | "range-bar" | "waterfall" | "sunburst" | "treemap" | "donut" | "radial-column" | "nightingale" | "pie" | "radar-line" | "radar-area" | "radial-bar";
    }, "fill" | "stroke" | "fills" | "strokes" | "colors", "marker" | "calloutLine">;
    protected getSeriesGroupingOptions(series: SeriesOptions & GroupingOptions): {
        stacked: boolean;
        grouped: boolean;
    };
    protected setSeriesGroupingOptions(series: GroupingSeriesOptions[]): T["series"];
    protected getSeriesGroupId(series: GroupingSeriesOptions): string;
    protected getSeriesGrouping(series: GroupingSeriesOptions[]): SeriesGroup[];
    private getDefaultSeriesType;
    private getTooltipPositionDefaults;
    private deprecationWarnings;
    private axesTypeIntegrity;
    private seriesTypeIntegrity;
    private soloSeriesIntegrity;
    private enableConfiguredOptions;
    private removeDisabledOptions;
    private removeLeftoverSymbols;
    private specialOverridesDefaults;
}
export {};
