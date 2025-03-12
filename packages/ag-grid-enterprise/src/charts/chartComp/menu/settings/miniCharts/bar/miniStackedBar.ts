import { _flatten } from 'ag-grid-community';

import type { AgChartsExports } from '../../../../../agChartsExports';
import type { ChartTranslationKey } from '../../../../services/chartTranslationService';
import type { MiniChartSelector } from '../../miniChartsContainer';
import { MiniChartWithAxes } from '../miniChartWithAxes';

export const miniStackedBarData = [
    [8, 12, 16],
    [6, 9, 12],
    [2, 3, 4],
];

export class MiniStackedBarClass extends MiniChartWithAxes {
    private readonly bars: any[][];

    constructor(
        container: HTMLElement,
        agChartsExports: AgChartsExports,
        fills: string[],
        strokes: string[],
        _isCustomTheme: boolean,
        data = miniStackedBarData,
        xScaleDomain = [0, 16],
        tooltipName: ChartTranslationKey = 'stackedBarTooltip'
    ) {
        super(container, agChartsExports, tooltipName);

        const { _Scene } = agChartsExports;
        const size = this.size;
        const padding = this.padding;

        const yScale = new _Scene.CategoryScale();
        yScale.domain = [0, 1, 2];
        yScale.range = [padding, size - padding];
        yScale.paddingInner = 0.3;
        yScale.paddingOuter = 0.3;

        const xScale = new _Scene.LinearScale();
        xScale.domain = xScaleDomain;
        xScale.range = [size - padding, padding];

        const bottom = xScale.convert(0);
        const height = yScale.bandwidth;

        this.bars = data.map((series) =>
            series.map((datum, i) => {
                const rect = new _Scene.Rect();
                rect.x = padding;
                rect.y = yScale.convert(i);
                rect.width = bottom - xScale.convert(datum);
                rect.height = height;
                rect.strokeWidth = 0;
                rect.crisp = true;

                return rect;
            })
        );

        this.updateColors(fills, strokes);
        this.root.append(_flatten(this.bars));
    }

    updateColors(fills: string[], strokes: string[]) {
        this.bars.forEach((series, i) =>
            series.forEach((bar) => {
                bar.fill = fills[i];
                bar.stroke = strokes[i];
            })
        );
    }
}

export const MiniStackedBar: MiniChartSelector = {
    chartType: 'stackedBar',
    miniChart: MiniStackedBarClass,
};
