import { MiniChartWithAxes } from "../miniChartWithAxes";
import { Path, Rect } from "ag-charts-community";
import { ChartType } from "@ag-grid-community/core";
import { createColumnRects, CreateColumnRectsParams, createLinePaths } from "../miniChartHelpers";

export class MiniStackedColumnLine extends MiniChartWithAxes {
    static chartType: ChartType = 'stackedColumnLine';

    private stackedColumns: Rect[][];
    private lines: Path[];

    private columnData = [
        [12, 16],
        [6, 9],
    ];

    private lineData = [
        [5, 4, 6, 5, 4]
    ];

    constructor(container: HTMLElement, fills: string[], strokes: string[]) {
        super(container, "stackedColumnLineTooltip");

        const { root, columnData, lineData, size, padding } = this;

        this.stackedColumns = createColumnRects({
            stacked: true,
            root,
            data: columnData,
            size,
            padding,
            xScaleDomain: [0, 1],
            yScaleDomain: [0, 16],
            xScalePadding: 0.5,
        } as CreateColumnRectsParams);

        root.append(([] as Rect[]).concat.apply([], this.stackedColumns));

        this.lines = createLinePaths(root, lineData, size, padding);

        this.updateColors(fills, strokes);
    }

    updateColors(fills: string[], strokes: string[]) {
        this.stackedColumns.forEach((series, i) =>
            series.forEach(bar => {
                bar.fill = fills[i];
                bar.stroke = strokes[i];
            })
        );

        this.lines.forEach((line, i) => {
            line.stroke = fills[i + 2];
        });
    }
}
