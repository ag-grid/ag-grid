"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiniStackedArea = void 0;
const miniChartWithAxes_1 = require("../miniChartWithAxes");
const ag_charts_community_1 = require("ag-charts-community");
class MiniStackedArea extends miniChartWithAxes_1.MiniChartWithAxes {
    constructor(container, fills, strokes, data = MiniStackedArea.data, tooltipName = "stackedAreaTooltip") {
        super(container, tooltipName);
        const size = this.size;
        const padding = this.padding;
        const xScale = new ag_charts_community_1._Scene.BandScale();
        xScale.domain = [0, 1, 2];
        xScale.paddingInner = 1;
        xScale.paddingOuter = 0;
        xScale.range = [padding + 0.5, size - padding - 0.5];
        const yScale = new ag_charts_community_1._Scene.LinearScale();
        yScale.domain = [0, 16];
        yScale.range = [size - padding + 0.5, padding + 0.5];
        const xCount = data.length;
        const last = xCount * 2 - 1;
        const pathData = [];
        data.forEach((datum, i) => {
            const x = xScale.convert(i);
            let total = 0;
            datum.forEach((yDatum, j) => {
                const y = yScale.convert(total + yDatum);
                const points = pathData[j] || (pathData[j] = []);
                points[i] = {
                    x,
                    y
                };
                points[last - i] = {
                    x,
                    y: yScale.convert(total) // bottom y
                };
                total += yDatum;
            });
        });
        this.areas = pathData.map(points => {
            const area = new ag_charts_community_1._Scene.Path();
            area.strokeWidth = 1;
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
exports.MiniStackedArea = MiniStackedArea;
MiniStackedArea.chartType = 'stackedArea';
MiniStackedArea.data = [
    [2, 3, 2],
    [3, 6, 5],
    [6, 2, 2]
];
