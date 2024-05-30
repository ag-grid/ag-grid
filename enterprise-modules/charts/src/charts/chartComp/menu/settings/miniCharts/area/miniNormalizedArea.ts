import type { ChartType } from '@ag-grid-community/core';

import type { ThemeTemplateParameters } from '../../miniChartsContainer';
import { MiniStackedArea } from './miniStackedArea';

export class MiniNormalizedArea extends MiniStackedArea {
    static override chartType: ChartType = 'normalizedArea';
    static override readonly data = MiniStackedArea.data.map((stack) => {
        const sum = stack.reduce((p, c) => p + c, 0);
        return stack.map((v) => (v / sum) * 16);
    });

    constructor(
        container: HTMLElement,
        fills: string[],
        strokes: string[],
        themeTemplateParameters: ThemeTemplateParameters,
        isCustomTheme: boolean,
        data: number[][] = MiniNormalizedArea.data
    ) {
        super(container, fills, strokes, themeTemplateParameters, isCustomTheme, data, 'normalizedAreaTooltip');
    }
}
