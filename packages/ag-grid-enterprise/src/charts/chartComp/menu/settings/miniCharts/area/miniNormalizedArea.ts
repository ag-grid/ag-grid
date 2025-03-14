import type { AgChartsExports } from '../../../../../agChartsExports';
import type { ChartTranslationKey } from '../../../../services/chartTranslationService';
import type { MiniChartSelector } from '../../miniChartsContainer';
import { normalizeStackData } from '../miniChartHelpers';
import { MiniStackedAreaClass, miniStackedAreaData } from './miniStackedArea';

export const miniNormalizedAreaData = normalizeStackData(miniStackedAreaData);
export class MiniNormalizedAreaClass extends MiniStackedAreaClass {
    constructor(
        container: HTMLElement,
        agChartsExports: AgChartsExports,
        fills: string[],
        strokes: string[],
        isCustomTheme: boolean,
        data: number[][] = miniNormalizedAreaData,
        tooltipName: ChartTranslationKey = 'normalizedAreaTooltip'
    ) {
        super(container, agChartsExports, fills, strokes, isCustomTheme, data, tooltipName);
    }
}

export const MiniNormalizedArea: MiniChartSelector = {
    chartType: 'normalizedArea',
    miniChart: MiniNormalizedAreaClass,
};
