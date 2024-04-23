import { AgChartTheme as GridAgChartTheme, ChartType, SeriesChartType, SeriesGroupType } from "ag-grid-community";
import { AgChartInstance, AgChartOptions, AgChartTheme, AgChartThemeOverrides, AgChartThemePalette } from "ag-charts-community";
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
export type ExtraPaddingDirection = 'top' | 'right' | 'bottom' | 'left';
export interface FieldDefinition {
    colId: string;
    displayName: string | null;
}
export interface UpdateParams {
    data: any[];
    groupData?: any[];
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
    seriesGroupType?: SeriesGroupType;
}
export declare abstract class ChartProxy<TOptions extends AgChartOptions = AgChartOptions, TSeries extends ChartSeriesType = ChartSeriesType> {
    protected readonly chartProxyParams: ChartProxyParams;
    private readonly isEnterpriseCharts;
    protected readonly chartType: ChartType;
    protected readonly standaloneChartType: TSeries;
    protected readonly chart: AgChartInstance;
    protected readonly crossFiltering: boolean;
    protected readonly crossFilterCallback: (event: any, reset?: boolean) => void;
    protected clearThemeOverrides: boolean;
    protected constructor(chartProxyParams: ChartProxyParams);
    protected abstract getUpdateOptions(params: UpdateParams, commonChartOptions: TOptions): TOptions;
    crossFilteringReset(): void;
    update(params: UpdateParams): void;
    updateThemeOverrides(themeOverrides: AgChartThemeOverrides): void;
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
    getSeriesGroupType(): SeriesGroupType | undefined;
    protected transformCategoryData(data: any[], categoryKey: string): any[];
    private getCommonChartOptions;
    private getChartThemeDefaults;
    protected getSeriesChartThemeDefaults(): AgChartThemeOverrides[TSeries];
    private getActiveFormattingPanelOverrides;
    destroy({ keepChartInstance }?: {
        keepChartInstance?: boolean | undefined;
    }): AgChartInstance | undefined;
    protected destroyChart(): void;
}
