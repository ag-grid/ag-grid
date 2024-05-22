import { ChartType } from '@ag-grid-community/core';

import { ThemeTemplateParameters } from '../../miniChartsContainer';
import { MiniStackedBar } from './miniStackedBar';

export class MiniNormalizedBar extends MiniStackedBar {
    static chartType: ChartType = 'normalizedBar';
    static data = [
        [10, 10, 10],
        [6, 7, 8],
        [2, 4, 6],
    ];

    constructor(
        container: HTMLElement,
        fills: string[],
        strokes: string[],
        themeTemplateParameters: ThemeTemplateParameters,
        isCustomTheme: boolean
    ) {
        super(
            container,
            fills,
            strokes,
            themeTemplateParameters,
            isCustomTheme,
            MiniNormalizedBar.data,
            [0, 10],
            'normalizedBarTooltip'
        );
    }
}
