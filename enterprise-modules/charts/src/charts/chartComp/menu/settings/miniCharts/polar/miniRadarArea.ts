import { ChartType } from '@ag-grid-community/core';
import { _Scene } from 'ag-charts-community';

import { createPolarPaths } from '../miniChartHelpers';
import { MiniChartWithPolarAxes } from '../miniChartWithPolarAxes';

export class MiniRadarArea extends MiniChartWithPolarAxes {
    static chartType: ChartType = 'radarArea';
    private readonly areas: _Scene.Path[];

    private data = [
        [8, 10, 5, 7, 4, 1, 5, 8],
        [1, 1, 2, 7, 7, 8, 10, 1],
        [4, 5, 9, 9, 4, 2, 3, 4],
    ];

    constructor(container: HTMLElement, fills: string[], strokes: string[]) {
        super(container, 'radarAreaTooltip');

        this.showRadiusAxisLine = false;

        const radius = (this.size - this.padding * 2) / 2;
        const innerRadius = radius - this.size * 0.3;

        this.areas = createPolarPaths(this.root, this.data, this.size, radius, innerRadius).paths;

        this.updateColors(fills, strokes);
    }

    updateColors(fills: string[], strokes: string[]) {
        this.areas.forEach((area, i) => {
            area.fill = fills[i];
            area.stroke = strokes[i];
        });
    }
}
