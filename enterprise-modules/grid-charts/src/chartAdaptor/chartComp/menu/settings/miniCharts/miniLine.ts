import {_, ChartType} from "@ag-community/grid-core";

import {MiniChartWithAxes} from "./miniChartWithAxes";
import {Path} from "../../../../../charts/scene/shape/path";
import linearScale from "../../../../../charts/scale/linearScale";
import {ClipRect} from "../../../../../charts/scene/clipRect";

export class MiniLine extends MiniChartWithAxes {
    static chartType = ChartType.Line;
    private readonly lines: Path[];

    constructor(parent: HTMLElement, fills: string[], strokes: string[]) {
        super(parent, "lineTooltip");

        const size = this.size;
        const padding = this.padding;

        const xScale = linearScale();
        xScale.domain = [0, 4];
        xScale.range = [padding, size - padding];

        const yScale = linearScale();
        yScale.domain = [0, 10];
        yScale.range = [size - padding, padding];

        const data = [
            [9, 7, 8, 5, 6],
            [5, 6, 3, 4, 1],
            [1, 3, 4, 8, 7]
        ];

        this.lines = data.map(series => {
            const line = new Path();
            line.strokeWidth = 3;
            line.lineCap = "round";
            line.fill = undefined;
            series.forEach((datum, i) => {
                line.path[i > 0 ? "lineTo" : "moveTo"](xScale.convert(i), yScale.convert(datum));
            });

            return line;
        });

        this.updateColors(fills, strokes);

        const clipRect = new ClipRect();
        clipRect.x = clipRect.y = padding;
        clipRect.width = clipRect.height = size - padding * 2;

        clipRect.append(this.lines);
        this.root.append(clipRect);
    }
    
    updateColors(fills: string[], strokes: string[]) {
        this.lines.forEach((line, i) => {
            line.stroke = fills[i];
        });
    }
}
