import { MiniChartWithAxes } from "../miniChartWithAxes";
import { createColumnRects } from "../miniChartHelpers";
export class MiniColumn extends MiniChartWithAxes {
    constructor(container, fills, strokes) {
        super(container, "groupedColumnTooltip");
        this.columnData = [2, 3, 4];
        const { root, columnData, size, padding } = this;
        this.columns = createColumnRects({
            stacked: false,
            root,
            data: columnData,
            size,
            padding,
            xScaleDomain: [0, 1, 2],
            yScaleDomain: [0, 4],
            xScalePadding: 0.3
        });
        root.append(this.columns);
        this.updateColors(fills, strokes);
    }
    updateColors(fills, strokes) {
        this.columns.forEach((column, i) => {
            column.fill = fills[i];
            column.stroke = strokes[i];
        });
    }
}
MiniColumn.chartType = 'groupedColumn';
