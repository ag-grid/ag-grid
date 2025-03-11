import type { Path } from 'ag-charts-types/scene';

import type { AgChartsExports } from '../../../../../agChartsExports';
import type { ChartTranslationKey } from '../../../../services/chartTranslationService';
import type { MiniChartSelector } from '../../miniChartsContainer';
import { createLinePaths } from '../miniChartHelpers';
import { MiniChartWithAxes } from '../miniChartWithAxes';

export const miniLineData = [
    [1, 3, 5],
    [2, 6, 4],
    [5, 3, 1],
];

export class MiniLineClass extends MiniChartWithAxes {
    protected lines: Path[];

    constructor(
        container: HTMLElement,
        agChartsExports: AgChartsExports,
        fills: string[],
        strokes: string[],
        _isCustomTheme: boolean,
        data: number[][] = miniLineData,
        tooltipName: ChartTranslationKey = 'lineTooltip'
    ) {
        super(container, agChartsExports, tooltipName);

        const { size, padding, root } = this;
        this.lines = createLinePaths(agChartsExports, root, data, size, padding);

        this.updateColors(fills, strokes);
    }

    updateColors(fills: string[], _strokes: string[]) {
        this.lines.forEach((line: any, i: number) => {
            line.stroke = fills[i];
        });
    }
}

export const MiniLine: MiniChartSelector = {
    chartType: 'line',
    miniChart: MiniLineClass,
};
