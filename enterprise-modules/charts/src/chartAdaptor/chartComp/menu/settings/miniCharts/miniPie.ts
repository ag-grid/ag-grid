import {ChartType} from "@ag-grid-community/core";
import {MiniDoughnut} from "./miniDoughnut";

export class MiniPie extends MiniDoughnut {
    static chartType = ChartType.Pie;

    constructor(parent: HTMLElement, fills: string[], strokes: string[]) {
        super(parent, fills, strokes, 0, "pieTooltip");
    }
}
