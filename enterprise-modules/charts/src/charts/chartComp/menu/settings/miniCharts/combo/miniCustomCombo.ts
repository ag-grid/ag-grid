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

        const penIcon = new Path();
        penIcon.svgPath = 'M25.76,43.46l5.51,5.07M49.86,22a3.26,3.26,0,0,0-3-.59,6.78,6.78,0,0,0-3.35,2.14l-18,20.25-.08.09-2.42,8-.18.57,8.19-3.6,18-20.34a6.83,6.83,0,0,0,1.73-3.59A3.29,3.29,0,0,0,49.86,22Zm-8.1,3.5,5.58,5m-6.6-3.85,5.51,5.06';
        penIcon.fill = 'whitesmoke';
        penIcon.stroke = 'darkslategrey';
        penIcon.strokeWidth = 1;

        root.append([bottomAxis, leftAxis, penIcon]);

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
