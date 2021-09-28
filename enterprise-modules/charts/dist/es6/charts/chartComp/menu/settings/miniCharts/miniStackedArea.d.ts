import { ChartType } from "@ag-grid-community/core";
import { MiniChartWithAxes } from "./miniChartWithAxes";
export declare class MiniStackedArea extends MiniChartWithAxes {
    static chartType: ChartType;
    static readonly data: number[][];
    private readonly areas;
    constructor(container: HTMLElement, fills: string[], strokes: string[], data?: number[][], tooltipName?: string);
    updateColors(fills: string[], strokes: string[]): void;
}
