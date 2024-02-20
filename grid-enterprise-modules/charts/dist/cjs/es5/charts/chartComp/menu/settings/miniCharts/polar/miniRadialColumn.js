"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiniRadialColumn = void 0;
var ag_charts_community_1 = require("ag-charts-community");
var miniChartWithPolarAxes_1 = require("../miniChartWithPolarAxes");
var miniChartHelpers_1 = require("../miniChartHelpers");
var MiniRadialColumn = /** @class */ (function (_super) {
    __extends(MiniRadialColumn, _super);
    function MiniRadialColumn(container, fills, strokes) {
        var _this = _super.call(this, container, 'radialColumnTooltip') || this;
        _this.data = [
            [6, 8, 10, 2, 6, 5],
            [4, 4, 3, 6, 4, 4],
            [5, 4, 2, 9, 8, 9],
        ];
        _this.showRadiusAxisLine = false;
        var _a = _this, padding = _a.padding, size = _a.size, data = _a.data;
        var radius = (size - padding * 2) / 2;
        var innerRadiusRatio = 0.4;
        var axisInnerRadius = radius * innerRadiusRatio;
        var angleScale = new ag_charts_community_1._Scene.BandScale();
        angleScale.domain = data[0].map(function (_, index) { return index; });
        angleScale.range = [0, 2 * Math.PI];
        angleScale.paddingInner = 0;
        angleScale.paddingOuter = 0;
        var bandwidth = angleScale.bandwidth * 0.7;
        var _b = (0, miniChartHelpers_1.accumulateData)(data), processedData = _b.processedData, max = _b.max;
        var radiusScale = new ag_charts_community_1._Scene.LinearScale();
        radiusScale.domain = [0, max];
        radiusScale.range = [axisInnerRadius, radius];
        var center = _this.size / 2;
        _this.series = processedData.map(function (series, seriesIndex) {
            var firstSeries = seriesIndex === 0;
            var previousSeries = firstSeries ? undefined : processedData[seriesIndex - 1];
            var seriesGroup = new ag_charts_community_1._Scene.Group({ zIndex: 1000000 });
            var seriesColumns = series.map(function (datum, i) {
                var previousDatum = previousSeries === null || previousSeries === void 0 ? void 0 : previousSeries[i];
                var outerRadius = radiusScale.convert(datum);
                var innerRadius = radiusScale.convert(previousDatum !== null && previousDatum !== void 0 ? previousDatum : 0);
                var startAngle = angleScale.convert(i);
                var endAngle = startAngle + bandwidth;
                var columnWidth = ag_charts_community_1._Scene.getRadialColumnWidth(startAngle, endAngle, radius, 0.5, 0.5);
                var column = new ag_charts_community_1._Scene.RadialColumnShape();
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
        _this.root.append(_this.series);
        _this.updateColors(fills, strokes);
        return _this;
    }
    MiniRadialColumn.prototype.updateColors = function (fills, strokes) {
        this.series.forEach(function (group, i) {
            var _a;
            (_a = group.children) === null || _a === void 0 ? void 0 : _a.forEach(function (sector) {
                sector.fill = fills[i % fills.length];
                sector.stroke = strokes[i % strokes.length];
            });
        });
    };
    MiniRadialColumn.chartType = 'radialColumn';
    return MiniRadialColumn;
}(miniChartWithPolarAxes_1.MiniChartWithPolarAxes));
exports.MiniRadialColumn = MiniRadialColumn;
