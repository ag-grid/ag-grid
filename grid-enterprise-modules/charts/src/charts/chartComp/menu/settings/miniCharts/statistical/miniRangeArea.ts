import { ChartType } from '@ag-grid-community/core';
import { _Scene } from 'ag-charts-community';
import { MiniChartWithAxes } from '../miniChartWithAxes';

export class MiniRangeArea extends MiniChartWithAxes {
    static chartType: ChartType = 'rangeArea';

    private readonly lines: _Scene.Path[][];
    private readonly areas: _Scene.Path[];

    constructor(container: HTMLElement, fills: string[], strokes: string[]) {
        super(container, 'rangeAreaTooltip');
        const data = [
            [3, 3.5, 3, 3.7, 3.9],
            [4, 4.5, 4, 4.7, 4.8],
            [2, 2.5, 4, 5, 5.8],
        ];

        const { lines, areas } = this.createRangeArea(this.root, data, this.size, this.padding);
        this.lines = lines;
        this.areas = areas;
        this.updateColors(fills, strokes);
    }

    updateColors(fills: string[], strokes: string[]) {
        this.lines.forEach(([highLine, lowLine], i) => {
            highLine.fill = undefined;
            highLine.stroke = strokes[i];
            lowLine.fill = undefined;
            lowLine.stroke = strokes[i];
        });
        this.areas.forEach((area, i) => {
            area.fill = fills[i];
        });
    }

    createRangeArea(
        root: _Scene.Group,
        data: number[][],
        size: number,
        padding: number
    ): { lines: _Scene.Path[][]; areas: _Scene.Path[] } {
        const xScale = new _Scene.LinearScale();
        xScale.domain = [0, data[0].length - 1];
        xScale.range = [padding, size - padding];

        const lowRatio = 0.9;
        const highRatio = 1.1;
        const scalePadding = 2 * padding;

        const yScale = new _Scene.LinearScale();
        yScale.domain = [
            data.reduce(
                (min, series) =>
                    Math.min(
                        series.reduce((a, b) => Math.min(a, b), Infinity),
                        min
                    ),
                Infinity
            ) * lowRatio,
            data.reduce(
                (max, series) =>
                    Math.max(
                        series.reduce((a, b) => Math.max(a, b), 0),
                        max
                    ),
                0
            ) * highRatio,
        ];
        yScale.range = [size - scalePadding, scalePadding];

        const lines: _Scene.Path[][] = [];
        const areas: _Scene.Path[] = [];

        const lowPoints = data.map((series) => {
            const highLine = new _Scene.Path();
            const lowLine = new _Scene.Path();
            const area = new _Scene.Path();

            lines.push([highLine, lowLine]);
            areas.push(area);

            highLine.strokeWidth = 0;
            lowLine.strokeWidth = 0;
            area.strokeWidth = 0;
            area.fillOpacity = 0.7;

            highLine.path.clear();
            lowLine.path.clear();
            area.path.clear();

            return series.map((datum, datumIndex) => {
                const [low, high] = [datum * lowRatio, datum * highRatio];

                const x = xScale.convert(datumIndex);
                const yLow = yScale.convert(low);
                const yHigh = yScale.convert(high);

                const command = datumIndex > 0 ? 'lineTo' : 'moveTo';

                highLine.path[command](x, yHigh);
                lowLine.path[command](x, yLow);
                area.path[command](x, yHigh);

                return [x, yLow];
            });
        });

        lowPoints.forEach((seriesLowPoints, seriesIndex) => {
            const n = seriesLowPoints.length -1;
            const area = areas[seriesIndex];
            for (let datumIndex = n; datumIndex >= 0; datumIndex--) {
                const [x, y] = seriesLowPoints[datumIndex];
                area.path['lineTo'](x, y);
            }
        });

        root.append(areas.concat(...lines));

        return { lines, areas };
    }
}
