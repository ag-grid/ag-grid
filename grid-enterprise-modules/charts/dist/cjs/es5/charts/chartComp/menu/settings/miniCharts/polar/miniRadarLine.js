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
exports.MiniRadarLine = void 0;
var miniChartWithPolarAxes_1 = require("../miniChartWithPolarAxes");
var miniChartHelpers_1 = require("../miniChartHelpers");
var MiniRadarLine = /** @class */ (function (_super) {
    __extends(MiniRadarLine, _super);
    function MiniRadarLine(container, fills, strokes) {
        var _this = _super.call(this, container, 'radarLineTooltip') || this;
        _this.markerSize = 4;
        _this.data = [
            [8, 7, 8, 7, 8, 8, 7, 8],
            [6, 8, 5, 10, 6, 7, 4, 6],
            [0, 3, 3, 5, 4, 4, 2, 0]
        ];
        _this.showRadiusAxisLine = false;
        var radius = (_this.size - _this.padding * 2) / 2;
        var innerRadius = 0;
        var _a = (0, miniChartHelpers_1.createPolarPaths)(_this.root, _this.data, _this.size, radius, innerRadius, _this.markerSize), paths = _a.paths, markers = _a.markers;
        _this.lines = paths;
        _this.markers = markers;
        _this.updateColors(fills, strokes);
        return _this;
    }
    MiniRadarLine.prototype.updateColors = function (fills, strokes) {
        var _this = this;
        this.lines.forEach(function (line, i) {
            var n = _this.data[i].length;
            line.stroke = fills[i];
            var startIdx = i * n;
            var endIdx = startIdx + n;
            var markers = _this.markers.slice(startIdx, endIdx);
            markers.forEach(function (marker) {
                marker.stroke = strokes[i];
                marker.fill = fills[i];
            });
        });
    };
    MiniRadarLine.chartType = 'radarLine';
    return MiniRadarLine;
}(miniChartWithPolarAxes_1.MiniChartWithPolarAxes));
exports.MiniRadarLine = MiniRadarLine;
