import { MiniDoughnut } from "./miniDoughnut";
import { ChartType } from "@ag-grid-community/core";

export class MiniPie extends MiniDoughnut {

    static chartType: ChartType = 'pie';

    constructor(container: HTMLElement, fills: string[], strokes: string[]) {
        super(container, fills, strokes, 0, "pieTooltip");
    }
}
