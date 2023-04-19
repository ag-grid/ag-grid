import { MiniChartWithAxes } from "../miniChartWithAxes";
import { _Scene } from "ag-charts-community";
import { createColumnRects } from "../miniChartHelpers";
export class MiniAreaColumnCombo extends MiniChartWithAxes {
    constructor(container, fills, strokes) {
        super(container, "areaColumnComboTooltip");
        this.columnData = [3, 4.5];
        this.areaData = [
            [5, 4, 6, 5, 4],
        ];
        const { root, columnData, areaData, size, padding } = this;
        this.columns = createColumnRects({
            stacked: false,
            root,
            data: columnData,
            size,
            padding,
            xScaleDomain: [0, 1],
            yScaleDomain: [0, 6],
            xScalePadding: 0.5,
        });
        // scale for area series
        const xScale = new _Scene.BandScale();
        xScale.range = [padding, size - padding];
        xScale.domain = [0, 1, 2, 3, 4];
        xScale.paddingInner = 1;
        xScale.paddingOuter = 0;
        const yScale = new _Scene.LinearScale();
        yScale.range = [size - padding, padding];
        yScale.domain = [0, 6];
        const pathData = [];
        const yZero = yScale.convert(0);
        const firstX = xScale.convert(0);
        areaData.forEach((series, i) => {
            const points = pathData[i] || (pathData[i] = []);
            series.forEach((data, j) => {
                const yDatum = data;
                const xDatum = j;
                const x = xScale.convert(xDatum);
                const y = yScale.convert(yDatum);
                points[j] = { x, y };
            });
            const lastX = xScale.convert(series.length - 1);
            pathData[i].push({
                x: lastX,
                y: yZero
            }, {
                x: firstX,
                y: yZero
            });
        });
        this.areas = pathData.map((points) => {
            const area = new _Scene.Path();
            area.strokeWidth = 1;
            area.fillOpacity = 0.8;
            const path = area.path;
            points.forEach((point, i) => path[i > 0 ? 'lineTo' : 'moveTo'](point.x, point.y));
            return area;
        });
        root.append(this.areas);
        root.append([].concat.apply([], this.columns));
        this.updateColors(fills, strokes);
    }
    updateColors(fills, strokes) {
        this.areas.forEach((area, i) => {
            area.fill = fills[i];
            area.stroke = strokes[i];
        });
        this.columns.forEach((bar, i) => {
            bar.fill = fills[i + 1];
            bar.stroke = strokes[i + 1];
        });
    }
}
MiniAreaColumnCombo.chartType = 'areaColumnCombo';
