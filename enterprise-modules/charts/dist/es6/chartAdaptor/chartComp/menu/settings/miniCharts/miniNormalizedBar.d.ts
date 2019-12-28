import { ChartType } from "@ag-grid-community/core";
import { MiniStackedBar } from "./miniStackedBar";
export declare class MiniNormalizedBar extends MiniStackedBar {
    static chartType: ChartType;
    static data: number[][];
    constructor(parent: HTMLElement, fills: string[], strokes: string[]);
}
