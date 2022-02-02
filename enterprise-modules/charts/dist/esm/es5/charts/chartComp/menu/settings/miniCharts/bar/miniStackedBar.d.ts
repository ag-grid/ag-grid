import { MiniChartWithAxes } from "../miniChartWithAxes";
import { ChartType } from "@ag-grid-community/core";
export declare class MiniStackedBar extends MiniChartWithAxes {
    static chartType: ChartType;
    static data: number[][];
    private readonly bars;
    constructor(container: HTMLElement, fills: string[], strokes: string[], data?: number[][], xScaleDomain?: number[], tooltipName?: string);
    updateColors(fills: string[], strokes: string[]): void;
}
