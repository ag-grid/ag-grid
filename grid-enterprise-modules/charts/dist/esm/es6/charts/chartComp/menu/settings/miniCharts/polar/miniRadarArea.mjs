import { MiniChartWithPolarAxes } from '../miniChartWithPolarAxes.mjs';
import { createPolarPaths } from '../miniChartHelpers.mjs';
export class MiniRadarArea extends MiniChartWithPolarAxes {
    constructor(container, fills, strokes) {
        super(container, 'radarAreaTooltip');
        this.data = [
            [8, 10, 5, 7, 4, 1, 5, 8],
            [1, 1, 2, 7, 7, 8, 10, 1],
            [4, 5, 9, 9, 4, 2, 3, 4]
        ];
        this.showRadiusAxisLine = false;
        const radius = (this.size - this.padding * 2) / 2;
        const innerRadius = radius - this.size * 0.3;
        this.areas = createPolarPaths(this.root, this.data, this.size, radius, innerRadius).paths;
        this.updateColors(fills, strokes);
    }
    updateColors(fills, strokes) {
        this.areas.forEach((area, i) => {
            area.fill = fills[i];
            area.stroke = strokes[i];
        });
    }
}
MiniRadarArea.chartType = 'radarArea';
