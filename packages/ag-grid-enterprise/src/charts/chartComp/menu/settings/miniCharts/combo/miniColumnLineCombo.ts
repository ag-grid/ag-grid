import type { Path, Rect } from 'ag-charts-types/scene';

import type { AgChartsExports } from '../../../../../agChartsExports';
import type { MiniChartSelector } from '../../miniChartsContainer';
import { createColumnRects, createLinePaths } from '../miniChartHelpers';
import { MiniChartWithAxes } from '../miniChartWithAxes';

export class MiniColumnLineComboClass extends MiniChartWithAxes {
    private columns: Rect[];
    private lines: Path[];

    private columnData = [3, 4];

    private lineData = [[5, 4, 6, 5, 4]];

    constructor(container: HTMLElement, agChartsExports: AgChartsExports, fills: string[], strokes: string[]) {
        super(container, agChartsExports, 'columnLineComboTooltip');

        const { root, columnData, lineData, size, padding } = this;

        this.columns = createColumnRects({
            stacked: false,
            root,
            data: columnData,
            size,
            padding,
            xScaleDomain: [0, 1],
            yScaleDomain: [0, 4],
            xScalePadding: 0.5,
            agChartsExports,
        });

        root.append(this.columns);

        this.lines = createLinePaths(agChartsExports, root, lineData, size, padding);

        this.updateColors(fills, strokes);
    }

    updateColors(fills: string[], strokes: string[]) {
        this.columns.forEach((bar: any, i: number) => {
            bar.fill = fills[i];
            bar.stroke = strokes[i];
        });

        this.lines.forEach((line: any, i: number) => {
            line.stroke = fills[i + 2];
        });
    }
}

export const MiniColumnLineCombo: MiniChartSelector = {
    chartType: 'columnLineCombo',
    miniChart: MiniColumnLineComboClass,
};
