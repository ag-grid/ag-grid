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
import { ChartAxisPosition } from "ag-charts-community";
import { CartesianChartProxy } from "./cartesianChartProxy";
import { deepMerge } from "../../utils/object";
var HistogramChartProxy = /** @class */ (function (_super) {
    __extends(HistogramChartProxy, _super);
    function HistogramChartProxy(params) {
        var _this = _super.call(this, params) || this;
        _this.supportsAxesUpdates = false;
        _this.xAxisType = 'number';
        _this.yAxisType = 'number';
        _this.recreateChart();
        return _this;
    }
    HistogramChartProxy.prototype.getData = function (params) {
        return this.getDataTransformedData(params);
    };
    HistogramChartProxy.prototype.getSeries = function (params) {
        var firstField = params.fields[0]; // multiple series are not supported!
        return [__assign(__assign({}, this.extractSeriesOverrides()), { type: this.standaloneChartType, xKey: firstField.colId, xName: firstField.displayName, areaPlot: false })];
    };
    HistogramChartProxy.prototype.getAxes = function () {
        var axisOptions = this.getAxesOptions();
        return [
            __assign(__assign({}, deepMerge(axisOptions[this.xAxisType], axisOptions[this.xAxisType].bottom)), { type: this.xAxisType, position: ChartAxisPosition.Bottom }),
            __assign(__assign({}, deepMerge(axisOptions[this.yAxisType], axisOptions[this.yAxisType].left)), { type: this.yAxisType, position: ChartAxisPosition.Left }),
        ];
    };
    return HistogramChartProxy;
}(CartesianChartProxy));
export { HistogramChartProxy };
