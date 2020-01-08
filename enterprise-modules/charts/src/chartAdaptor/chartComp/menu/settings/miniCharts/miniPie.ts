import {ChartType} from "@ag-grid-community/core";
import {MiniDoughnut} from "./miniDoughnut";

export class MiniPie extends MiniDoughnut {
    static chartType = ChartType.Pie;

    constructor(container: HTMLElement, fills: string[], strokes: string[]) {
        super(container, fills, strokes, 0, "pieTooltip");
    }
}
