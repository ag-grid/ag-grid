import { MiniChartWithAxes } from "../miniChartWithAxes";
import { _Scene } from "ag-charts-community";
export class MiniHistogram extends MiniChartWithAxes {
    constructor(container, fills, strokes) {
        super(container, "histogramTooltip");
        const padding = this.padding;
        const size = this.size;
        // approx normal curve
        const data = [2, 5, 11, 13, 10, 6, 1];
        const xScale = new _Scene.LinearScale();
        xScale.domain = [0, data.length];
        xScale.range = [padding, size - padding];
        const yScale = new _Scene.LinearScale();
        yScale.domain = [0, data.reduce((a, b) => Math.max(a, b), 0)];
        yScale.range = [size - padding, padding];
        const bottom = yScale.convert(0);
        this.bars = data.map((datum, i) => {
            const top = yScale.convert(datum);
            const left = xScale.convert(i);
            const right = xScale.convert(i + 1);
            const rect = new _Scene.Rect();
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
MiniHistogram.chartType = 'histogram';
