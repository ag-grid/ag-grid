"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const miniChartWithAxes_1 = require("../miniChartWithAxes");
const miniChartHelpers_1 = require("../miniChartHelpers");
class MiniStackedColumn extends miniChartWithAxes_1.MiniChartWithAxes {
    constructor(container, fills, strokes, data = MiniStackedColumn.data, yScaleDomain = [0, 16], tooltipName = "stackedColumnTooltip") {
        super(container, tooltipName);
        const { root, size, padding } = this;
        this.stackedColumns = miniChartHelpers_1.createColumnRects({
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
exports.MiniStackedColumn = MiniStackedColumn;
MiniStackedColumn.chartType = 'stackedColumn';
MiniStackedColumn.data = [
    [8, 12, 16],
    [6, 9, 12],
    [2, 3, 4]
];
