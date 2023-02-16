"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiniLine = void 0;
const miniChartWithAxes_1 = require("../miniChartWithAxes");
const miniChartHelpers_1 = require("../miniChartHelpers");
class MiniLine extends miniChartWithAxes_1.MiniChartWithAxes {
    constructor(container, fills, strokes) {
        super(container, "lineTooltip");
        this.data = [
            [9, 7, 8, 5, 6],
            [5, 6, 3, 4, 1],
            [1, 3, 4, 8, 7]
        ];
        this.lines = miniChartHelpers_1.createLinePaths(this.root, this.data, this.size, this.padding);
        this.updateColors(fills, strokes);
    }
    updateColors(fills, strokes) {
        this.lines.forEach((line, i) => {
            line.stroke = fills[i];
        });
    }
}
exports.MiniLine = MiniLine;
MiniLine.chartType = 'line';
