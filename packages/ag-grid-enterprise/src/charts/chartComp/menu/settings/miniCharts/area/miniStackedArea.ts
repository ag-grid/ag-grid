import type { AgChartsExports } from '../../../../../agChartsExports';
import type { ChartTranslationKey } from '../../../../services/chartTranslationService';
import type { MiniChartSelector } from '../../miniChartsContainer';
import { stackData } from '../miniChartHelpers';
import { MiniAreaClass, miniAreaData } from './miniArea';

export const miniStackedAreaData = stackData(miniAreaData);

export class MiniStackedAreaClass extends MiniAreaClass {
    constructor(
        container: HTMLElement,
        agChartsExports: AgChartsExports,
        fills: string[],
        strokes: string[],
        _isCustomTheme: boolean,
        data: number[][] = miniStackedAreaData,
        tooltipName: ChartTranslationKey = 'stackedAreaTooltip'
    ) {
        super(container, agChartsExports, fills, strokes, _isCustomTheme, data, tooltipName, true);
    }

    override updateColors(fills: string[], strokes: string[]) {
        this.areas.forEach((area, i) => {
            area.fill = fills[i];
            area.stroke = strokes[i];
        });
    }
}

export const MiniStackedArea: MiniChartSelector = {
    chartType: 'stackedArea',
    miniChart: MiniStackedAreaClass,
};
