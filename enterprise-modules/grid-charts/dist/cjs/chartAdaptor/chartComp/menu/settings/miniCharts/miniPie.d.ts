import { ChartType } from "@ag-community/grid-core";
import { MiniDoughnut } from "./miniDoughnut";
export declare class MiniPie extends MiniDoughnut {
    static chartType: ChartType;
    constructor(parent: HTMLElement, fills: string[], strokes: string[]);
}
