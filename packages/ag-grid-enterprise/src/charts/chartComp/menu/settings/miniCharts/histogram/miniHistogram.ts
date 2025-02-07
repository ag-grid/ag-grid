import type { Rect } from 'ag-charts-types/scene';

import type { AgChartsExports } from '../../../../../agChartsExports';
import type { MiniChartSelector } from '../../miniChartsContainer';
import { MiniChartWithAxes } from '../miniChartWithAxes';

export class MiniHistogramClass extends MiniChartWithAxes {
    private readonly bars: Rect[];

    constructor(container: HTMLElement, agChartsExports: AgChartsExports, fills: string[], strokes: string[]) {
        super(container, agChartsExports, 'histogramTooltip');

        const {
            padding,
            size,
            agChartsExports: { _Scene },
        } = this;

        // approx normal curve
        const data = [2, 5, 11, 13, 10, 6, 1];

        const xScale = new _Scene.LinearScale();
        xScale.domain = [0, data.length];
        xScale.range = [padding, size - padding];

        const yScale = new _Scene.LinearScale();
        yScale.domain = [0, data.reduce((a, b) => Math.max(a, b), 0)];
        yScale.range = [size - padding, padding];

        const bottom = yScale.convert(0);

        this.bars = data.map((datum, i) => {
            const top = yScale.convert(datum);
            const left = xScale.convert(i);
            const right = xScale.convert(i + 1);

            const rect = new _Scene.Rect();
            rect.x = left;
            rect.y = top;
            rect.width = right - left;
            rect.height = bottom - top;
            rect.strokeWidth = 1;
            rect.strokeOpacity = 0.75;
            rect.crisp = true;

            return rect;
        });

        this.updateColors(fills, strokes);
        this.root.append(this.bars);
    }

    updateColors([fill]: string[], [stroke]: string[]) {
        this.bars.forEach((bar) => {
            bar.fill = fill;
            bar.stroke = stroke;
        });
    }
}

export const MiniHistogram: MiniChartSelector = {
    chartType: 'histogram',
    miniChart: MiniHistogramClass,
};
