import { ChartType } from "@ag-grid-community/core";
import { MiniChartWithAxes } from "./miniChartWithAxes";
export declare class MiniColumn extends MiniChartWithAxes {
    static chartType: ChartType;
    private readonly bars;
    constructor(parent: HTMLElement, fills: string[], strokes: string[]);
    updateColors(fills: string[], strokes: string[]): void;
}
