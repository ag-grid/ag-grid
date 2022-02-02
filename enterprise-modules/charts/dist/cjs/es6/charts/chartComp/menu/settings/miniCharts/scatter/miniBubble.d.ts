import { MiniChartWithAxes } from "../miniChartWithAxes";
import { ChartType } from "@ag-grid-community/core";
export declare class MiniBubble extends MiniChartWithAxes {
    static chartType: ChartType;
    private readonly points;
    constructor(container: HTMLElement, fills: string[], strokes: string[]);
    updateColors(fills: string[], strokes: string[]): void;
}
