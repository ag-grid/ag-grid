import type { AgChartsExports } from '../../../../../agChartsExports';
import type { MiniChartSelector } from '../../miniChartsContainer';
import { MiniStackedColumnClass } from './miniStackedColumn';

export const miniNormalizedColumnData = [
    [10, 10, 10],
    [6, 7, 8],
    [2, 4, 6],
];

export class MiniNormalizedColumnClass extends MiniStackedColumnClass {
    constructor(
        container: HTMLElement,
        agChartsExports: AgChartsExports,
        fills: string[],
        strokes: string[],
        isCustomTheme: boolean
    ) {
        super(
            container,
            agChartsExports,
            fills,
            strokes,
            isCustomTheme,
            miniNormalizedColumnData,
            [0, 10],
            'normalizedColumnTooltip'
        );
    }
}

export const MiniNormalizedColumn: MiniChartSelector = {
    chartType: 'normalizedColumn',
    miniChart: MiniNormalizedColumnClass,
};
