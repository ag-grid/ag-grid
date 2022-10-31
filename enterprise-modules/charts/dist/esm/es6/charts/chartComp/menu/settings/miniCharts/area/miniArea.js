import { MiniChartWithAxes } from "../miniChartWithAxes";
import { BandScale, LinearScale, Path } from "ag-charts-community";
export class MiniArea extends MiniChartWithAxes {
    constructor(container, fills, strokes, data = MiniArea.data) {
        super(container, "groupedAreaTooltip");
        const size = this.size;
        const padding = this.padding;
        const xScale = new BandScale();
        xScale.domain = [0, 1, 2];
        xScale.paddingInner = 1;
        xScale.paddingOuter = 0;
        xScale.range = [padding + 0.5, size - padding - 0.5];
        const yScale = new LinearScale();
        yScale.domain = [0, 6];
        yScale.range = [size - padding + 0.5, padding];
        const xCount = data.length;
        const last = xCount * 2 - 1;
        const pathData = [];
        const bottomY = yScale.convert(0);
        data.forEach((datum, i) => {
            const x = xScale.convert(i);
            datum.forEach((yDatum, j) => {
                const y = yScale.convert(yDatum);
                const points = pathData[j] || (pathData[j] = []);
                points[i] = {
                    x,
                    y
                };
                points[last - i] = {
                    x,
                    y: bottomY
                };
            });
        });
        this.areas = pathData.reverse().map(points => {
            const area = new Path();
            area.strokeWidth = 1;
            area.fillOpacity = 0.7;
            const path = area.path;
            path.clear();
            points.forEach((point, i) => path[i > 0 ? "lineTo" : "moveTo"](point.x, point.y));
            path.closePath();
            return area;
        });
        this.updateColors(fills, strokes);
        this.root.append(this.areas);
    }
    updateColors(fills, strokes) {
        this.areas.forEach((area, i) => {
            area.fill = fills[i];
            area.stroke = strokes[i];
        });
    }
}
MiniArea.chartType = 'area';
MiniArea.data = [
    [1, 3, 5],
    [2, 6, 4],
    [5, 3, 1]
];
