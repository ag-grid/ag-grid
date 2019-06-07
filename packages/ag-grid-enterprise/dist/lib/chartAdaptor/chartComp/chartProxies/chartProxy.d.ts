// ag-grid-enterprise v21.0.1
import { ChartOptions, ChartType, ProcessChartOptionsParams } from "ag-grid-community";
import { Chart } from "../../../charts/chart/chart";
import { Palette } from "../../../charts/chart/palettes";
export interface ChartProxyParams {
    chartType: ChartType;
    processChartOptions: (params: ProcessChartOptionsParams) => ChartOptions;
    getSelectedPalette: () => Palette;
    isDarkTheme: () => boolean;
    width: number;
    height: number;
    parentElement: HTMLElement;
}
export interface UpdateChartParams {
    categoryId: string;
    fields: {
        colId: string;
        displayName: string;
    }[];
    data: any[];
}
export declare abstract class ChartProxy {
    protected static darkLabelColour: string;
    protected static lightLabelColour: string;
    protected static darkAxisColour: string;
    protected static lightAxisColour: string;
    protected chart: Chart;
    protected chartProxyParams: ChartProxyParams;
    protected overriddenPalette: Palette;
    protected constructor(options: ChartProxyParams);
    abstract update(params: UpdateChartParams): void;
    getChart(): Chart;
    protected getLabelColor(): string;
    protected getAxisGridColor(): string;
    protected getChartOptions(type: string, options: ChartOptions): ChartOptions;
    private overridePalette;
    destroy(): void;
}
