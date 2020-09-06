"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@ag-grid-community/core");
var miniChart_1 = require("./miniChart");
var ag_charts_community_1 = require("ag-charts-community");
var MiniDoughnut = /** @class */ (function (_super) {
    __extends(MiniDoughnut, _super);
    function MiniDoughnut(container, fills, strokes, centerRadiusScaler, tooltipName) {
        if (centerRadiusScaler === void 0) { centerRadiusScaler = 0.6; }
        if (tooltipName === void 0) { tooltipName = "doughnutTooltip"; }
        var _this = _super.call(this, container, tooltipName) || this;
        var radius = (_this.size - _this.padding * 2) / 2;
        var center = radius + _this.padding;
        var angles = [
            [ag_charts_community_1.toRadians(-90), ag_charts_community_1.toRadians(30)],
            [ag_charts_community_1.toRadians(30), ag_charts_community_1.toRadians(120)],
            [ag_charts_community_1.toRadians(120), ag_charts_community_1.toRadians(180)],
            [ag_charts_community_1.toRadians(180), ag_charts_community_1.toRadians(210)],
            [ag_charts_community_1.toRadians(210), ag_charts_community_1.toRadians(240)],
            [ag_charts_community_1.toRadians(240), ag_charts_community_1.toRadians(270)]
        ];
        _this.sectors = angles.map(function (_a) {
            var startAngle = _a[0], endAngle = _a[1];
            var sector = new ag_charts_community_1.Sector();
            sector.centerX = center;
            sector.centerY = center;
            sector.innerRadius = radius * centerRadiusScaler;
            sector.outerRadius = radius;
            sector.startAngle = startAngle;
            sector.endAngle = endAngle;
            sector.stroke = undefined;
            return sector;
        });
        _this.updateColors(fills, strokes);
        _this.root.append(_this.sectors);
        return _this;
    }
    MiniDoughnut.prototype.updateColors = function (fills, strokes) {
        this.sectors.forEach(function (sector, i) {
            sector.fill = fills[i % fills.length];
            sector.stroke = strokes[i % strokes.length];
        });
    };
    MiniDoughnut.chartType = core_1.ChartType.Doughnut;
    return MiniDoughnut;
}(miniChart_1.MiniChart));
exports.MiniDoughnut = MiniDoughnut;
//# sourceMappingURL=miniDoughnut.js.map