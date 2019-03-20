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
var clipRect_1 = require("../scene/clipRect");
var CartesianChart = /** @class */ (function (_super) {
    __extends(CartesianChart, _super);
    function CartesianChart(xAxis, yAxis, parent) {
        if (parent === void 0) { parent = document.body; }
        var _this = _super.call(this, parent) || this;
        _this.seriesClipRect = new clipRect_1.ClipRect();
        _this.scene.root.append([xAxis.group, yAxis.group, _this.seriesClipRect]);
        _this._xAxis = xAxis;
        _this._yAxis = yAxis;
        return _this;
    }
    Object.defineProperty(CartesianChart.prototype, "xAxis", {
        get: function () {
            return this._xAxis;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CartesianChart.prototype, "yAxis", {
        get: function () {
            return this._yAxis;
        },
        enumerable: true,
        configurable: true
    });
    CartesianChart.prototype.addSeries = function (series) {
        this.seriesClipRect.append(series.group);
        this._series.push(series);
        series.chart = this;
        this.layoutPending = true;
    };
    CartesianChart.prototype.performLayout = function () {
        if (!(this.xAxis && this.yAxis)) {
            return;
        }
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
        var seriesClipRect = this.seriesClipRect;
        seriesClipRect.x = shrinkRect.x;
        seriesClipRect.y = shrinkRect.y - padding.top;
        seriesClipRect.width = shrinkRect.width;
        seriesClipRect.height = shrinkRect.height + padding.top;
        var xAxis = this.xAxis;
        var yAxis = this.yAxis;
        // xAxis.scale.
        xAxis.scale.range = [0, shrinkRect.width];
        xAxis.rotation = -90;
        xAxis.translationX = shrinkRect.x;
        xAxis.translationY = shrinkRect.y + shrinkRect.height + 1;
        xAxis.parallelLabels = true;
        xAxis.gridLength = shrinkRect.height;
        yAxis.scale.range = [shrinkRect.height, 0];
        yAxis.translationX = shrinkRect.x;
        yAxis.translationY = shrinkRect.y;
        yAxis.gridLength = shrinkRect.width;
        this._series.forEach(function (series) {
            series.group.translationX = shrinkRect.x;
            series.group.translationY = shrinkRect.y;
            series.processData();
        });
        // this.updateAxes();
        this._series.forEach(function (series) {
            series.update();
        });
    };
    CartesianChart.prototype.updateAxes = function () {
        var xAxis = this.xAxis;
        var yAxis = this.yAxis;
        if (!(xAxis && yAxis)) {
            return;
        }
        if (this._series.length) {
            var series = this.series[0];
            xAxis.scale.domain = series.getDomainX();
            yAxis.scale.domain = series.getDomainY();
        }
        xAxis.update();
        yAxis.update();
    };
    return CartesianChart;
}(chart_1.Chart));
exports.CartesianChart = CartesianChart;
