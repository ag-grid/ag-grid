import { MiniChartWithPolarAxes } from '../miniChartWithPolarAxes';
import { _Scene } from 'ag-charts-community';
import { ChartType } from '@ag-grid-community/core';
import { createPolarLinePaths } from '../miniChartHelpers';

export class MiniRadarArea extends MiniChartWithPolarAxes {
    static chartType: ChartType = 'radarArea';
    private readonly areas: _Scene.Path[];

    private data = [
        [8, 7, 8, 4, 6, 1, 7, 8],
        [6, 8, 3, 7, 6, 7, 4, 6],
    ];

    constructor(
        container: HTMLElement,
        fills: string[],
        strokes: string[],
        tooltipName = 'radarAreaTooltip'
    ) {
        super(container, tooltipName);

        const radius = (this.size - this.padding * 2) / 2;
        const innerRadius = radius - this.size * 0.3;

        this.areas = createPolarLinePaths(this.root, this.data, this.size, radius, innerRadius);

        this.updateColors(fills, strokes);
    }

    updateColors(fills: string[], strokes: string[]) {
        this.areas.forEach((area, i) => {
            area.fill = fills[i];
            area.stroke = strokes[i];
        });
    }
}
