import { ChartType } from "@ag-grid-community/core";
import { MiniChartWithAxes } from "./miniChartWithAxes";
export declare class MiniLine extends MiniChartWithAxes {
    static chartType: ChartType;
    private readonly lines;
    constructor(parent: HTMLElement, fills: string[], strokes: string[]);
    updateColors(fills: string[], strokes: string[]): void;
}
