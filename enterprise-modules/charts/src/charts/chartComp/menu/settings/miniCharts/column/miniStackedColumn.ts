import { MiniChartWithAxes } from "../miniChartWithAxes";
import { _Scene } from "ag-charts-community";
import { ChartType } from "@ag-grid-community/core";
import { createColumnRects, CreateColumnRectsParams } from "../miniChartHelpers";

export class MiniStackedColumn extends MiniChartWithAxes {
    static chartType: ChartType = 'stackedColumn';

    private readonly stackedColumns: _Scene.Rect[][];

    static data = [
        [8, 12, 16],
        [6, 9, 12],
        [2, 3, 4]
    ];

    constructor(
        container: HTMLElement,
        fills: string[],
        strokes: string[],
        data = MiniStackedColumn.data,
        yScaleDomain = [0, 16],
        tooltipName = "stackedColumnTooltip") {
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
        } as CreateColumnRectsParams);

        root.append(([]as _Scene.Rect[]).concat.apply([], this.stackedColumns));

        this.updateColors(fills, strokes);
    }

    updateColors(fills: string[], strokes: string[]) {
        this.stackedColumns.forEach((series: _Scene.Rect[], i: number) =>
            series.forEach(column => {
                column.fill = fills[i];
                column.stroke = strokes[i];
            })
        );
    }
}
