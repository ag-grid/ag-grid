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
var cartesianChart_1 = require("./cartesianChart");
var array_1 = require("../util/array");
var GroupedCategoryChart = /** @class */ (function (_super) {
    __extends(GroupedCategoryChart, _super);
    function GroupedCategoryChart(options) {
        return _super.call(this, options) || this;
    }
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
        var isNumericXAxis = undefined;
        this.series.filter(function (s) { return s.visible; }).forEach(function (series) {
            var xDomain = series.getDomainX();
            if (isNumericXAxis === undefined) {
                // always add first X domain
                xDomains.push(xDomain);
                isNumericXAxis = typeof xDomain[0] === 'number';
            }
            else if (isNumericXAxis) {
                // only add further X domains if the axis is numeric
                xDomains.push(xDomain);
            }
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
}(cartesianChart_1.CartesianChart));
exports.GroupedCategoryChart = GroupedCategoryChart;
