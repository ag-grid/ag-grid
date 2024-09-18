import type { ChartType } from '@ag-grid-community/core';

import type { ChartTranslationKey } from '../../../../services/chartTranslationService';
import type { ThemeTemplateParameters } from '../../miniChartsContainer';
import type { DomainRange } from '../miniChartApi';
import { MiniLine } from './miniLine';
import { MiniStackedLine } from './miniStackedLine';

export class MiniNormalizedLine extends MiniLine {
    static override chartType: ChartType = 'normalizedLine';
    static override readonly data = MiniStackedLine.data.map((stack, sindex, array) => {
        const colSum = stack.map((y, index) => array.reduce((acc, cur) => Math.max(acc, cur[index]), 0));
        return stack.map((y, index) => (y / colSum[index]) * 19);
    });

    constructor(
        container: HTMLElement,
        fills: string[],
        strokes: string[],
        themeTemplateParameters: ThemeTemplateParameters,
        isCustomTheme: boolean,
        data: number[][] = MiniNormalizedLine.data,
        tooltipName: ChartTranslationKey = 'normalizedLineTooltip',
        xDomain: DomainRange = [0, 4],
        yDomain: DomainRange = [3, 20]
    ) {
        super(container, fills, strokes, themeTemplateParameters, isCustomTheme, data, tooltipName, xDomain, yDomain);
    }
}
