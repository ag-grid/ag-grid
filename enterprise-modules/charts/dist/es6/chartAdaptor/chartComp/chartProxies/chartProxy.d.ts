import { CaptionOptions, ChartOptions, ChartType, DropShadowOptions, EventService, FontOptions, PaddingOptions, ProcessChartOptionsParams, SeriesOptions, GridApi, ColumnApi } from "@ag-grid-community/core";
import { Chart, ChartPalette, ChartPaletteName } from "ag-charts-community";
export interface ChartProxyParams {
    chartId: string;
    chartType: ChartType;
    width?: number;
    height?: number;
    parentElement: HTMLElement;
    grouping: boolean;
    document: Document;
    processChartOptions: (params: ProcessChartOptionsParams) => ChartOptions<SeriesOptions>;
    getChartPaletteName: () => ChartPaletteName;
    allowPaletteOverride: boolean;
    isDarkTheme: () => boolean;
    eventService: EventService;
    gridApi: GridApi;
    columnApi: ColumnApi;
}
export interface FieldDefinition {
    colId: string;
    displayName: string;
}
export interface UpdateChartParams {
    data: any[];
    grouping: boolean;
    category: {
        id: string;
        name: string;
    };
    fields: FieldDefinition[];
}
export declare abstract class ChartProxy<TChart extends Chart, TOptions extends ChartOptions<any>> {
    protected readonly chartProxyParams: ChartProxyParams;
    protected readonly chartId: string;
    protected readonly chartType: ChartType;
    protected readonly eventService: EventService;
    private readonly gridApi;
    private readonly columnApi;
    protected chart: TChart;
    protected customPalette: ChartPalette;
    protected chartOptions: TOptions;
    protected constructor(chartProxyParams: ChartProxyParams);
    protected abstract createChart(options?: TOptions): TChart;
    recreateChart(options?: TOptions): void;
    abstract update(params: UpdateChartParams): void;
    getChart(): TChart;
    downloadChart(): void;
    getChartImageDataURL(type?: string): string;
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
    getTitleOption(property: keyof CaptionOptions): any;
    getChartPaddingOption: (property: "left" | "right" | "top" | "bottom") => string;
    setChartPaddingOption(property: keyof PaddingOptions, value: number): void;
    getShadowEnabled: () => boolean;
    getShadowProperty(property: keyof DropShadowOptions): any;
    setShadowProperty(property: keyof DropShadowOptions, value: any): void;
    raiseChartOptionsChangedEvent(): void;
    protected getDefaultFontOptions(): FontOptions;
    protected getDefaultDropShadowOptions(): DropShadowOptions;
    protected getPredefinedPalette(): ChartPalette;
    protected getPalette(): ChartPalette;
    protected getDefaultChartOptions(): ChartOptions<SeriesOptions>;
    protected transformData(data: any[], categoryKey: string): any[];
    destroy(): void;
    protected destroyChart(): void;
}
