import type { _Scene } from 'ag-charts-community';

import type { ChartType } from 'ag-grid-community';

import { ChartWrapper } from '../../../../../chartWrapper';
import { MiniChartWithAxes } from '../miniChartWithAxes';

export class MiniScatter extends MiniChartWithAxes {
    static chartType: ChartType = 'scatter';
    private readonly points: _Scene.Shape[];

    constructor(container: HTMLElement, fills: string[], strokes: string[]) {
        super(container, 'scatterTooltip');

        const size = this.size;
        const padding = this.padding;

        // [x, y] pairs
        const data = [
            [
                [0.3, 3],
                [1.1, 0.9],
                [2, 0.4],
                [3.4, 2.4],
            ],
            [
                [0, 0.3],
                [1, 2],
                [2.4, 1.4],
                [3, 0],
            ],
        ];

        const xScale = new ChartWrapper._Scene.LinearScale();
        xScale.domain = [-0.5, 4];
        xScale.range = [padding * 2, size - padding];

        const yScale = new ChartWrapper._Scene.LinearScale();
        yScale.domain = [-0.5, 3.5];
        yScale.range = [size - padding, padding];

        const points: _Scene.Shape[] = [];

        data.forEach((series) => {
            series.forEach(([x, y]) => {
                const arc = new ChartWrapper._Scene.Arc();
                arc.strokeWidth = 0;
                arc.centerX = xScale.convert(x);
                arc.centerY = yScale.convert(y);
                arc.radius = 2.5;
                points.push(arc);
            });
        });

        this.points = points;
        this.updateColors(fills, strokes);

        const pointsGroup = new ChartWrapper._Scene.Group();
        pointsGroup.setClipRect(new ChartWrapper._Scene.BBox(padding, padding, size - padding * 2, size - padding * 2));
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
