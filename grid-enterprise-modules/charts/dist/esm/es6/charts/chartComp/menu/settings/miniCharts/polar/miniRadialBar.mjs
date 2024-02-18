import { MiniChartWithPolarAxes } from '../miniChartWithPolarAxes.mjs';
import { _Scene } from 'ag-charts-community';
import { accumulateData } from '../miniChartHelpers.mjs';
export class MiniRadialBar extends MiniChartWithPolarAxes {
    constructor(container, fills, strokes) {
        super(container, 'radialBarTooltip');
        this.data = [
            [6, 8, 10],
            [4, 4, 3],
            [5, 4, 2],
        ];
        this.showRadiusAxisLine = false;
        const radius = (this.size - this.padding) / 2;
        const innerRadiusRatio = 0.4;
        const innerRadius = radius * innerRadiusRatio;
        const totalRadius = radius + innerRadius;
        const radiusScale = new _Scene.BandScale();
        radiusScale.domain = this.data[0].map((_, index) => index);
        radiusScale.range = [radius, innerRadius];
        radiusScale.paddingInner = 0.5;
        radiusScale.paddingOuter = 0;
        const bandwidth = radiusScale.bandwidth;
        const { processedData, max } = accumulateData(this.data);
        const angleScale = new _Scene.LinearScale();
        angleScale.domain = [0, Math.ceil(max * 1.5)];
        const start = (3 / 2) * Math.PI;
        const end = start + 2 * Math.PI;
        angleScale.range = [start, end];
        const center = this.size / 2;
        this.series = processedData.map((series, index) => {
            const previousSeries = index < 0 ? undefined : processedData[index - 1];
            const seriesGroup = new _Scene.Group({ zIndex: 1000000 });
            const seriesSectors = series.map((datum, i) => {
                var _a;
                const previousDatum = (_a = previousSeries === null || previousSeries === void 0 ? void 0 : previousSeries[i]) !== null && _a !== void 0 ? _a : 0;
                const innerRadius = totalRadius - radiusScale.convert(i);
                const outerRadius = innerRadius + bandwidth;
                const startAngle = angleScale.convert(previousDatum);
                const endAngle = angleScale.convert(datum);
                const sector = new _Scene.Sector();
                sector.centerX = center;
                sector.centerY = center;
                sector.innerRadius = innerRadius;
                sector.outerRadius = outerRadius;
                sector.startAngle = startAngle;
                sector.endAngle = endAngle;
                sector.stroke = undefined;
                sector.strokeWidth = 0;
                return sector;
            });
            seriesGroup.append(seriesSectors);
            return seriesGroup;
        });
        this.root.append(this.series);
        this.updateColors(fills, strokes);
    }
    updateColors(fills, strokes) {
        this.series.forEach((group, i) => {
            var _a;
            (_a = group.children) === null || _a === void 0 ? void 0 : _a.forEach((sector) => {
                sector.fill = fills[i % fills.length];
                sector.stroke = strokes[i % strokes.length];
            });
        });
    }
}
MiniRadialBar.chartType = 'radialBar';
