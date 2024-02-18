"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiniSunburst = void 0;
const miniChartWithPolarAxes_1 = require("../miniChartWithPolarAxes");
const ag_charts_community_1 = require("ag-charts-community");
class MiniSunburst extends miniChartWithPolarAxes_1.MiniChartWithPolarAxes {
    constructor(container, fills, strokes) {
        super(container, 'sunburstTooltip');
        // Hierarchical data using multidimensional array
        this.data = [
            [[], []],
            [[], []],
            [[], []],
        ];
        // Rotate the chart by the given angle (-90 degrees)
        this.angleOffset = -Math.PI / 2;
        this.innerRadiusRatio = 0;
        this.showRadiusAxisLine = false;
        this.showAngleAxisLines = false;
        const { data, size, padding, angleOffset, innerRadiusRatio } = this;
        const radius = (size - padding * 2) / 2;
        const angleRange = [angleOffset + 0, angleOffset + 2 * Math.PI];
        const angleExtent = Math.abs(angleRange[1] - angleRange[0]);
        const radiusRange = [radius * innerRadiusRatio, radius];
        const radiusExtent = Math.abs(radiusRange[1] - radiusRange[0]);
        let maxDepth = 0;
        const findMaxDepth = (data, parentDepth) => {
            data.forEach((child) => {
                const depth = parentDepth + 1;
                maxDepth = Math.max(maxDepth, depth);
                findMaxDepth(child, depth);
            });
        };
        findMaxDepth(data, 0);
        const radiusRatio = radiusExtent / maxDepth;
        const center = this.size / 2;
        const startAngle = angleRange[0];
        this.series = [];
        const createSectors = (data, depth, startAngle, availableAngle, group) => {
            const isArray = Array.isArray(data);
            if (!isArray) {
                return;
            }
            const childDepth = depth + 1;
            let previousAngle = startAngle;
            data.forEach((child, childIndex, children) => {
                let childGroup = group;
                if (!childGroup) {
                    childGroup = new ag_charts_community_1._Scene.Group();
                    this.series.push(childGroup);
                }
                const innerRadius = radiusRange[0] + depth * radiusRatio;
                const outerRadius = radiusRange[0] + childDepth * radiusRatio;
                const angleRatio = 1 / children.length;
                const start = previousAngle;
                const end = start + availableAngle * angleRatio;
                const sector = new ag_charts_community_1._Scene.Sector();
                sector.centerX = center;
                sector.centerY = center;
                sector.innerRadius = innerRadius;
                sector.outerRadius = outerRadius;
                sector.startAngle = start;
                sector.endAngle = end;
                sector.stroke = undefined;
                sector.strokeWidth = 0;
                sector.inset = 0.75;
                previousAngle = end;
                childGroup.append(sector);
                createSectors(child, childDepth, start, Math.abs(end - start), childGroup);
            });
        };
        createSectors(data, 0, startAngle, angleExtent);
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
exports.MiniSunburst = MiniSunburst;
MiniSunburst.chartType = 'sunburst';
