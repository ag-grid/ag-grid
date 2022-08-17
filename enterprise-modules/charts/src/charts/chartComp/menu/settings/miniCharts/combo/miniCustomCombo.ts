import { Line, Path, Rect } from "ag-charts-community";
import { ChartType } from "@ag-grid-community/core";
import { createColumnRects, CreateColumnRectsParams, createLinePaths } from "../miniChartHelpers";
import { MiniChart } from "../miniChart";

export class MiniCustomCombo extends MiniChart {
    static chartType: ChartType = 'customCombo';

    private columns: Rect[];
    private lines: Path[];

    private columnData = [3, 4];

    private lineData = [
        [5, 4, 6, 5, 4]
    ];

    constructor(container: HTMLElement, fills: string[], strokes: string[]) {
        super(container, "customComboTooltip");

        const { root, columnData, lineData, size, padding } = this;

        this.columns = createColumnRects({
            stacked: false,
            root,
            data: columnData,
            size,
            padding,
            xScaleDomain: [0, 1],
            yScaleDomain: [0, 4],
            xScalePadding: 0.5
        } as CreateColumnRectsParams);

        root.append(this.columns);

        this.lines = createLinePaths(root, lineData, size, padding);

        const axisStroke = 'grey';
        const axisOvershoot = 3;

        const leftAxis = new Line();
        leftAxis.x1 = padding;
        leftAxis.y1 = padding;
        leftAxis.x2 = padding;
        leftAxis.y2 = size - padding + axisOvershoot;
        leftAxis.stroke = axisStroke;

        const bottomAxis = new Line();
        bottomAxis.x1 = padding - axisOvershoot + 1;
        bottomAxis.y1 = size - padding;
        bottomAxis.x2 = size - padding + 1;
        bottomAxis.y2 = size - padding;
        bottomAxis.stroke = axisStroke;

        root.append([bottomAxis, leftAxis]);

        this.updateColors(fills, strokes);
    }

    updateColors(fills: string[], strokes: string[]) {
        this.columns.forEach((bar: Rect, i: number) => {
            bar.fill = fills[i];
            bar.stroke = strokes[i];
        });

        this.lines.forEach((line: Path, i: number) => {
            line.stroke = fills[i + 2];
        });
    }
}
