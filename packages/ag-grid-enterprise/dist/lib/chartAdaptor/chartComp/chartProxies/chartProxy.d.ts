// ag-grid-enterprise v21.2.2
import { ChartOptions, ChartType, EventService, ProcessChartOptionsParams } from "ag-grid-community";
import { Chart, LegendPosition } from "../../../charts/chart/chart";
import { Palette } from "../../../charts/chart/palettes";
export interface ChartProxyParams {
    chartType: ChartType;
    processChartOptions: (params: ProcessChartOptionsParams) => ChartOptions;
    getSelectedPalette: () => Palette;
    isDarkTheme: () => boolean;
    width: number;
    height: number;
    parentElement: HTMLElement;
    eventService: EventService;
    categorySelected: boolean;
    grouping: boolean;
    document: Document;
}
export interface UpdateChartParams {
    data: any[];
    category: {
        id: string;
        name: string;
    };
    fields: {
        colId: string;
        displayName: string;
    }[];
}
export declare type ChartPaddingProperty = 'top' | 'right' | 'bottom' | 'left';
export declare type LegendProperty = 'enabled' | 'markerSize' | 'markerStrokeWidth' | 'markerPadding' | 'itemPaddingX' | 'itemPaddingY';
export declare type LegendFontProperty = 'labelFontFamily' | 'labelFontStyle' | 'labelFontWeight' | 'labelFontSize' | 'labelColor';
export declare type TitleFontProperty = 'fontFamily' | 'fontStyle' | 'fontWeight' | 'fontSize' | 'color';
export declare type ShadowProperty = 'enabled' | 'blur' | 'xOffset' | 'yOffset' | 'color';
export declare abstract class ChartProxy<T extends ChartOptions> {
    protected static darkLabelColour: string;
    protected static lightLabelColour: string;
    protected static darkAxisColour: string;
    protected static lightAxisColour: string;
    protected chart: Chart;
    protected chartProxyParams: ChartProxyParams;
    protected overriddenPalette: Palette;
    protected chartOptions: T;
    protected constructor(chartProxyParams: ChartProxyParams);
    abstract update(params: UpdateChartParams): void;
    getChart(): Chart;
    protected getLabelColor(): string;
    protected getAxisGridColor(): string;
    protected getBackgroundColor(): string;
    protected initChartOptions(type: ChartType, options: T): void;
    private overridePalette;
    setChartPaddingProperty(property: ChartPaddingProperty, value: number): void;
    getChartPadding(property: ChartPaddingProperty): string;
    setLegendProperty(property: LegendProperty | LegendFontProperty, value: any): void;
    getLegendProperty(property: LegendProperty | LegendFontProperty): string;
    getLegendEnabled(): boolean;
    setLegendPadding(padding: number): void;
    getLegendPadding(): string;
    setLegendPosition(position: LegendPosition): void;
    getLegendPosition(): string;
    setTitleProperty(property: TitleFontProperty, value: any): void;
    getTitleProperty(property: TitleFontProperty): string;
    getShadowEnabled(): boolean;
    getShadowProperty(property: ShadowProperty): any;
    setShadowProperty(property: ShadowProperty, value: any): void;
    protected raiseChartOptionsChangedEvent(): void;
    destroy(): void;
}
