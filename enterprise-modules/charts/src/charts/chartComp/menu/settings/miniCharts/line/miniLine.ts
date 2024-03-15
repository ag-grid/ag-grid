import { MiniChartWithAxes } from "../miniChartWithAxes";
import { _Scene } from "ag-charts-community";
import { ChartType } from "@ag-grid-community/core";
import { createLinePaths } from "../miniChartHelpers";

export class MiniLine extends MiniChartWithAxes {
    static chartType: ChartType = 'line';

    private readonly lines: _Scene.Path[];

    private data = [
        [9, 7, 8, 5, 6],
        [5, 6, 3, 4, 1],
        [1, 3, 4, 8, 7]
    ];

    constructor(container: HTMLElement, fills: string[], strokes: string[]) {
        super(container, "lineTooltip");

        this.lines = createLinePaths(this.root, this.data, this.size, this.padding);

        this.updateColors(fills, strokes);
    }

    updateColors(fills: string[], strokes: string[]) {
        this.lines.forEach((line: _Scene.Path, i: number) => {
            line.stroke = fills[i];
        });
    }
}
