import { CaptionOptions, ChartOptions, ChartType, ColumnApi, DropShadowOptions, EventService, FontOptions, GridApi, PaddingOptions, ProcessChartOptionsParams, SeriesOptions, AgChartThemeOverrides } from "@ag-grid-community/core";
import { AgChartTheme, AgChartThemePalette, Chart, ChartTheme } from "ag-charts-community";
export interface ChartProxyParams {
    chartId: string;
    chartType: ChartType;
    chartThemeName?: string;
    customChartThemes?: {
        [name: string]: AgChartTheme;
    };
    width?: number;
    height?: number;
    parentElement: HTMLElement;
    grouping: boolean;
    document: Document;
    processChartOptions: (params: ProcessChartOptionsParams) => ChartOptions<SeriesOptions>;
    getChartThemeName: () => string;
    getChartThemes: () => string[];
    getGridOptionsChartThemeOverrides: () => AgChartThemeOverrides | undefined;
    apiChartThemeOverrides?: AgChartThemeOverrides;
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
        chartDataType?: string;
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
    protected customPalette: AgChartThemePalette;
    protected chartOptions: TOptions;
    protected chartTheme: ChartTheme;
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
    private paletteOverridden;
    private initChartTheme;
    lookupCustomChartTheme(name: string): AgChartTheme;
    isStockTheme(themeName: string): boolean;
    private mergeThemeOverrides;
    private integratedToStandaloneChartType;
    private overridePalette;
    protected getStandaloneChartType(): string;
    protected getDefaultOptionsFromTheme(theme: ChartTheme): TOptions;
    private getSelectedTheme;
    getChartOptions(): TOptions;
    getCustomPalette(): AgChartThemePalette | undefined;
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
    protected getPredefinedPalette(): AgChartThemePalette;
    protected getPalette(): AgChartThemePalette;
    protected getDefaultChartOptions(): ChartOptions<SeriesOptions>;
    protected transformData(data: any[], categoryKey: string): any[];
    destroy(): void;
    protected destroyChart(): void;
}
