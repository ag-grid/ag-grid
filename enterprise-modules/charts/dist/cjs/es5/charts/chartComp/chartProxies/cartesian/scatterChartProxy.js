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
Object.defineProperty(exports, "__esModule", { value: true });
var ag_charts_community_1 = require("ag-charts-community");
var cartesianChartProxy_1 = require("./cartesianChartProxy");
var object_1 = require("../../utils/object");
var chartDataModel_1 = require("../../chartDataModel");
var ScatterChartProxy = /** @class */ (function (_super) {
    __extends(ScatterChartProxy, _super);
    function ScatterChartProxy(params) {
        var _this = _super.call(this, params) || this;
        _this.supportsAxesUpdates = false;
        _this.xAxisType = 'number';
        _this.yAxisType = 'number';
        _this.recreateChart();
        return _this;
    }
    ScatterChartProxy.prototype.getData = function (params) {
        return this.getDataTransformedData(params);
    };
    ScatterChartProxy.prototype.getAxes = function () {
        var axisOptions = this.getAxesOptions();
        return [
            __assign(__assign({}, object_1.deepMerge(axisOptions[this.xAxisType], axisOptions[this.xAxisType].bottom)), { type: this.xAxisType, position: ag_charts_community_1.ChartAxisPosition.Bottom }),
            __assign(__assign({}, object_1.deepMerge(axisOptions[this.yAxisType], axisOptions[this.yAxisType].left)), { type: this.yAxisType, position: ag_charts_community_1.ChartAxisPosition.Left }),
        ];
    };
    ScatterChartProxy.prototype.getSeries = function (params) {
        var _this = this;
        var paired = this.chartOptions[this.standaloneChartType].paired;
        var seriesDefinitions = this.getSeriesDefinitions(params.fields, paired);
        var labelFieldDefinition = params.category.id === chartDataModel_1.ChartDataModel.DEFAULT_CATEGORY ? undefined : params.category;
        var series = seriesDefinitions.map(function (seriesDefinition) { return (__assign(__assign({}, _this.extractSeriesOverrides()), { type: _this.standaloneChartType, xKey: seriesDefinition.xField.colId, xName: seriesDefinition.xField.displayName, yKey: seriesDefinition.yField.colId, yName: seriesDefinition.yField.displayName, title: seriesDefinition.yField.displayName + " vs " + seriesDefinition.xField.displayName, sizeKey: seriesDefinition.sizeField ? seriesDefinition.sizeField.colId : undefined, sizeName: seriesDefinition.sizeField ? seriesDefinition.sizeField.displayName : undefined, labelKey: labelFieldDefinition ? labelFieldDefinition.id : seriesDefinition.yField.colId, labelName: labelFieldDefinition ? labelFieldDefinition.name : undefined })); });
        return this.crossFiltering ? this.extractCrossFilterSeries(series) : series;
    };
    ScatterChartProxy.prototype.extractCrossFilterSeries = function (series) {
        return []; //TODO
    };
    ScatterChartProxy.prototype.getSeriesDefinitions = function (fields, paired) {
        if (fields.length < 2) {
            return [];
        }
        var isBubbleChart = this.chartType === 'bubble';
        if (paired) {
            if (isBubbleChart) {
                return fields.map(function (currentXField, i) { return i % 3 === 0 ? ({
                    xField: currentXField,
                    yField: fields[i + 1],
                    sizeField: fields[i + 2],
                }) : null; }).filter(function (x) { return x && x.yField && x.sizeField; });
            }
            return fields.map(function (currentXField, i) { return i % 2 === 0 ? ({
                xField: currentXField,
                yField: fields[i + 1],
            }) : null; }).filter(function (x) { return x && x.yField; });
        }
        var xField = fields[0];
        if (isBubbleChart) {
            return fields
                .map(function (yField, i) { return i % 2 === 1 ? ({
                xField: xField,
                yField: yField,
                sizeField: fields[i + 1],
            }) : null; })
                .filter(function (x) { return x && x.sizeField; });
        }
        return fields.filter(function (value, i) { return i > 0; }).map(function (yField) { return ({ xField: xField, yField: yField }); });
    };
    return ScatterChartProxy;
}(cartesianChartProxy_1.CartesianChartProxy));
exports.ScatterChartProxy = ScatterChartProxy;
//# sourceMappingURL=scatterChartProxy.js.map