import {_, ChartType} from "@ag-community/grid-core";

import {MiniChartWithAxes} from "./miniChartWithAxes";
import linearScale from "../../../../../charts/scale/linearScale";
import {ClipRect} from "../../../../../charts/scene/clipRect";
import {Arc} from "../../../../../charts/scene/shape/arc";
import {Shape} from "../../../../../charts/scene/shape/shape";

export class MiniScatter extends MiniChartWithAxes {
    static chartType = ChartType.Scatter;
    private readonly points: Shape[];

    constructor(parent: HTMLElement, fills: string[], strokes: string[]) {
        super(parent, "scatterTooltip");

        const size = this.size;
        const padding = this.padding;

        // [x, y] pairs
        const data = [
            [[0.3, 3], [1.1, 0.9], [2, 0.4], [3.4, 2.4]],
            [[0, 0.3], [1, 2], [2.4, 1.4], [3, 0]]
        ];

        const xScale = linearScale();
        xScale.domain = [-0.5, 4];
        xScale.range = [padding * 2, size - padding];

        const yScale = linearScale();
        yScale.domain = [-0.5, 3.5];
        yScale.range = [size - padding, padding];

        const points: Shape[] = [];

        data.forEach(series => {
            series.forEach(([x, y]) => {
                const arc = new Arc();
                arc.strokeWidth = 1;
                arc.centerX = xScale.convert(x);
                arc.centerY = yScale.convert(y);
                arc.radiusX = arc.radiusY = 2.5;
                points.push(arc);
            });
        });

        this.points = points;
        this.updateColors(fills, strokes);

        const clipRect = new ClipRect();
        clipRect.x = clipRect.y = padding;
        clipRect.width = clipRect.height = size - padding * 2;

        clipRect.append(this.points);
        this.root.append(clipRect);
    }

    updateColors(fills: string[], strokes: string[]) {
        this.points.forEach((line, i) => {
            line.stroke = strokes[i % strokes.length];
            line.fill = fills[i % fills.length];
        });
    }
}
