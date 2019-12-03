import { ChartOptions, ChartType, EventService, ProcessChartOptionsParams, SeriesOptions, PaddingOptions, DropShadowOptions, FontOptions, CaptionOptions } from "@ag-grid-community/core";
import { Chart } from "../../../charts/chart/chart";
import { ChartPalette, ChartPaletteName } from "../../../charts/chart/palettes";
export interface ChartProxyParams {
    chartType: ChartType;
    width?: number;
    height?: number;
    parentElement: HTMLElement;
    eventService: EventService;
    categorySelected: boolean;
    grouping: boolean;
    document: Document;
    processChartOptions: (params: ProcessChartOptionsParams) => ChartOptions<SeriesOptions>;
    getChartPaletteName: () => ChartPaletteName;
    allowPaletteOverride: boolean;
    isDarkTheme: () => boolean;
}
export interface FieldDefinition {
    colId: string;
    displayName: string;
}
export interface UpdateChartParams {
    data: any[];
    category: {
        id: string;
        name: string;
    };
    fields: FieldDefinition[];
}
export declare abstract class ChartProxy<TChart extends Chart, TOptions extends ChartOptions<any>> {
    protected chart: TChart;
    protected chartProxyParams: ChartProxyParams;
    protected customPalette: ChartPalette;
    protected chartType: ChartType;
    protected chartOptions: TOptions;
    protected constructor(chartProxyParams: ChartProxyParams);
    protected abstract createChart(options: TOptions): TChart;
    recreateChart(options?: TOptions): void;
    abstract update(params: UpdateChartParams): void;
    getChart: () => TChart;
    private isDarkTheme;
    protected getFontColor: () => string;
    protected getAxisGridColor: () => string;
    protected getBackgroundColor: () => string;
    protected abstract getDefaultOptions(): TOptions;
    protected initChartOptions(): void;
    private overridePalette;
    getChartOptions(): TOptions;
    getCustomPalette(): ChartPalette | undefined;
    getChartOption<T = string>(expression: string): T;
    setChartOption(expression: string, value: any): void;
    getSeriesOption<T = string>(expression: string): T;
    setSeriesOption(expression: string, value: any): void;
    setTitleOption(property: keyof CaptionOptions, value: any): void;
    getChartPaddingOption: (property: import("@ag-grid-community/core").LegendPosition) => string;
    setChartPaddingOption(property: keyof PaddingOptions, value: number): void;
    getShadowEnabled: () => boolean;
    getShadowProperty(property: keyof DropShadowOptions): any;
    setShadowProperty(property: keyof DropShadowOptions, value: any): void;
    protected raiseChartOptionsChangedEvent(): void;
    protected getDefaultFontOptions(): FontOptions;
    protected getDefaultDropShadowOptions(): DropShadowOptions;
    protected getPredefinedPalette(): ChartPalette;
    protected getPalette(): ChartPalette;
    protected getDefaultChartOptions(): ChartOptions<SeriesOptions>;
    protected transformData(data: any[], categoryKey: string): any[];
    destroy(): void;
    protected destroyChart(): void;
}
