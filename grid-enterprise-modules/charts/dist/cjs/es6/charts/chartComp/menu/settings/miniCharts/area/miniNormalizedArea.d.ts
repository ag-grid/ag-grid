import { MiniStackedArea } from "./miniStackedArea";
import { ChartType } from "@ag-grid-community/core";
export declare class MiniNormalizedArea extends MiniStackedArea {
    static chartType: ChartType;
    static readonly data: number[][];
    constructor(container: HTMLElement, fills: string[], strokes: string[], data?: number[][]);
}
