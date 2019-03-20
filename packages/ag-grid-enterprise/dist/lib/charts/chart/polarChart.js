// ag-grid-enterprise v20.2.0
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
var chart_1 = require("./chart");
var PolarChart = /** @class */ (function (_super) {
    __extends(PolarChart, _super);
    function PolarChart() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.centerX = 0;
        _this.centerY = 0;
        _this.radius = 0;
        _this._series = [];
        return _this;
    }
    PolarChart.prototype.addSeries = function (series) {
        if (this.scene.root) {
            this.scene.root.append(series.group);
        }
        this._series.push(series);
        series.chart = this;
        this.layoutPending = true;
    };
    PolarChart.prototype.performLayout = function () {
        var shrinkRect = {
            x: 0,
            y: 0,
            width: this.width,
            height: this.height
        };
        var padding = this.padding;
        shrinkRect.x += padding.left;
        shrinkRect.y += padding.top;
        shrinkRect.width -= padding.left + padding.right;
        shrinkRect.height -= padding.top + padding.bottom;
        var centerX = this.centerX = shrinkRect.x + shrinkRect.width / 2;
        var centerY = this.centerY = shrinkRect.y + shrinkRect.height / 2;
        var radius = Math.min(shrinkRect.width, shrinkRect.height) / 2;
        this._series.forEach(function (series) {
            series.centerX = centerX;
            series.centerY = centerY;
            series.radius = radius;
            series.processData();
            series.update();
        });
    };
    return PolarChart;
}(chart_1.Chart));
exports.PolarChart = PolarChart;
