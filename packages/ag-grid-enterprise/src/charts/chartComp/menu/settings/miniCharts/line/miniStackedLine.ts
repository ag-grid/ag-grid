import { _Scene } from 'ag-charts-community';

import type { ChartType } from 'ag-grid-community';

import type { ChartTranslationKey } from '../../../../services/chartTranslationService';
import type { ThemeTemplateParameters } from '../../miniChartsContainer';
import type { DomainRange } from '../miniChartApi';
import { MiniLine } from './miniLine';

export class MiniStackedLine extends MiniLine {
    static override chartType: ChartType = 'stackedLine';
    static override readonly data = MiniLine.data.map((stack, sindex, array) => {
        const result = stack.map((y, i) => array.slice(0, sindex + 1).reduce((p, c) => p + c[i], 0));
        return result;
    });

    constructor(
        container: HTMLElement,
        fills: string[],
        strokes: string[],
        _themeTemplateParameters: ThemeTemplateParameters,
        _isCustomTheme: boolean,
        data: number[][] = MiniStackedLine.data,
        tooltipName: ChartTranslationKey = 'stackedLineTooltip',
        xDomain: DomainRange = [0, 4],
        yDomain: DomainRange = [3, 20]
    ) {
        super(container, fills, strokes, _themeTemplateParameters, _isCustomTheme, data, tooltipName, xDomain, yDomain);
    }
}
