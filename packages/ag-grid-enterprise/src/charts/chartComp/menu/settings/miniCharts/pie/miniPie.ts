import type { AgChartsExports } from '../../../../../agChartsExports';
import type { MiniChartSelector, ThemeTemplateParameters } from '../../miniChartsContainer';
import { MiniDonutClass } from './miniDonut';

export class MiniPieClass extends MiniDonutClass {
    constructor(
        container: HTMLElement,
        agChartsExports: AgChartsExports,
        fills: string[],
        strokes: string[],
        themeTemplateParameters: ThemeTemplateParameters,
        isCustomTheme: boolean
    ) {
        super(container, agChartsExports, fills, strokes, themeTemplateParameters, isCustomTheme, 0, 'pieTooltip');
    }
}

export const MiniPie: MiniChartSelector = {
    chartType: 'pie',
    miniChart: MiniPieClass,
};
