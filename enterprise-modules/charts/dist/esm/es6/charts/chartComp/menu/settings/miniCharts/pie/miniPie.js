import { MiniDoughnut } from "./miniDoughnut";
export class MiniPie extends MiniDoughnut {
    constructor(container, fills, strokes) {
        super(container, fills, strokes, 0, "pieTooltip");
    }
}
MiniPie.chartType = 'pie';
