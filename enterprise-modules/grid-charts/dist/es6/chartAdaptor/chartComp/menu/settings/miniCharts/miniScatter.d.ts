import { ChartType } from "@ag-grid-community/core";
import { MiniChartWithAxes } from "./miniChartWithAxes";
export declare class MiniScatter extends MiniChartWithAxes {
    static chartType: ChartType;
    private readonly points;
    constructor(parent: HTMLElement, fills: string[], strokes: string[]);
    updateColors(fills: string[], strokes: string[]): void;
}
