import { ChartType } from "@ag-grid-community/core";
import { MiniDoughnut } from "./miniDoughnut";
export declare class MiniPie extends MiniDoughnut {
    static chartType: ChartType;
    constructor(container: HTMLElement, fills: string[], strokes: string[]);
}
