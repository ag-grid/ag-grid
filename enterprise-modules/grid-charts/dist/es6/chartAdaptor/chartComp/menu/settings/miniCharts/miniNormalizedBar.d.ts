import { ChartType } from "@ag-grid-community/grid-core";
import { MiniStackedBar } from "./miniStackedBar";
export declare class MiniNormalizedBar extends MiniStackedBar {
    static chartType: ChartType;
    static data: number[][];
    constructor(parent: HTMLElement, fills: string[], strokes: string[]);
}
