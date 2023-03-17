import { MiniChartWithAxes } from "../miniChartWithAxes";
import { ChartType } from "ag-grid-community";
export interface Coordinate {
    x: number;
    y: number;
}
export declare class MiniAreaColumnCombo extends MiniChartWithAxes {
    static chartType: ChartType;
    private columns;
    private areas;
    private columnData;
    private areaData;
    constructor(container: HTMLElement, fills: string[], strokes: string[]);
    updateColors(fills: string[], strokes: string[]): void;
}
