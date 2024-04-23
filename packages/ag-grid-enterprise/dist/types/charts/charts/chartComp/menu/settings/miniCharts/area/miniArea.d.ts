import { MiniChartWithAxes } from "../miniChartWithAxes";
import { ChartType } from "ag-grid-community";
import { ThemeTemplateParameters } from "../../miniChartsContainer";
export interface ICoordinate {
    x: number;
    y: number;
}
export declare class MiniArea extends MiniChartWithAxes {
    static chartType: ChartType;
    private readonly areas;
    static readonly data: number[][];
    constructor(container: HTMLElement, fills: string[], strokes: string[], _themeTemplateParameters: ThemeTemplateParameters, _isCustomTheme: boolean, data?: number[][]);
    updateColors(fills: string[], strokes: string[]): void;
}
