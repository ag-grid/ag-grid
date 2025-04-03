import type { Path } from 'ag-charts-types/scene';

import type { AgChartsExports } from '../../../../../agChartsExports';
import type { ChartTranslationKey } from '../../../../services/chartTranslationService';
import type { MiniChartSelector } from '../../miniChartsContainer';
import { miniLineData } from '../line/miniLine';
import { createAreaPaths } from '../miniChartHelpers';
import { MiniChartWithAxes } from '../miniChartWithAxes';

export const miniAreaData = miniLineData;

export class MiniAreaClass extends MiniChartWithAxes {
    protected readonly areas: Path[];

    constructor(
        container: HTMLElement,
        agChartsExports: AgChartsExports,
        fills: string[],
        strokes: string[],
        _isCustomTheme: boolean,
        data: number[][] = miniAreaData,
        tooltipName: ChartTranslationKey = 'groupedAreaTooltip',
        stacked: boolean = false
    ) {
        super(container, agChartsExports, tooltipName);

        this.areas = createAreaPaths(agChartsExports._Scene, this.root, data, this.size, this.padding, stacked);

        this.updateColors(fills, strokes);
    }

    updateColors(fills: string[], strokes: string[]) {
        this.areas.forEach((area, i) => {
            area.fill = fills[i];
            area.stroke = strokes[i];
            area.strokeWidth = 1;
            area.strokeOpacity = 0.75;
            area.fillOpacity = 0.7;
        });
    }
}

export const MiniArea: MiniChartSelector = {
    chartType: 'area',
    miniChart: MiniAreaClass,
};
