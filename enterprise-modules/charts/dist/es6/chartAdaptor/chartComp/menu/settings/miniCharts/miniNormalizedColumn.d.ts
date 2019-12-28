import { ChartType } from "@ag-grid-community/core";
import { MiniStackedColumn } from "./miniStackedColumn";
export declare class MiniNormalizedColumn extends MiniStackedColumn {
    static chartType: ChartType;
    static data: number[][];
    constructor(parent: HTMLElement, fills: string[], strokes: string[]);
}
