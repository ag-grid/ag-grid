import type { AgChartsExports } from '../../../../../agChartsExports';
import type { ChartTranslationKey } from '../../../../services/chartTranslationService';
import type { MiniChartSelector } from '../../miniChartsContainer';
import { normalizeStackData } from '../miniChartHelpers';
import { MiniLineClass } from './miniLine';
import { miniStackedLineData } from './miniStackedLine';

export const miniNormalizedLineData = normalizeStackData(miniStackedLineData);

export class MiniNormalizedLineClass extends MiniLineClass {
    constructor(
        container: HTMLElement,
        agChartsExports: AgChartsExports,
        fills: string[],
        strokes: string[],
        isCustomTheme: boolean,
        data: number[][] = miniNormalizedLineData,
        tooltipName: ChartTranslationKey = 'normalizedLineTooltip'
    ) {
        super(container, agChartsExports, fills, strokes, isCustomTheme, data, tooltipName);
    }
}

export const MiniNormalizedLine: MiniChartSelector = {
    chartType: 'normalizedLine',
    miniChart: MiniNormalizedLineClass,
};
