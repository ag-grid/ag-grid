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
exports.MiniRadarArea = void 0;
var miniChartWithPolarAxes_1 = require("../miniChartWithPolarAxes");
var miniChartHelpers_1 = require("../miniChartHelpers");
var MiniRadarArea = /** @class */ (function (_super) {
    __extends(MiniRadarArea, _super);
    function MiniRadarArea(container, fills, strokes) {
        var _this = _super.call(this, container, 'radarAreaTooltip') || this;
        _this.data = [
            [8, 10, 5, 7, 4, 1, 5, 8],
            [1, 1, 2, 7, 7, 8, 10, 1],
            [4, 5, 9, 9, 4, 2, 3, 4]
        ];
        _this.showRadiusAxisLine = false;
        var radius = (_this.size - _this.padding * 2) / 2;
        var innerRadius = radius - _this.size * 0.3;
        _this.areas = (0, miniChartHelpers_1.createPolarPaths)(_this.root, _this.data, _this.size, radius, innerRadius).paths;
        _this.updateColors(fills, strokes);
        return _this;
    }
    MiniRadarArea.prototype.updateColors = function (fills, strokes) {
        this.areas.forEach(function (area, i) {
            area.fill = fills[i];
            area.stroke = strokes[i];
        });
    };
    MiniRadarArea.chartType = 'radarArea';
    return MiniRadarArea;
}(miniChartWithPolarAxes_1.MiniChartWithPolarAxes));
exports.MiniRadarArea = MiniRadarArea;
