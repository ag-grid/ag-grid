import { ChartType } from "@ag-grid-community/core";
import { MiniChartWithAxes } from "./miniChartWithAxes";
export declare class MiniStackedColumn extends MiniChartWithAxes {
    static chartType: ChartType;
    static data: number[][];
    private readonly bars;
    constructor(container: HTMLElement, fills: string[], strokes: string[], data?: number[][], yScaleDomain?: number[], tooltipName?: string);
    updateColors(fills: string[], strokes: string[]): void;
}
