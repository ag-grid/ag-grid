// ag-grid-enterprise v21.2.2
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
var cartesianChart_1 = require("./cartesianChart");
var array_1 = require("../util/array");
var padding_1 = require("../util/padding");
var group_1 = require("../scene/group");
var GroupedCategoryChart = /** @class */ (function (_super) {
    __extends(GroupedCategoryChart, _super);
    function GroupedCategoryChart(options) {
        var _this = _super.call(this, options) || this;
        _this.axisAutoPadding = new padding_1.Padding();
        _this._seriesRoot = new group_1.Group();
        _this._layout = cartesianChart_1.CartesianChartLayout.Vertical;
        var xAxis = options.xAxis;
        var yAxis = options.yAxis;
        _this._xAxis = xAxis;
        _this._yAxis = yAxis;
        _this.scene.root.append([xAxis.group, yAxis.group, _this.seriesRoot]);
        _this.scene.root.append(_this.legend.group);
        return _this;
    }
    Object.defineProperty(GroupedCategoryChart.prototype, "seriesRoot", {
        get: function () {
            return this._seriesRoot;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GroupedCategoryChart.prototype, "xAxis", {
        get: function () {
            return this._xAxis;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GroupedCategoryChart.prototype, "yAxis", {
        get: function () {
            return this._yAxis;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GroupedCategoryChart.prototype, "series", {
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
    GroupedCategoryChart.prototype.performLayout = function () {
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
        if (this.legend.enabled && this.legend.data.length) {
            var legendAutoPadding = this.legendAutoPadding;
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
        var xAxis = this.xAxis;
        var yAxis = this.yAxis;
        xAxis.range = [0, shrinkRect.width];
        xAxis.rotation = -90;
        xAxis.translationX = Math.floor(shrinkRect.x);
        xAxis.translationY = Math.floor(shrinkRect.y + shrinkRect.height + 1);
        xAxis.parallelLabels = true;
        xAxis.gridLength = shrinkRect.height;
        yAxis.range = [shrinkRect.height, 0];
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
    Object.defineProperty(GroupedCategoryChart.prototype, "layout", {
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
    GroupedCategoryChart.prototype.updateAxes = function () {
        var _a, _b;
        var isHorizontal = this.layout === cartesianChart_1.CartesianChartLayout.Horizontal;
        var xAxis = isHorizontal ? this.yAxis : this.xAxis;
        var yAxis = isHorizontal ? this.xAxis : this.yAxis;
        if (!(xAxis && yAxis)) {
            return;
        }
        var xDomains = [];
        var yDomains = [];
        var isNumericX = undefined;
        this.series.forEach(function (series, index) {
            if (series.visible) {
                var xDomain_1 = series.getDomainX();
                var yDomain_1 = series.getDomainY();
                var isFirstVisibleSeries = isNumericX === undefined;
                if (isFirstVisibleSeries) {
                    isNumericX = typeof xDomain_1[0] === 'number';
                }
                if (isNumericX || isFirstVisibleSeries) {
                    xDomains.push(xDomain_1);
                }
                yDomains.push(yDomain_1);
            }
        });
        var xDomain = (_a = new Array()).concat.apply(_a, xDomains);
        var yDomain = (_b = new Array()).concat.apply(_b, yDomains);
        xAxis.domain = array_1.numericExtent(xDomain) || xDomain;
        yAxis.domain = array_1.numericExtent(yDomain) || yDomain;
        xAxis.update();
        yAxis.update();
        // The `xAxis` and `yAxis` have `.this` prefix on purpose here.
        var xAxisBBox = this.xAxis.getBBox();
        var yAxisBBox = this.yAxis.getBBox();
        {
            var axisThickness = Math.floor(yAxisBBox.width);
            if (this.axisAutoPadding.left !== axisThickness) {
                this.axisAutoPadding.left = axisThickness;
                this.layoutPending = true;
            }
        }
        {
            var axisThickness = Math.floor(isHorizontal ? xAxisBBox.width : xAxisBBox.height);
            if (this.axisAutoPadding.bottom !== axisThickness) {
                this.axisAutoPadding.bottom = axisThickness;
                this.layoutPending = true;
            }
        }
    };
    return GroupedCategoryChart;
}(chart_1.Chart));
exports.GroupedCategoryChart = GroupedCategoryChart;
