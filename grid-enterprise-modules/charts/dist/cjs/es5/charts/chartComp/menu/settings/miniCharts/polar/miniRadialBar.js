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
exports.MiniRadialBar = void 0;
var miniChartWithPolarAxes_1 = require("../miniChartWithPolarAxes");
var ag_charts_community_1 = require("ag-charts-community");
var miniChartHelpers_1 = require("../miniChartHelpers");
var MiniRadialBar = /** @class */ (function (_super) {
    __extends(MiniRadialBar, _super);
    function MiniRadialBar(container, fills, strokes) {
        var _this = _super.call(this, container, 'radialBarTooltip') || this;
        _this.data = [
            [6, 8, 10],
            [4, 4, 3],
            [5, 4, 2],
        ];
        _this.showRadiusAxisLine = false;
        var radius = (_this.size - _this.padding) / 2;
        var innerRadiusRatio = 0.4;
        var innerRadius = radius * innerRadiusRatio;
        var totalRadius = radius + innerRadius;
        var radiusScale = new ag_charts_community_1._Scene.BandScale();
        radiusScale.domain = _this.data[0].map(function (_, index) { return index; });
        radiusScale.range = [radius, innerRadius];
        radiusScale.paddingInner = 0.5;
        radiusScale.paddingOuter = 0;
        var bandwidth = radiusScale.bandwidth;
        var _a = (0, miniChartHelpers_1.accumulateData)(_this.data), processedData = _a.processedData, max = _a.max;
        var angleScale = new ag_charts_community_1._Scene.LinearScale();
        angleScale.domain = [0, Math.ceil(max * 1.5)];
        var start = (3 / 2) * Math.PI;
        var end = start + 2 * Math.PI;
        angleScale.range = [start, end];
        var center = _this.size / 2;
        _this.series = processedData.map(function (series, index) {
            var previousSeries = index < 0 ? undefined : processedData[index - 1];
            var seriesGroup = new ag_charts_community_1._Scene.Group({ zIndex: 1000000 });
            var seriesSectors = series.map(function (datum, i) {
                var _a;
                var previousDatum = (_a = previousSeries === null || previousSeries === void 0 ? void 0 : previousSeries[i]) !== null && _a !== void 0 ? _a : 0;
                var innerRadius = totalRadius - radiusScale.convert(i);
                var outerRadius = innerRadius + bandwidth;
                var startAngle = angleScale.convert(previousDatum);
                var endAngle = angleScale.convert(datum);
                var sector = new ag_charts_community_1._Scene.Sector();
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
        _this.root.append(_this.series);
        _this.updateColors(fills, strokes);
        return _this;
    }
    MiniRadialBar.prototype.updateColors = function (fills, strokes) {
        this.series.forEach(function (group, i) {
            var _a;
            (_a = group.children) === null || _a === void 0 ? void 0 : _a.forEach(function (sector) {
                sector.fill = fills[i % fills.length];
                sector.stroke = strokes[i % strokes.length];
            });
        });
    };
    MiniRadialBar.chartType = 'radialBar';
    return MiniRadialBar;
}(miniChartWithPolarAxes_1.MiniChartWithPolarAxes));
exports.MiniRadialBar = MiniRadialBar;
