import { MiniChartWithAxes } from "../miniChartWithAxes";
import { ChartType } from "ag-grid-community";
import { ThemeTemplateParameters } from "../../miniChartsContainer";
export declare class MiniStackedArea extends MiniChartWithAxes {
    static chartType: ChartType;
    static readonly data: number[][];
    private readonly areas;
    constructor(container: HTMLElement, fills: string[], strokes: string[], _themeTemplateParameters: ThemeTemplateParameters, _isCustomTheme: boolean, data?: number[][], tooltipName?: string);
    updateColors(fills: string[], strokes: string[]): void;
}
