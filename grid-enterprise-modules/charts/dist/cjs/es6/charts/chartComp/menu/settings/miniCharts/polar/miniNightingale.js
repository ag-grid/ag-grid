"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiniNightingale = void 0;
const miniChartWithPolarAxes_1 = require("../miniChartWithPolarAxes");
const ag_charts_community_1 = require("ag-charts-community");
const miniChartHelpers_1 = require("../miniChartHelpers");
class MiniNightingale extends miniChartWithPolarAxes_1.MiniChartWithPolarAxes {
    constructor(container, fills, strokes) {
        super(container, 'nightingaleTooltip');
        this.data = [
            [6, 10, 9, 8, 7, 8],
            [4, 6, 5, 4, 5, 5],
            [3, 5, 4, 3, 4, 7],
        ];
        this.showRadiusAxisLine = false;
        const radius = (this.size - this.padding * 2) / 2;
        const angleScale = new ag_charts_community_1._Scene.BandScale();
        angleScale.domain = this.data[0].map((_, index) => index);
        angleScale.range = [-Math.PI, Math.PI];
        angleScale.paddingInner = 0;
        angleScale.paddingOuter = 0;
        const bandwidth = angleScale.bandwidth * 0.7;
        const { processedData, max } = (0, miniChartHelpers_1.accumulateData)(this.data);
        const radiusScale = new ag_charts_community_1._Scene.LinearScale();
        radiusScale.domain = [0, max];
        radiusScale.range = [0, radius];
        const center = this.size / 2;
        this.series = processedData.map((series, index) => {
            const previousSeries = index < 0 ? undefined : processedData[index - 1];
            const seriesGroup = new ag_charts_community_1._Scene.Group({ zIndex: 1000000 });
            const seriesSectors = series.map((datum, i) => {
                const previousDatum = previousSeries === null || previousSeries === void 0 ? void 0 : previousSeries[i];
                const outerRadius = radiusScale.convert(datum);
                const innerRadius = radiusScale.convert(previousDatum !== null && previousDatum !== void 0 ? previousDatum : 0);
                const startAngle = angleScale.convert(i);
                const endAngle = startAngle + bandwidth;
                const sector = new ag_charts_community_1._Scene.Sector();
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
exports.MiniNightingale = MiniNightingale;
MiniNightingale.chartType = 'nightingale';
