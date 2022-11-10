import { MiniChartWithAxes } from "../miniChartWithAxes";
import { Integrated } from "ag-charts-community";
import { ChartType } from "@ag-grid-community/core";

export class MiniBubble extends MiniChartWithAxes {

    static chartType: ChartType = 'bubble';
    private readonly points: Integrated.Shape[];

    constructor(container: HTMLElement, fills: string[], strokes: string[]) {
        super(container, "bubbleTooltip");

        const size = this.size;
        const padding = this.padding;

        // [x, y, radius] triples
        const data = [
            [[0.1, 0.3, 5], [0.5, 0.4, 7], [0.2, 0.8, 7]], [[0.8, 0.7, 5], [0.7, 0.3, 9]]
        ];

        const xScale = new Integrated.LinearScale();
        xScale.domain = [0, 1];
        xScale.range = [padding * 2, size - padding];

        const yScale = new Integrated.LinearScale();
        yScale.domain = [0, 1];
        yScale.range = [size - padding, padding];

        const points: Integrated.Shape[] = [];

        data.forEach(series => {
            series.forEach(([x, y, radius]) => {
                const arc = new Integrated.Arc();
                arc.strokeWidth = 1;
                arc.centerX = xScale.convert(x);
                arc.centerY = yScale.convert(y);
                arc.radiusX = arc.radiusY = radius;
                arc.fillOpacity = 0.7;
                points.push(arc);
            });
        });

        this.points = points;
        this.updateColors(fills, strokes);

        const clipRect = new Integrated.ClipRect();
        clipRect.x = padding;
        clipRect.y = padding;
        clipRect.width = size - padding * 2;
        clipRect.height = size - padding * 2;

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
