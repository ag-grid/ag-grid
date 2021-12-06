import { MiniDoughnut } from "./miniDoughnut";

export class MiniPie extends MiniDoughnut {

    static chartType = 'pie';

    constructor(container: HTMLElement, fills: string[], strokes: string[]) {
        super(container, fills, strokes, 0, "pieTooltip");
    }
}
