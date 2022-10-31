import { MiniChartWithAxes } from "../miniChartWithAxes";
import { BandScale, LinearScale, Rect } from "ag-charts-community";
export class MiniStackedBar extends MiniChartWithAxes {
    constructor(container, fills, strokes, data = MiniStackedBar.data, xScaleDomain = [0, 16], tooltipName = "stackedBarTooltip") {
        super(container, tooltipName);
        const size = this.size;
        const padding = this.padding;
        const yScale = new BandScale();
        yScale.domain = [0, 1, 2];
        yScale.range = [padding, size - padding];
        yScale.paddingInner = 0.3;
        yScale.paddingOuter = 0.3;
        const xScale = new LinearScale();
        xScale.domain = xScaleDomain;
        xScale.range = [size - padding, padding];
        const bottom = xScale.convert(0);
        const height = yScale.bandwidth;
        this.bars = data.map(series => series.map((datum, i) => {
            const rect = new Rect();
            rect.x = padding;
            rect.y = yScale.convert(i);
            rect.width = bottom - xScale.convert(datum);
            rect.height = height;
            rect.strokeWidth = 1;
            rect.crisp = true;
            return rect;
        }));
        this.updateColors(fills, strokes);
        this.root.append([].concat.apply([], this.bars));
    }
    updateColors(fills, strokes) {
        this.bars.forEach((series, i) => series.forEach(bar => {
            bar.fill = fills[i];
            bar.stroke = strokes[i];
        }));
    }
}
MiniStackedBar.chartType = 'stackedBar';
MiniStackedBar.data = [
    [8, 12, 16],
    [6, 9, 12],
    [2, 3, 4]
];
