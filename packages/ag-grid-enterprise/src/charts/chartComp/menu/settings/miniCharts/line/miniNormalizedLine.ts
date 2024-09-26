import type { ChartType } from 'ag-grid-community';

import type { ChartTranslationKey } from '../../../../services/chartTranslationService';
import type { ThemeTemplateParameters } from '../../miniChartsContainer';
import { normalizeStackData } from '../miniChartHelpers';
import { MiniLine } from './miniLine';
import { MiniStackedLine } from './miniStackedLine';

export class MiniNormalizedLine extends MiniLine {
    static override chartType: ChartType = 'normalizedLine';

    static override readonly data = normalizeStackData(MiniStackedLine.data);

    constructor(
        container: HTMLElement,
        fills: string[],
        strokes: string[],
        themeTemplateParameters: ThemeTemplateParameters,
        isCustomTheme: boolean,
        data: number[][] = MiniNormalizedLine.data,
        tooltipName: ChartTranslationKey = 'normalizedLineTooltip'
    ) {
        super(container, fills, strokes, themeTemplateParameters, isCustomTheme, data, tooltipName);
    }
}
