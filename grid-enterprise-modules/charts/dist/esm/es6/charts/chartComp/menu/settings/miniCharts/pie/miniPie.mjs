import { MiniDoughnut } from "./miniDoughnut.mjs";
export class MiniPie extends MiniDoughnut {
    constructor(container, fills, strokes) {
        super(container, fills, strokes, 0, "pieTooltip");
    }
}
MiniPie.chartType = 'pie';
