import { _Scene } from 'ag-charts-community';

import type { ChartType } from 'ag-grid-community';

import { MiniChartWithAxes } from '../miniChartWithAxes';

export class MiniBubble extends MiniChartWithAxes {
    static chartType: ChartType = 'bubble';
    private readonly points: _Scene.Shape[];

    constructor(container: HTMLElement, fills: string[], strokes: string[]) {
        super(container, 'bubbleTooltip');

        const size = this.size;
        const padding = this.padding;

        // [x, y, radius] triples
        const data = [
            [
                [0.1, 0.3, 5],
                [0.5, 0.4, 7],
                [0.2, 0.8, 7],
            ],
            [
                [0.8, 0.7, 5],
                [0.7, 0.3, 9],
            ],
        ];

        const xScale = new _Scene.LinearScale();
        xScale.domain = [0, 1];
        xScale.range = [padding * 2, size - padding];

        const yScale = new _Scene.LinearScale();
        yScale.domain = [0, 1];
        yScale.range = [size - padding, padding];

        const points: _Scene.Shape[] = [];

        data.forEach((series) => {
            series.forEach(([x, y, radius]) => {
                const arc = new _Scene.Arc();
                arc.strokeWidth = 0;
                arc.centerX = xScale.convert(x);
                arc.centerY = yScale.convert(y);
                arc.radius = radius;
                arc.fillOpacity = 0.7;
                points.push(arc);
            });
        });

        this.points = points;
        this.updateColors(fills, strokes);

        const pointsGroup = new _Scene.Group();
        pointsGroup.setClipRectInGroupCoordinateSpace(
            new _Scene.BBox(padding, padding, size - padding * 2, size - padding * 2)
        );
        pointsGroup.append(this.points);
        this.root.append(pointsGroup);
    }

    updateColors(fills: string[], strokes: string[]) {
        this.points.forEach((line, i) => {
            line.stroke = strokes[i % strokes.length];
            line.fill = fills[i % fills.length];
        });
    }
}
