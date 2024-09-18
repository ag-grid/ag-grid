import type { ChartType } from '@ag-grid-community/core';
import type { _Scene } from 'ag-charts-community';

import type { ChartTranslationKey } from '../../../../services/chartTranslationService';
import type { ThemeTemplateParameters } from '../../miniChartsContainer';
import type { DomainRange } from '../miniChartApi';
import { createLinePaths } from '../miniChartHelpers';
import { MiniChartWithAxes } from '../miniChartWithAxes';

export class MiniLine extends MiniChartWithAxes {
    static chartType: ChartType = 'line';

    protected lines: _Scene.Path[];

    protected static data = [
        [6, 7, 8, 5, 6],
        [4, 6, 3, 4, 4],
        [2, 3, 4, 8, 7],
    ];

    constructor(
        container: HTMLElement,
        fills: string[],
        strokes: string[],
        _themeTemplateParameters: ThemeTemplateParameters,
        _isCustomTheme: boolean,
        data: number[][] = MiniLine.data,
        tooltipName: ChartTranslationKey = 'stackedLineTooltip',
        xDomain: DomainRange = [0, 4],
        yDomain: DomainRange = [1, 9]
    ) {
        super(container, tooltipName);

        this.lines = createLinePaths(this.root, data, this.size, this.padding, xDomain, yDomain);

        this.updateColors(fills, strokes);
    }

    updateColors(fills: string[], _strokes: string[]) {
        this.lines.forEach((line: _Scene.Path, i: number) => {
            line.stroke = fills[i];
        });
    }
}
