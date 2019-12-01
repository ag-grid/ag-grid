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
var array_1 = require("../util/array");
var padding_1 = require("../util/padding");
var group_1 = require("../scene/group");
var categoryAxis_1 = require("./axis/categoryAxis");
var groupedCategoryAxis_1 = require("./axis/groupedCategoryAxis");
/** Defines the orientation used when rendering data series */
var CartesianChartLayout;
(function (CartesianChartLayout) {
    CartesianChartLayout[CartesianChartLayout["Vertical"] = 0] = "Vertical";
    CartesianChartLayout[CartesianChartLayout["Horizontal"] = 1] = "Horizontal";
})(CartesianChartLayout = exports.CartesianChartLayout || (exports.CartesianChartLayout = {}));
var CartesianChart = /** @class */ (function (_super) {
    __extends(CartesianChart, _super);
    function CartesianChart(options) {
        var _this = _super.call(this, options) || this;
        _this.axisAutoPadding = new padding_1.Padding();
        _this._seriesRoot = new group_1.Group();
        _this._layout = CartesianChartLayout.Vertical;
        var xAxis = options.xAxis, yAxis = options.yAxis;
        _this._xAxis = xAxis;
        _this._yAxis = yAxis;
        _this.scene.root.append([xAxis.group, yAxis.group, _this._seriesRoot]);
        _this.scene.root.append(_this.legend.group);
        return _this;
    }
    Object.defineProperty(CartesianChart.prototype, "seriesRoot", {
        get: function () {
            return this._seriesRoot;
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
            values.forEach(function (series) { return _this.addSeries(series); });
        },
        enumerable: true,
        configurable: true
    });
    CartesianChart.prototype.performLayout = function () {
        if (this.dataPending || !(this.xAxis && this.yAxis)) {
            return;
        }
        var _a = this, width = _a.width, height = _a.height, legend = _a.legend;
        var shrinkRect = {
            x: 0,
            y: 0,
            width: width,
            height: height
        };
        if (legend.enabled && legend.data.length) {
            var legendAutoPadding = this.legendAutoPadding;
            var legendPadding = this.legend.padding;
            shrinkRect.x += legendAutoPadding.left;
            shrinkRect.y += legendAutoPadding.top;
            shrinkRect.width -= legendAutoPadding.left + legendAutoPadding.right;
            shrinkRect.height -= legendAutoPadding.top + legendAutoPadding.bottom;
            switch (this.legend.position) {
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
        var _b = this, captionAutoPadding = _b.captionAutoPadding, padding = _b.padding, axisAutoPadding = _b.axisAutoPadding, xAxis = _b.xAxis, yAxis = _b.yAxis;
        shrinkRect.x += padding.left + axisAutoPadding.left;
        shrinkRect.y += padding.top + axisAutoPadding.top + captionAutoPadding;
        shrinkRect.width -= padding.left + padding.right + axisAutoPadding.left + axisAutoPadding.right;
        shrinkRect.height -= padding.top + padding.bottom + axisAutoPadding.top + axisAutoPadding.bottom + captionAutoPadding;
        xAxis.scale.range = [0, shrinkRect.width];
        xAxis.rotation = -90;
        xAxis.translation.x = Math.floor(shrinkRect.x); // TODO: remove the CartesianChart generic (possibly get rid of xAxis, yAxis too)
        xAxis.translation.y = Math.floor(shrinkRect.y + shrinkRect.height + 1);
        xAxis.label.parallel = true;
        xAxis.gridLength = shrinkRect.height;
        if (yAxis instanceof categoryAxis_1.CategoryAxis || yAxis instanceof groupedCategoryAxis_1.GroupedCategoryAxis) {
            yAxis.scale.range = [0, shrinkRect.height];
        }
        else {
            yAxis.scale.range = [shrinkRect.height, 0];
        }
        yAxis.translation.x = Math.floor(shrinkRect.x); // TODO: remove the CartesianChart generic (possibly get rid of xAxis, yAxis too)
        yAxis.translation.y = Math.floor(shrinkRect.y);
        yAxis.gridLength = shrinkRect.width;
        this.updateAxes();
        this.series.forEach(function (series) {
            series.group.translationX = Math.floor(shrinkRect.x);
            series.group.translationY = Math.floor(shrinkRect.y);
            series.update(); // this has to happen after the `updateAxes` call
        });
        this.positionCaptions();
        this.positionLegend();
    };
    Object.defineProperty(CartesianChart.prototype, "layout", {
        get: function () {
            return this._layout;
        },
        set: function (value) {
            if (this._layout !== value) {
                this._layout = value;
                this.layoutPending = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    CartesianChart.prototype.updateAxes = function () {
        var _a, _b;
        var isHorizontal = this.layout === CartesianChartLayout.Horizontal;
        var xAxis = isHorizontal ? this.yAxis : this.xAxis;
        var yAxis = isHorizontal ? this.xAxis : this.yAxis;
        if (!(xAxis && yAxis)) {
            return;
        }
        var xDomains = [];
        var yDomains = [];
        this.series.filter(function (s) { return s.visible; }).forEach(function (series) {
            xDomains.push(series.getDomainX());
            yDomains.push(series.getDomainY());
        });
        var xDomain = (_a = new Array()).concat.apply(_a, xDomains);
        var yDomain = (_b = new Array()).concat.apply(_b, yDomains);
        xAxis.domain = array_1.numericExtent(xDomain) || xDomain;
        yAxis.domain = array_1.numericExtent(yDomain) || yDomain;
        xAxis.update();
        yAxis.update();
        // The `xAxis` and `yAxis` have `.this` prefix on purpose here,
        // because the local `xAxis` and `yAxis` variables may be swapped.
        var xAxisBBox = this.xAxis.getBBox();
        var yAxisBBox = this.yAxis.getBBox();
        {
            var axisThickness = Math.floor(xAxisBBox.width);
            if (this.axisAutoPadding.bottom !== axisThickness) {
                this.axisAutoPadding.bottom = axisThickness;
                this.layoutPending = true;
            }
        }
        {
            var axisThickness = Math.floor(yAxisBBox.width);
            if (this.axisAutoPadding.left !== axisThickness) {
                this.axisAutoPadding.left = axisThickness;
                this.layoutPending = true;
            }
        }
    };
    return CartesianChart;
}(chart_1.Chart));
exports.CartesianChart = CartesianChart;
