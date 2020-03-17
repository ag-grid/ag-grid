import { ChartType } from "@ag-grid-community/core";
import { MiniStackedBar } from "./miniStackedBar";
export declare class MiniNormalizedBar extends MiniStackedBar {
    static chartType: ChartType;
    static data: number[][];
    constructor(container: HTMLElement, fills: string[], strokes: string[]);
}
