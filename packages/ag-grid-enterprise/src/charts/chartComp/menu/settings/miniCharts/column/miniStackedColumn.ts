import { _flatten } from 'ag-grid-community';

import type { AgChartsExports } from '../../../../../agChartsExports';
import type { ChartTranslationKey } from '../../../../services/chartTranslationService';
import type { MiniChartSelector } from '../../miniChartsContainer';
import { createColumnRects } from '../miniChartHelpers';
import { MiniChartWithAxes } from '../miniChartWithAxes';

export const miniStackedColumnData = [
    [8, 12, 16],
    [6, 9, 12],
    [2, 3, 4],
];
export class MiniStackedColumnClass extends MiniChartWithAxes {
    private readonly stackedColumns: any[][];

    constructor(
        container: HTMLElement,
        agChartsExports: AgChartsExports,
        fills: string[],
        strokes: string[],
        _isCustomTheme: boolean,
        data = miniStackedColumnData,
        yScaleDomain = [0, 16],
        tooltipName: ChartTranslationKey = 'stackedColumnTooltip'
    ) {
        super(container, agChartsExports, tooltipName);

        const { root, size, padding } = this;

        this.stackedColumns = createColumnRects({
            stacked: true,
            root,
            data,
            size,
            padding,
            xScaleDomain: [0, 1, 2],
            yScaleDomain,
            xScalePadding: 0.3,
            agChartsExports,
        });

        root.append(_flatten(this.stackedColumns));

        this.updateColors(fills, strokes);
    }

    updateColors(fills: string[], strokes: string[]) {
        this.stackedColumns.forEach((series: any[], i: number) =>
            series.forEach((column) => {
                column.fill = fills[i];
                column.stroke = strokes[i];
            })
        );
    }
}

export const MiniStackedColumn: MiniChartSelector = {
    chartType: 'stackedColumn',
    miniChart: MiniStackedColumnClass,
};
