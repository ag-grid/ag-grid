"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiniRadialColumn = void 0;
const ag_charts_community_1 = require("ag-charts-community");
const miniChartWithPolarAxes_1 = require("../miniChartWithPolarAxes");
const miniChartHelpers_1 = require("../miniChartHelpers");
class MiniRadialColumn extends miniChartWithPolarAxes_1.MiniChartWithPolarAxes {
    constructor(container, fills, strokes) {
        super(container, 'radialColumnTooltip');
        this.data = [
            [6, 8, 10, 2, 6, 5],
            [4, 4, 3, 6, 4, 4],
            [5, 4, 2, 9, 8, 9],
        ];
        this.showRadiusAxisLine = false;
        const { padding, size, data } = this;
        const radius = (size - padding * 2) / 2;
        const innerRadiusRatio = 0.4;
        const axisInnerRadius = radius * innerRadiusRatio;
        const angleScale = new ag_charts_community_1._Scene.BandScale();
        angleScale.domain = data[0].map((_, index) => index);
        angleScale.range = [0, 2 * Math.PI];
        angleScale.paddingInner = 0;
        angleScale.paddingOuter = 0;
        const bandwidth = angleScale.bandwidth * 0.7;
        const { processedData, max } = (0, miniChartHelpers_1.accumulateData)(data);
        const radiusScale = new ag_charts_community_1._Scene.LinearScale();
        radiusScale.domain = [0, max];
        radiusScale.range = [axisInnerRadius, radius];
        const center = this.size / 2;
        this.series = processedData.map((series, seriesIndex) => {
            const firstSeries = seriesIndex === 0;
            const previousSeries = firstSeries ? undefined : processedData[seriesIndex - 1];
            const seriesGroup = new ag_charts_community_1._Scene.Group({ zIndex: 1000000 });
            const seriesColumns = series.map((datum, i) => {
                const previousDatum = previousSeries === null || previousSeries === void 0 ? void 0 : previousSeries[i];
                const outerRadius = radiusScale.convert(datum);
                const innerRadius = radiusScale.convert(previousDatum !== null && previousDatum !== void 0 ? previousDatum : 0);
                const startAngle = angleScale.convert(i);
                const endAngle = startAngle + bandwidth;
                const columnWidth = ag_charts_community_1._Scene.getRadialColumnWidth(startAngle, endAngle, radius, 0.5, 0.5);
                const column = new ag_charts_community_1._Scene.RadialColumnShape();
                column.scalingCenterX = center;
                column.scalingCenterY = center;
                column.columnWidth = columnWidth;
                column.innerRadius = innerRadius;
                column.outerRadius = outerRadius;
                column.startAngle = startAngle;
                column.endAngle = endAngle;
                column.isBeveled = true;
                column.axisInnerRadius = axisInnerRadius;
                column.axisOuterRadius = radius;
                column.stroke = undefined;
                column.strokeWidth = 0;
                return column;
            });
            seriesGroup.append(seriesColumns);
            seriesGroup.translationX = center;
            seriesGroup.translationY = center;
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
exports.MiniRadialColumn = MiniRadialColumn;
MiniRadialColumn.chartType = 'radialColumn';
