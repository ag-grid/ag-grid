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
exports.MiniNightingale = void 0;
var miniChartWithPolarAxes_1 = require("../miniChartWithPolarAxes");
var ag_charts_community_1 = require("ag-charts-community");
var miniChartHelpers_1 = require("../miniChartHelpers");
var MiniNightingale = /** @class */ (function (_super) {
    __extends(MiniNightingale, _super);
    function MiniNightingale(container, fills, strokes) {
        var _this = _super.call(this, container, 'nightingaleTooltip') || this;
        _this.data = [
            [6, 10, 9, 8, 7, 8],
            [4, 6, 5, 4, 5, 5],
            [3, 5, 4, 3, 4, 7],
        ];
        _this.showRadiusAxisLine = false;
        var radius = (_this.size - _this.padding * 2) / 2;
        var angleScale = new ag_charts_community_1._Scene.BandScale();
        angleScale.domain = _this.data[0].map(function (_, index) { return index; });
        angleScale.range = [-Math.PI, Math.PI];
        angleScale.paddingInner = 0;
        angleScale.paddingOuter = 0;
        var bandwidth = angleScale.bandwidth * 0.7;
        var _a = (0, miniChartHelpers_1.accumulateData)(_this.data), processedData = _a.processedData, max = _a.max;
        var radiusScale = new ag_charts_community_1._Scene.LinearScale();
        radiusScale.domain = [0, max];
        radiusScale.range = [0, radius];
        var center = _this.size / 2;
        _this.series = processedData.map(function (series, index) {
            var previousSeries = index < 0 ? undefined : processedData[index - 1];
            var seriesGroup = new ag_charts_community_1._Scene.Group({ zIndex: 1000000 });
            var seriesSectors = series.map(function (datum, i) {
                var previousDatum = previousSeries === null || previousSeries === void 0 ? void 0 : previousSeries[i];
                var outerRadius = radiusScale.convert(datum);
                var innerRadius = radiusScale.convert(previousDatum !== null && previousDatum !== void 0 ? previousDatum : 0);
                var startAngle = angleScale.convert(i);
                var endAngle = startAngle + bandwidth;
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
    MiniNightingale.prototype.updateColors = function (fills, strokes) {
        this.series.forEach(function (group, i) {
            var _a;
            (_a = group.children) === null || _a === void 0 ? void 0 : _a.forEach(function (sector) {
                sector.fill = fills[i % fills.length];
                sector.stroke = strokes[i % strokes.length];
            });
        });
    };
    MiniNightingale.chartType = 'nightingale';
    return MiniNightingale;
}(miniChartWithPolarAxes_1.MiniChartWithPolarAxes));
exports.MiniNightingale = MiniNightingale;
