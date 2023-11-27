"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiniHistogram = void 0;
const miniChartWithAxes_1 = require("../miniChartWithAxes");
const ag_charts_community_1 = require("ag-charts-community");
class MiniHistogram extends miniChartWithAxes_1.MiniChartWithAxes {
    constructor(container, fills, strokes) {
        super(container, "histogramTooltip");
        const padding = this.padding;
        const size = this.size;
        // approx normal curve
        const data = [2, 5, 11, 13, 10, 6, 1];
        const xScale = new ag_charts_community_1._Scene.LinearScale();
        xScale.domain = [0, data.length];
        xScale.range = [padding, size - padding];
        const yScale = new ag_charts_community_1._Scene.LinearScale();
        yScale.domain = [0, data.reduce((a, b) => Math.max(a, b), 0)];
        yScale.range = [size - padding, padding];
        const bottom = yScale.convert(0);
        this.bars = data.map((datum, i) => {
            const top = yScale.convert(datum);
            const left = xScale.convert(i);
            const right = xScale.convert(i + 1);
            const rect = new ag_charts_community_1._Scene.Rect();
            rect.x = left;
            rect.y = top;
            rect.width = right - left;
            rect.height = bottom - top;
            rect.strokeWidth = 1;
            rect.crisp = true;
            return rect;
        });
        this.updateColors(fills, strokes);
        this.root.append(this.bars);
    }
    updateColors([fill], [stroke]) {
        this.bars.forEach(bar => {
            bar.fill = fill;
            bar.stroke = stroke;
        });
    }
}
exports.MiniHistogram = MiniHistogram;
MiniHistogram.chartType = 'histogram';
