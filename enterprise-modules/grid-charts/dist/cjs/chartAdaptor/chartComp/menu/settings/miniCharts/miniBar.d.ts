import { ChartType } from "@ag-community/grid-core";
import { MiniChartWithAxes } from "./miniChartWithAxes";
export declare class MiniBar extends MiniChartWithAxes {
    static chartType: ChartType;
    private readonly bars;
    constructor(parent: HTMLElement, fills: string[], strokes: string[]);
    updateColors(fills: string[], strokes: string[]): void;
}
