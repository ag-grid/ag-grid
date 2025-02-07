import type { AgChartsExports } from '../../../../../agChartsExports';
import type { MiniChartSelector, ThemeTemplateParameters } from '../../miniChartsContainer';
import { MiniStackedBarClass } from './miniStackedBar';

const miniNormalizedBarData = [
    [10, 10, 10],
    [6, 7, 8],
    [2, 4, 6],
];

export class MiniNormalizedBarClass extends MiniStackedBarClass {
    constructor(
        container: HTMLElement,
        agChartsExports: AgChartsExports,
        fills: string[],
        strokes: string[],
        themeTemplateParameters: ThemeTemplateParameters,
        isCustomTheme: boolean
    ) {
        super(
            container,
            agChartsExports,
            fills,
            strokes,
            themeTemplateParameters,
            isCustomTheme,
            miniNormalizedBarData,
            [0, 10],
            'normalizedBarTooltip'
        );
    }
}

export const MiniNormalizedBar: MiniChartSelector = {
    chartType: 'normalizedBar',
    miniChart: MiniNormalizedBarClass,
};
