import { MiniChartWithAxes } from "../miniChartWithAxes";
import { createLinePaths } from "../miniChartHelpers";
export class MiniLine extends MiniChartWithAxes {
    constructor(container, fills, strokes) {
        super(container, "lineTooltip");
        this.data = [
            [9, 7, 8, 5, 6],
            [5, 6, 3, 4, 1],
            [1, 3, 4, 8, 7]
        ];
        this.lines = createLinePaths(this.root, this.data, this.size, this.padding);
        this.updateColors(fills, strokes);
    }
    updateColors(fills, strokes) {
        this.lines.forEach((line, i) => {
            line.stroke = fills[i];
        });
    }
}
MiniLine.chartType = 'line';
