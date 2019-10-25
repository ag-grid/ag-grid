import { ChartOptions, ChartType, EventService, ProcessChartOptionsParams, SeriesOptions, PaddingOptions, DropShadowOptions, FontOptions, CaptionOptions } from "@ag-community/grid-core";
import { Chart } from "../../../charts/chart/chart";
import { Palette } from "../../../charts/chart/palettes";
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
    getSelectedPalette: () => Palette;
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
    protected overriddenPalette: Palette;
    protected chartType: ChartType;
    protected chartOptions: TOptions;
    protected constructor(chartProxyParams: ChartProxyParams);
    abstract update(params: UpdateChartParams): void;
    getChart: () => TChart;
    private isDarkTheme;
    protected getLabelColor: () => string;
    protected getAxisGridColor: () => string;
    protected getBackgroundColor: () => string;
    protected abstract getDefaultOptions(): TOptions;
    protected initChartOptions(): void;
    private overridePalette;
    getChartOption<T = string>(expression: string): T;
    setChartOption(expression: string, value: any): void;
    getSeriesOption<T = string>(expression: string): T;
    setSeriesOption(expression: string, value: any): void;
    setTitleOption(property: keyof CaptionOptions, value: any): void;
    getChartPaddingOption: (property: import("@ag-community/grid-core").LegendPosition) => string;
    setChartPaddingOption(property: keyof PaddingOptions, value: number): void;
    getShadowEnabled: () => boolean;
    getShadowProperty(property: keyof DropShadowOptions): any;
    setShadowProperty(property: keyof DropShadowOptions, value: any): void;
    protected raiseChartOptionsChangedEvent(): void;
    protected getDefaultFontOptions(): FontOptions;
    protected getDefaultDropShadowOptions(): DropShadowOptions;
    protected getDefaultChartOptions(): ChartOptions<SeriesOptions>;
    destroy(): void;
}
