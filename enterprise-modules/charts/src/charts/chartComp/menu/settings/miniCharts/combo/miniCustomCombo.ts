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

        const axisStroke = 'gray';
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
        penIcon.svgPath = 'M20.09,43l8.68,8.89M50.66,21.34a6.17,6.17,0,0,0-8.79,0l-22,22.05-.1.09L17.65,53.77l-.15.73,11-2.23L50.66,30.13a6.17,6.17,0,0,0,0-8.79ZM39.75,23.46l8.77,8.81M39,24.58l8.68,8.88';
        penIcon.fill = fills[fills.length - 1];
        penIcon.stroke = '#D6D6D6';
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
