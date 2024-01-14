import { MiniStackedColumn } from "./miniStackedColumn";
import { ChartType } from "@ag-grid-community/core";
export declare class MiniNormalizedColumn extends MiniStackedColumn {
    static chartType: ChartType;
    static data: number[][];
    constructor(container: HTMLElement, fills: string[], strokes: string[]);
}
