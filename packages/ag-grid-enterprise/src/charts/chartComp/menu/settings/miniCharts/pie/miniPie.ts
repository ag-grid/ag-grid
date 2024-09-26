import type { ChartType } from 'ag-grid-community';

import type { ThemeTemplateParameters } from '../../miniChartsContainer';
import { MiniDonut } from './miniDonut';

export class MiniPie extends MiniDonut {
    static override chartType: ChartType = 'pie';

    constructor(
        container: HTMLElement,
        fills: string[],
        strokes: string[],
        themeTemplateParameters: ThemeTemplateParameters,
        isCustomTheme: boolean
    ) {
        super(container, fills, strokes, themeTemplateParameters, isCustomTheme, 0, 'pieTooltip');
    }
}
