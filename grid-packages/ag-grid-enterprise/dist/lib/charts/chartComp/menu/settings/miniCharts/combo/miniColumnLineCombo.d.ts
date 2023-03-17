import { MiniChartWithAxes } from "../miniChartWithAxes";
import { ChartType } from "ag-grid-community";
export declare class MiniColumnLineCombo extends MiniChartWithAxes {
    static chartType: ChartType;
    private columns;
    private lines;
    private columnData;
    private lineData;
    constructor(container: HTMLElement, fills: string[], strokes: string[]);
    updateColors(fills: string[], strokes: string[]): void;
}
