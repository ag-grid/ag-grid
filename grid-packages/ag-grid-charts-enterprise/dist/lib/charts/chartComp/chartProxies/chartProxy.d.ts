import { AgChartTheme as GridAgChartTheme, ChartType, SeriesChartType } from "ag-grid-community";
import { AgChartInstance, AgChartTheme, AgChartThemeOverrides, AgChartThemePalette } from "ag-charts-community";
import { CrossFilteringContext } from "../../chartService";
import { ChartSeriesType } from "../utils/seriesTypeMapper";
export interface ChartProxyParams {
    chartInstance?: AgChartInstance;
    chartType: ChartType;
    customChartThemes?: {
        [name: string]: AgChartTheme | GridAgChartTheme;
    };
    parentElement: HTMLElement;
    grouping: boolean;
    getChartThemeName: () => string;
    getChartThemes: () => string[];
    getGridOptionsChartThemeOverrides: () => AgChartThemeOverrides | undefined;
    getExtraPaddingDirections: () => ExtraPaddingDirection[];
    apiChartThemeOverrides?: AgChartThemeOverrides;
    crossFiltering: boolean;
    crossFilterCallback: (event: any, reset?: boolean) => void;
    chartThemeToRestore?: string;
    chartOptionsToRestore?: AgChartThemeOverrides;
    chartPaletteToRestore?: AgChartThemePalette;
    seriesChartTypes: SeriesChartType[];
    translate: (toTranslate: string, defaultText?: string) => string;
}
export declare type ExtraPaddingDirection = 'top' | 'right' | 'bottom' | 'left';
export interface FieldDefinition {
    colId: string;
    displayName: string | null;
}
export interface UpdateParams {
    data: any[];
    grouping: boolean;
    categories: {
        id: string;
        name: string;
        chartDataType?: string;
    }[];
    fields: FieldDefinition[];
    chartId?: string;
    getCrossFilteringContext: () => CrossFilteringContext;
    seriesChartTypes: SeriesChartType[];
    updatedOverrides?: AgChartThemeOverrides;
}
export declare abstract class ChartProxy {
    protected readonly chartProxyParams: ChartProxyParams;
    protected readonly chartType: ChartType;
    protected readonly standaloneChartType: ChartSeriesType;
    protected readonly chart: AgChartInstance;
    protected readonly crossFiltering: boolean;
    protected readonly crossFilterCallback: (event: any, reset?: boolean) => void;
    protected clearThemeOverrides: boolean;
    protected constructor(chartProxyParams: ChartProxyParams);
    abstract crossFilteringReset(): void;
    abstract update(params: UpdateParams): void;
    getChart(): import("../utils/integration").AgChartActual;
    getChartRef(): AgChartInstance;
    downloadChart(dimensions?: {
        width: number;
        height: number;
    }, fileName?: string, fileFormat?: string): void;
    getChartImageDataURL(type?: string): string;
    private getChartOptions;
    getChartThemeOverrides(): AgChartThemeOverrides;
    getChartPalette(): AgChartThemePalette | undefined;
    setPaired(paired: boolean): void;
    isPaired(): boolean;
    lookupCustomChartTheme(themeName: string): AgChartTheme;
    protected transformData(data: any[], categoryKey: string, categoryAxis?: boolean): any[];
    protected getCommonChartOptions(updatedOverrides?: AgChartThemeOverrides): any;
    /**
     * Retrieve default theme overrides for the current chart type
     */
    protected getChartThemeDefaults(): AgChartThemeOverrides | undefined;
    private getActiveFormattingPanelOverrides;
    destroy({ keepChartInstance }?: {
        keepChartInstance?: boolean | undefined;
    }): AgChartInstance | undefined;
    protected destroyChart(): void;
}
