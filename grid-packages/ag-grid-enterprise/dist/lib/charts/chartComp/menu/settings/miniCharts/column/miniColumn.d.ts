import { MiniChartWithAxes } from "../miniChartWithAxes";
import { ChartType } from "ag-grid-community";
export declare class MiniColumn extends MiniChartWithAxes {
    static chartType: ChartType;
    private readonly columns;
    private columnData;
    constructor(container: HTMLElement, fills: string[], strokes: string[]);
    updateColors(fills: string[], strokes: string[]): void;
}
