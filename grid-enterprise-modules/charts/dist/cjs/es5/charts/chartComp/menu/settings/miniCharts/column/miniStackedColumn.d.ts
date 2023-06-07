import { MiniChartWithAxes } from "../miniChartWithAxes";
import { ChartType } from "@ag-grid-community/core";
export declare class MiniStackedColumn extends MiniChartWithAxes {
    static chartType: ChartType;
    private readonly stackedColumns;
    static data: number[][];
    constructor(container: HTMLElement, fills: string[], strokes: string[], data?: number[][], yScaleDomain?: number[], tooltipName?: string);
    updateColors(fills: string[], strokes: string[]): void;
}
