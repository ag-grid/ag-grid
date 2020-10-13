import { ChartType } from "@ag-grid-community/core";
import { MiniStackedArea } from "./miniStackedArea";
export declare class MiniNormalizedArea extends MiniStackedArea {
    static chartType: ChartType;
    static readonly data: number[][];
    constructor(container: HTMLElement, fills: string[], strokes: string[], data?: number[][]);
}
