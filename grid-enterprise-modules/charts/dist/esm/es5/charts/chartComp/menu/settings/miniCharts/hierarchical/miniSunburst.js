var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { MiniChartWithPolarAxes } from '../miniChartWithPolarAxes';
import { _Scene } from 'ag-charts-community';
var MiniSunburst = /** @class */ (function (_super) {
    __extends(MiniSunburst, _super);
    function MiniSunburst(container, fills, strokes) {
        var _this = _super.call(this, container, 'sunburstTooltip') || this;
        // Hierarchical data using multidimensional array
        _this.data = [
            [[], []],
            [[], []],
            [[], []],
        ];
        // Rotate the chart by the given angle (-90 degrees)
        _this.angleOffset = -Math.PI / 2;
        _this.innerRadiusRatio = 0;
        _this.showRadiusAxisLine = false;
        _this.showAngleAxisLines = false;
        var _a = _this, data = _a.data, size = _a.size, padding = _a.padding, angleOffset = _a.angleOffset, innerRadiusRatio = _a.innerRadiusRatio;
        var radius = (size - padding * 2) / 2;
        var angleRange = [angleOffset + 0, angleOffset + 2 * Math.PI];
        var angleExtent = Math.abs(angleRange[1] - angleRange[0]);
        var radiusRange = [radius * innerRadiusRatio, radius];
        var radiusExtent = Math.abs(radiusRange[1] - radiusRange[0]);
        var maxDepth = 0;
        var findMaxDepth = function (data, parentDepth) {
            data.forEach(function (child) {
                var depth = parentDepth + 1;
                maxDepth = Math.max(maxDepth, depth);
                findMaxDepth(child, depth);
            });
        };
        findMaxDepth(data, 0);
        var radiusRatio = radiusExtent / maxDepth;
        var center = _this.size / 2;
        var startAngle = angleRange[0];
        _this.series = [];
        var createSectors = function (data, depth, startAngle, availableAngle, group) {
            var isArray = Array.isArray(data);
            if (!isArray) {
                return;
            }
            var childDepth = depth + 1;
            var previousAngle = startAngle;
            data.forEach(function (child, childIndex, children) {
                var childGroup = group;
                if (!childGroup) {
                    childGroup = new _Scene.Group();
                    _this.series.push(childGroup);
                }
                var innerRadius = radiusRange[0] + depth * radiusRatio;
                var outerRadius = radiusRange[0] + childDepth * radiusRatio;
                var angleRatio = 1 / children.length;
                var start = previousAngle;
                var end = start + availableAngle * angleRatio;
                var sector = new _Scene.Sector();
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
        _this.root.append(_this.series);
        _this.updateColors(fills, strokes);
        return _this;
    }
    MiniSunburst.prototype.updateColors = function (fills, strokes) {
        this.series.forEach(function (group, i) {
            var _a;
            (_a = group.children) === null || _a === void 0 ? void 0 : _a.forEach(function (sector) {
                sector.fill = fills[i % fills.length];
                sector.stroke = strokes[i % strokes.length];
            });
        });
    };
    MiniSunburst.chartType = 'sunburst';
    return MiniSunburst;
}(MiniChartWithPolarAxes));
export { MiniSunburst };
