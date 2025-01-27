import type { ChartType } from 'ag-grid-community';

import type { AgChartsExports } from '../../../../../agChartsExports';
import type { ChartTranslationKey } from '../../../../services/chartTranslationService';
import type { ThemeTemplateParameters } from '../../miniChartsContainer';
import type { XYCoordShape } from '../miniChartApi';
import { MiniFunnel } from './miniFunnel';

const PYRAMID_SHAPES: XYCoordShape[] = [
    [
        [8, 16],
        [8.875, 13],
        [7.125, 13],
    ],
    [
        [9, 12.5],
        [10.75, 7],
        [5.25, 7],
        [7, 12.5],
    ],
    [
        [11, 6.5],
        [13, 0],
        [3, 0],
        [5, 6.5],
    ],
];

export class MiniPyramid extends MiniFunnel {
    static override chartType: ChartType = 'pyramid';

    constructor(
        container: HTMLElement,
        agChartsExports: AgChartsExports,
        fills: string[],
        strokes: string[],
        _themeTemplateParameters: ThemeTemplateParameters,
        _isCustomTheme: boolean,
        tooltipName: ChartTranslationKey = 'pyramidTooltip'
    ) {
        super(
            container,
            agChartsExports,
            fills,
            strokes,
            _themeTemplateParameters,
            _isCustomTheme,
            tooltipName,
            PYRAMID_SHAPES
        );
    }

    override updateColors(fills: string[], strokes: string[]): void {
        this.shapes.forEach((bar, i) => {
            bar.fill = fills[i];
            bar.stroke = strokes[i];
            bar.strokeWidth = 0;
        });
    }
}
