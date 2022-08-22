import { AgChartThemeOverrides, ChartType, SeriesChartType } from "@ag-grid-community/core";
import { AgChartTheme, AgChartThemePalette, Chart, ChartTheme } from "ag-charts-community";
import { CrossFilteringContext } from "../../chartService";
import { ChartSeriesType } from "../utils/seriesTypeMapper";
export interface ChartProxyParams {
    chartType: ChartType;
    customChartThemes?: {
        [name: string]: AgChartTheme;
    };
    parentElement: HTMLElement;
    grouping: boolean;
    getChartThemeName: () => string;
    getChartThemes: () => string[];
    getGridOptionsChartThemeOverrides: () => AgChartThemeOverrides | undefined;
    apiChartThemeOverrides?: AgChartThemeOverrides;
    crossFiltering: boolean;
    crossFilterCallback: (event: any, reset?: boolean) => void;
    chartOptionsToRestore?: AgChartThemeOverrides;
    chartPaletteToRestore?: AgChartThemePalette;
    seriesChartTypes: SeriesChartType[];
}
export interface FieldDefinition {
    colId: string;
    displayName: string | null;
}
export interface UpdateChartParams {
    data: any[];
    grouping: boolean;
    category: {
        id: string;
        name: string;
        chartDataType?: string;
    };
    fields: FieldDefinition[];
    chartId?: string;
    getCrossFilteringContext: () => CrossFilteringContext;
    seriesChartTypes: SeriesChartType[];
}
export declare abstract class ChartProxy {
    protected readonly chartProxyParams: ChartProxyParams;
    protected readonly chartType: ChartType;
    protected readonly standaloneChartType: ChartSeriesType;
    protected chart: Chart;
    protected chartOptions: AgChartThemeOverrides;
    protected chartTheme: ChartTheme;
    protected crossFiltering: boolean;
    protected crossFilterCallback: (event: any, reset?: boolean) => void;
    private readonly chartPalette;
    protected constructor(chartProxyParams: ChartProxyParams);
    abstract crossFilteringReset(): void;
    protected abstract createChart(options?: AgChartThemeOverrides): Chart;
    abstract update(params: UpdateChartParams): void;
    recreateChart(): void;
    getChart(): Chart;
    private createChartTheme;
    isStockTheme(themeName: string): boolean;
    private getSelectedTheme;
    lookupCustomChartTheme(name: string): AgChartTheme | undefined;
    private static mergeThemeOverrides;
    downloadChart(): void;
    getChartImageDataURL(type?: string): string;
    getChartOptions(): AgChartThemeOverrides;
    getChartPalette(): AgChartThemePalette | undefined;
    protected transformData(data: any[], categoryKey: string, categoryAxis?: boolean): any[];
    protected getCommonChartOptions(): {
        padding: any;
        background: any;
        title: any;
        subtitle: any;
        tooltip: any;
        legend: any;
        navigator: any;
    };
    private convertConfigToOverrides;
    destroy(): void;
    protected destroyChart(): void;
}
