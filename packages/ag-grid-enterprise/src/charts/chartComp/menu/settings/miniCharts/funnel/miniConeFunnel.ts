import type { AgChartsExports } from '../../../../../agChartsExports';
import type { ChartTranslationKey } from '../../../../services/chartTranslationService';
import type { MiniChartSelector } from '../../miniChartsContainer';
import type { XYCoordShape } from '../miniChartApi';
import { MiniFunnelClass } from './miniFunnel';

const CONE_FUNNEL_SHAPES: XYCoordShape[] = [
    [
        [13, 16],
        [10.75, 11.5],
        [5.25, 11.5],
        [3, 16],
    ],
    [
        [10.75, 11.5],
        [8.875, 6],
        [7.125, 6],
        [5.25, 11.5],
    ],
    [
        [8.875, 6],
        [8.875, 1.5],
        [7.125, 1.5],
        [7.125, 6],
    ],
];

export class MiniConeFunnelClass extends MiniFunnelClass {
    constructor(
        container: HTMLElement,
        agChartsExports: AgChartsExports,
        fills: string[],
        strokes: string[],
        _isCustomTheme: boolean,
        tooltipName: ChartTranslationKey = 'coneFunnelTooltip'
    ) {
        super(container, agChartsExports, fills, strokes, _isCustomTheme, tooltipName, CONE_FUNNEL_SHAPES);
    }

    override updateColors(fills: string[], strokes: string[]): void {
        this.shapes.forEach((bar, i) => {
            bar.fill = fills[0];
            bar.fillOpacity = 1 - i * 0.2;
            bar.stroke = strokes[0];
            bar.strokeWidth = 0;
        });
    }
}

export const MiniConeFunnel: MiniChartSelector = {
    chartType: 'coneFunnel',
    miniChart: MiniConeFunnelClass,
};
