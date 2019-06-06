// ag-grid-enterprise v21.0.1
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
var array_1 = require("../util/array");
var padding_1 = require("../util/padding");
var CartesianChart = /** @class */ (function (_super) {
    __extends(CartesianChart, _super);
    function CartesianChart(xAxis, yAxis) {
        var _this = _super.call(this) || this;
        _this.axisAutoPadding = new padding_1.Padding();
        _this.seriesClipRect = new clipRect_1.ClipRect();
        _this._xAxis = xAxis;
        _this._yAxis = yAxis;
        _this.scene.root.append([xAxis.group, yAxis.group, _this.seriesClipRect]);
        _this.scene.root.append(_this.legend.group);
        return _this;
    }
    Object.defineProperty(CartesianChart.prototype, "seriesRoot", {
        get: function () {
            return this.seriesClipRect;
        },
        enumerable: true,
        configurable: true
    });
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
    Object.defineProperty(CartesianChart.prototype, "series", {
        get: function () {
            return this._series;
        },
        set: function (values) {
            var _this = this;
            this.removeAllSeries();
            values.forEach(function (series) {
                _this.addSeries(series);
            });
        },
        enumerable: true,
        configurable: true
    });
    CartesianChart.prototype.performLayout = function () {
        if (this.dataPending || !(this.xAxis && this.yAxis)) {
            return;
        }
        var shrinkRect = {
            x: 0,
            y: 0,
            width: this.width,
            height: this.height
        };
        var captionAutoPadding = this.captionAutoPadding;
        shrinkRect.y += captionAutoPadding;
        shrinkRect.height -= captionAutoPadding;
        var legendAutoPadding = this.legendAutoPadding;
        if (this.legend.data.length) {
            shrinkRect.x += legendAutoPadding.left;
            shrinkRect.y += legendAutoPadding.top;
            shrinkRect.width -= legendAutoPadding.left + legendAutoPadding.right;
            shrinkRect.height -= legendAutoPadding.top + legendAutoPadding.bottom;
            var legendPadding = this.legendPadding;
            switch (this.legendPosition) {
                case 'right':
                    shrinkRect.width -= legendPadding;
                    break;
                case 'bottom':
                    shrinkRect.height -= legendPadding;
                    break;
                case 'left':
                    shrinkRect.x += legendPadding;
                    shrinkRect.width -= legendPadding;
                    break;
                case 'top':
                    shrinkRect.y += legendPadding;
                    shrinkRect.height -= legendPadding;
                    break;
            }
        }
        var padding = this.padding;
        shrinkRect.x += padding.left;
        shrinkRect.y += padding.top;
        shrinkRect.width -= padding.left + padding.right;
        shrinkRect.height -= padding.top + padding.bottom;
        var axisAutoPadding = this.axisAutoPadding;
        shrinkRect.x += axisAutoPadding.left;
        shrinkRect.y += axisAutoPadding.top;
        shrinkRect.width -= axisAutoPadding.left + axisAutoPadding.right;
        shrinkRect.height -= axisAutoPadding.top + axisAutoPadding.bottom;
        var seriesClipRect = this.seriesClipRect;
        seriesClipRect.x = shrinkRect.x;
        seriesClipRect.y = shrinkRect.y;
        seriesClipRect.width = shrinkRect.width;
        seriesClipRect.height = shrinkRect.height;
        var xAxis = this.xAxis;
        var yAxis = this.yAxis;
        xAxis.scale.range = [0, shrinkRect.width];
        xAxis.rotation = -90;
        xAxis.translationX = Math.floor(shrinkRect.x);
        xAxis.translationY = Math.floor(shrinkRect.y + shrinkRect.height + 1);
        xAxis.parallelLabels = true;
        xAxis.gridLength = shrinkRect.height;
        yAxis.scale.range = [shrinkRect.height, 0];
        yAxis.translationX = Math.floor(shrinkRect.x);
        yAxis.translationY = Math.floor(shrinkRect.y);
        yAxis.gridLength = shrinkRect.width;
        this.updateAxes();
        this.series.forEach(function (series) {
            series.group.translationX = Math.floor(shrinkRect.x);
            series.group.translationY = Math.floor(shrinkRect.y);
            series.update(); // this has to happen after the `updateAxis` call
        });
        this.positionCaptions();
        this.positionLegend();
    };
    CartesianChart.prototype.updateAxes = function () {
        var _a, _b;
        var xAxis = this.xAxis;
        var yAxis = this.yAxis;
        if (!(xAxis && yAxis)) {
            return;
        }
        var xDomains = [];
        var yDomains = [];
        this.series.forEach(function (series) {
            if (series.visible) {
                var xDomain_1 = series.getDomainX();
                var yDomain_1 = series.getDomainY();
                xDomains.push(xDomain_1);
                yDomains.push(yDomain_1);
            }
        });
        var xDomain = (_a = new Array()).concat.apply(_a, xDomains);
        var yDomain = (_b = new Array()).concat.apply(_b, yDomains);
        if (typeof xDomain[0] === 'number') {
            xAxis.domain = array_1.checkExtent(array_1.extent(xDomain));
        }
        else {
            // if (!xDomain.length) {
            //     return;
            // }
            xAxis.domain = xDomain;
        }
        if (typeof yDomain[0] === 'number') {
            yAxis.domain = array_1.checkExtent(array_1.extent(yDomain));
        }
        else {
            // if (!yDomain.length) {
            //     return;
            // }
            yAxis.domain = yDomain;
        }
        xAxis.update();
        yAxis.update();
        var xAxisBBox = xAxis.getBBox();
        var yAxisBBox = yAxis.getBBox();
        if (this.axisAutoPadding.left !== yAxisBBox.width) {
            this.axisAutoPadding.left = yAxisBBox.width;
            this.layoutPending = true;
        }
        if (this.axisAutoPadding.bottom !== xAxisBBox.width) {
            this.axisAutoPadding.bottom = xAxisBBox.width;
            this.layoutPending = true;
        }
    };
    return CartesianChart;
}(chart_1.Chart));
exports.CartesianChart = CartesianChart;
