import { MiniChartWithPolarAxes } from '../miniChartWithPolarAxes.mjs';
import { createPolarPaths } from '../miniChartHelpers.mjs';
export class MiniRadarLine extends MiniChartWithPolarAxes {
    constructor(container, fills, strokes) {
        super(container, 'radarLineTooltip');
        this.markerSize = 4;
        this.data = [
            [8, 7, 8, 7, 8, 8, 7, 8],
            [6, 8, 5, 10, 6, 7, 4, 6],
            [0, 3, 3, 5, 4, 4, 2, 0]
        ];
        this.showRadiusAxisLine = false;
        const radius = (this.size - this.padding * 2) / 2;
        const innerRadius = 0;
        const { paths, markers } = createPolarPaths(this.root, this.data, this.size, radius, innerRadius, this.markerSize);
        this.lines = paths;
        this.markers = markers;
        this.updateColors(fills, strokes);
    }
    updateColors(fills, strokes) {
        this.lines.forEach((line, i) => {
            const n = this.data[i].length;
            line.stroke = fills[i];
            const startIdx = i * n;
            const endIdx = startIdx + n;
            const markers = this.markers.slice(startIdx, endIdx);
            markers.forEach((marker) => {
                marker.stroke = strokes[i];
                marker.fill = fills[i];
            });
        });
    }
}
MiniRadarLine.chartType = 'radarLine';
