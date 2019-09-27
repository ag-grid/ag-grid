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
var chartProxy_1 = require("../chartProxy");
var chartModel_1 = require("../../chartModel");
var CartesianChartProxy = /** @class */ (function (_super) {
    __extends(CartesianChartProxy, _super);
    function CartesianChartProxy(params) {
        return _super.call(this, params) || this;
    }
    CartesianChartProxy.prototype.overrideLabelRotation = function (categoryId) {
        return categoryId === chartModel_1.ChartModel.DEFAULT_CATEGORY || this.chartProxyParams.grouping;
    };
    CartesianChartProxy.prototype.setCommonAxisProperty = function (property, value) {
        var cartesianChart = this.chart;
        cartesianChart.xAxis[property] = value;
        cartesianChart.yAxis[property] = value;
        cartesianChart.performLayout();
        this.chartOptions.xAxis[property] = value;
        this.chartOptions.yAxis[property] = value;
        this.raiseChartOptionsChangedEvent();
    };
    CartesianChartProxy.prototype.getCommonAxisProperty = function (property) {
        return this.chartOptions.xAxis ? "" + this.chartOptions.xAxis[property] : '';
    };
    CartesianChartProxy.prototype.getXRotation = function () {
        var cartesianChart = this.chart;
        return cartesianChart.xAxis.labelRotation;
    };
    CartesianChartProxy.prototype.setXRotation = function (rotation) {
        var cartesianChart = this.chart;
        cartesianChart.xAxis.labelRotation = rotation;
        this.chartOptions.xAxis.labelRotation = rotation;
        this.chart.performLayout();
        this.raiseChartOptionsChangedEvent();
    };
    CartesianChartProxy.prototype.getYRotation = function () {
        var cartesianChart = this.chart;
        return cartesianChart.yAxis.labelRotation;
    };
    CartesianChartProxy.prototype.setYRotation = function (rotation) {
        var cartesianChart = this.chart;
        cartesianChart.yAxis.labelRotation = rotation;
        this.chartOptions.yAxis.labelRotation = rotation;
        this.chart.performLayout();
        this.raiseChartOptionsChangedEvent();
    };
    return CartesianChartProxy;
}(chartProxy_1.ChartProxy));
exports.CartesianChartProxy = CartesianChartProxy;
