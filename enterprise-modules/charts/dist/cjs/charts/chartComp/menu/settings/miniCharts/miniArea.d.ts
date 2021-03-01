import { ChartType } from "@ag-grid-community/core";
import { MiniChartWithAxes } from "./miniChartWithAxes";
export interface ICoordinate {
    x: number;
    y: number;
}
export declare class MiniArea extends MiniChartWithAxes {
    static chartType: ChartType;
    private readonly areas;
    static readonly data: number[][];
    constructor(container: HTMLElement, fills: string[], strokes: string[], data?: number[][]);
    updateColors(fills: string[], strokes: string[]): void;
}
