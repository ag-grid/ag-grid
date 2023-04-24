import { MiniChartWithAxes } from "../miniChartWithAxes";
import { _Scene } from "ag-charts-community";
import { ChartType } from "@ag-grid-community/core";
import { createColumnRects, CreateColumnRectsParams } from "../miniChartHelpers";

export class MiniColumn extends MiniChartWithAxes {
    static chartType: ChartType = 'groupedColumn';

    private readonly columns: _Scene.Rect[];

    private columnData = [2, 3, 4];

    constructor(container: HTMLElement, fills: string[], strokes: string[]) {
        super(container, "groupedColumnTooltip");

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
        } as CreateColumnRectsParams);

        root.append(this.columns);

        this.updateColors(fills, strokes);
    }

    updateColors(fills: string[], strokes: string[]) {
        this.columns.forEach((column: _Scene.Rect, i) => {
            column.fill = fills[i];
            column.stroke = strokes[i];
        });
    }
}
