import {_, ChartType} from "ag-grid-community";

import {MiniChart} from "./miniChart";
import linearScale from "../../../../../charts/scale/linearScale";
import {Line} from "../../../../../charts/scene/shape/line";
import {ClipRect} from "../../../../../charts/scene/clipRect";
import {Arc} from "../../../../../charts/scene/shape/arc";
import {Shape} from "../../../../../charts/scene/shape/shape";

export class MiniBubble extends MiniChart {
    static chartType = ChartType.Bubble;
    private readonly points: Shape[];

    constructor(parent: HTMLElement, fills: string[], strokes: string[]) {
        super(parent, "bubbleTooltip");

        const size = this.size;
        const padding = this.padding;

        // [x, y, radius] triples
        const data = [
            [[0.1, 0.3, 5], [0.5, 0.4, 7], [0.2, 0.8, 7]], [[0.8, 0.7, 5], [0.7, 0.3, 9]]
        ];

        const xScale = linearScale();
        xScale.domain = [0, 1];
        xScale.range = [padding * 2, size - padding];

        const yScale = linearScale();
        yScale.domain = [0, 1];
        yScale.range = [size - padding, padding];

        const leftAxis = Line.create(padding, padding, padding, size - padding + this.axisOvershoot);
        leftAxis.stroke = this.stroke;
        leftAxis.strokeWidth = this.strokeWidth;

        const bottomAxis = Line.create(padding - this.axisOvershoot, size - padding, size - padding, size - padding);
        bottomAxis.stroke = this.stroke;
        bottomAxis.strokeWidth = this.strokeWidth;

        const points: Shape[] = [];
        data.forEach(series => {
            series.forEach(datum => {
                const [x, y, radius] = datum;
                const arc = new Arc();
                arc.strokeWidth = 1;
                arc.centerX = xScale.convert(x);
                arc.centerY = yScale.convert(y);
                arc.radiusX = radius;
                arc.radiusY = radius;
                arc.fillOpacity = 0.7;
                points.push(arc);
            });
        });
        this.points = points;

        const clipRect = new ClipRect();
        clipRect.x = padding;
        clipRect.y = padding;
        clipRect.width = size - padding * 2;
        clipRect.height = size - padding * 2;

        clipRect.append(this.points);
        const root = this.root;
        root.append(clipRect);
        root.append(leftAxis);
        root.append(bottomAxis);

        this.updateColors(fills, strokes);
    }

    updateColors(fills: string[], strokes: string[]) {
        this.points.forEach((line, i) => {
            line.stroke = strokes[i % strokes.length];
            line.fill = fills[i % fills.length];
        });
    }
}
