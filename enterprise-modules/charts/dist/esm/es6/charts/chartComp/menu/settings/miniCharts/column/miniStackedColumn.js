import { MiniChartWithAxes } from "../miniChartWithAxes";
import { createColumnRects } from "../miniChartHelpers";
export class MiniStackedColumn extends MiniChartWithAxes {
    constructor(container, fills, strokes, data = MiniStackedColumn.data, yScaleDomain = [0, 16], tooltipName = "stackedColumnTooltip") {
        super(container, tooltipName);
        const { root, size, padding } = this;
        this.stackedColumns = createColumnRects({
            stacked: true,
            root,
            data,
            size,
            padding,
            xScaleDomain: [0, 1, 2],
            yScaleDomain,
            xScalePadding: 0.3,
        });
        root.append([].concat.apply([], this.stackedColumns));
        this.updateColors(fills, strokes);
    }
    updateColors(fills, strokes) {
        this.stackedColumns.forEach((series, i) => series.forEach(column => {
            column.fill = fills[i];
            column.stroke = strokes[i];
        }));
    }
}
MiniStackedColumn.chartType = 'stackedColumn';
MiniStackedColumn.data = [
    [8, 12, 16],
    [6, 9, 12],
    [2, 3, 4]
];
