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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
import { MiniChart } from "../miniChart";
import { Sector, toRadians } from "ag-charts-community";
var MiniDoughnut = /** @class */ (function (_super) {
    __extends(MiniDoughnut, _super);
    function MiniDoughnut(container, fills, strokes, centerRadiusScaler, tooltipName) {
        if (centerRadiusScaler === void 0) { centerRadiusScaler = 0.6; }
        if (tooltipName === void 0) { tooltipName = "doughnutTooltip"; }
        var _this = _super.call(this, container, tooltipName) || this;
        var radius = (_this.size - _this.padding * 2) / 2;
        var center = radius + _this.padding;
        var angles = [
            [toRadians(-90), toRadians(30)],
            [toRadians(30), toRadians(120)],
            [toRadians(120), toRadians(180)],
            [toRadians(180), toRadians(210)],
            [toRadians(210), toRadians(240)],
            [toRadians(240), toRadians(270)]
        ];
        _this.sectors = angles.map(function (_a) {
            var _b = __read(_a, 2), startAngle = _b[0], endAngle = _b[1];
            var sector = new Sector();
            sector.centerX = center;
            sector.centerY = center;
            sector.innerRadius = radius * centerRadiusScaler;
            sector.outerRadius = radius;
            sector.startAngle = startAngle;
            sector.endAngle = endAngle;
            sector.stroke = undefined;
            sector.strokeWidth = 1;
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
    MiniDoughnut.chartType = 'doughnut';
    return MiniDoughnut;
}(MiniChart));
export { MiniDoughnut };
