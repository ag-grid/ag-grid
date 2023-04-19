import { MiniChartWithAxes } from "../miniChartWithAxes";
import { ChartType } from "@ag-grid-community/core";
export declare class MiniHistogram extends MiniChartWithAxes {
    static chartType: ChartType;
    private readonly bars;
    constructor(container: HTMLElement, fills: string[], strokes: string[]);
    updateColors([fill]: string[], [stroke]: string[]): void;
}
