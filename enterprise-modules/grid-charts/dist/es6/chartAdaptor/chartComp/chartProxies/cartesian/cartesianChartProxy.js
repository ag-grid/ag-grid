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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { ChartProxy } from "../chartProxy";
import { _ } from "@ag-community/grid-core";
import { ChartModel } from "../../chartModel";
var CartesianChartProxy = /** @class */ (function (_super) {
    __extends(CartesianChartProxy, _super);
    function CartesianChartProxy(params) {
        return _super.call(this, params) || this;
    }
    CartesianChartProxy.prototype.getAxisProperty = function (expression) {
        return _.get(this.chartOptions.xAxis, expression, undefined);
    };
    CartesianChartProxy.prototype.setAxisProperty = function (expression, value) {
        _.set(this.chartOptions.xAxis, expression, value);
        _.set(this.chartOptions.yAxis, expression, value);
        var chart = this.chart;
        _.set(this.chart.xAxis, expression, value);
        _.set(this.chart.yAxis, expression, value);
        chart.performLayout();
        this.raiseChartOptionsChangedEvent();
    };
    CartesianChartProxy.prototype.updateLabelRotation = function (categoryId, isHorizontalChart) {
        if (isHorizontalChart === void 0) { isHorizontalChart = false; }
        var labelRotation = 0;
        var axisKey = isHorizontalChart ? "yAxis" : "xAxis";
        if (categoryId !== ChartModel.DEFAULT_CATEGORY && !this.chartProxyParams.grouping) {
            var label = this.chartOptions[axisKey].label;
            if (label && label.rotation) {
                labelRotation = label.rotation;
            }
        }
        this.chart[axisKey].label.rotation = labelRotation; // TODO: use better type than any
    };
    CartesianChartProxy.prototype.getDefaultAxisOptions = function () {
        var fontOptions = this.getDefaultFontOptions();
        var stroke = this.getAxisGridColor();
        var axisColor = "rgba(195, 195, 195, 1)";
        return {
            label: __assign(__assign({}, fontOptions), { padding: 5 }),
            tick: {
                color: axisColor,
                size: 6,
                width: 1,
            },
            line: {
                color: axisColor,
                width: 1,
            },
            gridStyle: [{
                    stroke: stroke,
                    lineDash: [4, 2]
                }]
        };
    };
    CartesianChartProxy.prototype.getDefaultCartesianChartOptions = function () {
        var options = this.getDefaultChartOptions();
        options.xAxis = this.getDefaultAxisOptions();
        options.yAxis = this.getDefaultAxisOptions();
        return options;
    };
    return CartesianChartProxy;
}(ChartProxy));
export { CartesianChartProxy };
