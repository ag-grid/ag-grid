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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var chart_1 = require("./chart");
var array_1 = require("../util/array");
var padding_1 = require("../util/padding");
var group_1 = require("../scene/group");
var categoryAxis_1 = require("./axis/categoryAxis");
var groupedCategoryAxis_1 = require("./axis/groupedCategoryAxis");
var observable_1 = require("../util/observable");
var chartAxis_1 = require("./chartAxis");
/** Defines the orientation used when rendering data series */
var CartesianChartLayout;
(function (CartesianChartLayout) {
    CartesianChartLayout[CartesianChartLayout["Vertical"] = 0] = "Vertical";
    CartesianChartLayout[CartesianChartLayout["Horizontal"] = 1] = "Horizontal";
})(CartesianChartLayout = exports.CartesianChartLayout || (exports.CartesianChartLayout = {}));
var CartesianChart = /** @class */ (function (_super) {
    __extends(CartesianChart, _super);
    function CartesianChart(document) {
        if (document === void 0) { document = window.document; }
        var _this = _super.call(this, document) || this;
        _this.axisAutoPadding = new padding_1.Padding();
        _this.flipXY = false;
        _this._seriesRoot = new group_1.Group();
        _this._layout = CartesianChartLayout.Vertical;
        _this._updateAxes = _this.updateAxes.bind(_this);
        // Prevent the scene from rendering chart components in an invalid state
        // (before first layout is performed).
        _this.scene.root.visible = false;
        var root = _this.scene.root;
        root.append(_this._seriesRoot);
        root.append(_this.legend.group);
        return _this;
    }
    Object.defineProperty(CartesianChart.prototype, "seriesRoot", {
        get: function () {
            return this._seriesRoot;
        },
        enumerable: true,
        configurable: true
    });
    CartesianChart.prototype.performLayout = function () {
        if (this.dataPending) {
            return;
        }
        this.scene.root.visible = true;
        var _a = this, width = _a.width, height = _a.height, axes = _a.axes, legend = _a.legend;
        var shrinkRect = {
            x: 0,
            y: 0,
            width: width,
            height: height
        };
        this.positionCaptions();
        this.positionLegend();
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
        var _b = this, captionAutoPadding = _b.captionAutoPadding, padding = _b.padding, axisAutoPadding = _b.axisAutoPadding;
        this.updateAxes();
        shrinkRect.x += padding.left + axisAutoPadding.left;
        shrinkRect.y += padding.top + axisAutoPadding.top + captionAutoPadding;
        shrinkRect.width -= padding.left + padding.right + axisAutoPadding.left + axisAutoPadding.right;
        shrinkRect.height -= padding.top + padding.bottom + axisAutoPadding.top + axisAutoPadding.bottom + captionAutoPadding;
        axes.forEach(function (axis) {
            axis.group.visible = true;
            switch (axis.position) {
                case chartAxis_1.ChartAxisPosition.Top:
                    axis.range = [0, shrinkRect.width];
                    axis.translation.x = Math.floor(shrinkRect.x);
                    axis.translation.y = Math.floor(shrinkRect.y + 1);
                    axis.label.mirrored = true;
                    axis.gridLength = shrinkRect.height;
                    break;
                case chartAxis_1.ChartAxisPosition.Right:
                    if (axis instanceof categoryAxis_1.CategoryAxis || axis instanceof groupedCategoryAxis_1.GroupedCategoryAxis) {
                        axis.range = [0, shrinkRect.height];
                    }
                    else {
                        axis.range = [shrinkRect.height, 0];
                    }
                    axis.translation.x = Math.floor(shrinkRect.x + shrinkRect.width + 1);
                    axis.translation.y = Math.floor(shrinkRect.y);
                    axis.label.mirrored = true;
                    axis.gridLength = shrinkRect.width;
                    break;
                case chartAxis_1.ChartAxisPosition.Bottom:
                    axis.range = [0, shrinkRect.width];
                    axis.translation.x = Math.floor(shrinkRect.x);
                    axis.translation.y = Math.floor(shrinkRect.y + shrinkRect.height + 1);
                    axis.gridLength = shrinkRect.height;
                    break;
                case chartAxis_1.ChartAxisPosition.Left:
                    if (axis instanceof categoryAxis_1.CategoryAxis || axis instanceof groupedCategoryAxis_1.GroupedCategoryAxis) {
                        axis.range = [0, shrinkRect.height];
                    }
                    else {
                        axis.range = [shrinkRect.height, 0];
                    }
                    axis.translation.x = Math.floor(shrinkRect.x);
                    axis.translation.y = Math.floor(shrinkRect.y);
                    axis.gridLength = shrinkRect.width;
                    break;
            }
        });
        this.series.forEach(function (series) {
            series.group.translationX = Math.floor(shrinkRect.x);
            series.group.translationY = Math.floor(shrinkRect.y);
            series.update(); // this has to happen after the `updateAxes` call
        });
        this.axes.forEach(function (axis) { return axis.update(); });
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
    CartesianChart.prototype.initSeries = function (series) {
        _super.prototype.initSeries.call(this, series);
        series.addEventListener('dataProcessed', this._updateAxes);
    };
    CartesianChart.prototype.freeSeries = function (series) {
        _super.prototype.freeSeries.call(this, series);
        series.removeEventListener('dataProcessed', this._updateAxes);
    };
    CartesianChart.prototype.updateAxes = function () {
        var _this = this;
        var axes = this.axes.filter(function (a) { return !a.linkedTo; });
        var linkedAxes = this.axes.filter(function (a) { return a.linkedTo; });
        axes.concat(linkedAxes).forEach(function (axis) {
            var _a;
            var direction = axis.direction, position = axis.position, boundSeries = axis.boundSeries;
            if (axis.linkedTo) {
                axis.domain = axis.linkedTo.domain;
            }
            else {
                var domains_1 = [];
                boundSeries.filter(function (s) { return s.visible; }).forEach(function (series) {
                    domains_1.push(series.getDomain(direction));
                });
                var domain = (_a = new Array()).concat.apply(_a, domains_1);
                axis.domain = array_1.numericExtent(domain) || domain; // if numeric extent can't be found, it's categories
            }
            axis.update();
            var axisThickness = Math.floor(axis.computeBBox().width);
            switch (position) {
                case chartAxis_1.ChartAxisPosition.Left:
                    _this.axisAutoPadding.left = axisThickness;
                    break;
                case chartAxis_1.ChartAxisPosition.Right:
                    _this.axisAutoPadding.right = axisThickness;
                    break;
                case chartAxis_1.ChartAxisPosition.Bottom:
                    _this.axisAutoPadding.bottom = axisThickness;
                    break;
                case chartAxis_1.ChartAxisPosition.Top:
                    _this.axisAutoPadding.top = axisThickness;
                    break;
            }
        });
    };
    CartesianChart.className = 'CartesianChart';
    __decorate([
        observable_1.reactive(['layoutChange'])
    ], CartesianChart.prototype, "flipXY", void 0);
    return CartesianChart;
}(chart_1.Chart));
exports.CartesianChart = CartesianChart;
//# sourceMappingURL=cartesianChart.js.map