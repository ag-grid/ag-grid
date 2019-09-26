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
var PolarChartProxy = /** @class */ (function (_super) {
    __extends(PolarChartProxy, _super);
    function PolarChartProxy(params) {
        return _super.call(this, params) || this;
    }
    PolarChartProxy.prototype.setSeriesProperty = function (property, value) {
        var series = this.getChart().series;
        series.forEach(function (s) { return s[property] = value; });
        if (!this.chartOptions.seriesDefaults) {
            this.chartOptions.seriesDefaults = {};
        }
        this.chartOptions.seriesDefaults[property] = value;
        this.raiseChartOptionsChangedEvent();
    };
    PolarChartProxy.prototype.getSeriesProperty = function (property) {
        return this.chartOptions.seriesDefaults ? "" + this.chartOptions.seriesDefaults[property] : '';
    };
    PolarChartProxy.prototype.getTooltipsEnabled = function () {
        return this.chartOptions.seriesDefaults ? !!this.chartOptions.seriesDefaults.tooltipEnabled : false;
    };
    PolarChartProxy.prototype.getLabelEnabled = function () {
        return this.chartOptions.seriesDefaults ? !!this.chartOptions.seriesDefaults.labelEnabled : false;
    };
    return PolarChartProxy;
}(chartProxy_1.ChartProxy));
exports.PolarChartProxy = PolarChartProxy;
