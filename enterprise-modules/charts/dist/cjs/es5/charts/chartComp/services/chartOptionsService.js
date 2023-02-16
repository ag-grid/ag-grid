"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChartOptionsService = void 0;
var core_1 = require("@ag-grid-community/core");
var ag_charts_community_1 = require("ag-charts-community");
var object_1 = require("../utils/object");
var seriesTypeMapper_1 = require("../utils/seriesTypeMapper");
var ChartOptionsService = /** @class */ (function (_super) {
    __extends(ChartOptionsService, _super);
    function ChartOptionsService(chartController) {
        var _this = _super.call(this) || this;
        _this.chartController = chartController;
        return _this;
    }
    ChartOptionsService.prototype.getChartOption = function (expression) {
        // TODO: We shouldn't be reading the chart implementation directly, but right now
        // it isn't possible to either get option defaults OR retrieve themed options.
        return core_1._.get(this.getChart(), expression, undefined);
    };
    ChartOptionsService.prototype.setChartOption = function (expression, value, isSilent) {
        var _this = this;
        var chartSeriesTypes = this.chartController.getChartSeriesTypes();
        if (this.chartController.isComboChart()) {
            chartSeriesTypes.push('cartesian');
        }
        var chartOptions = {};
        // we need to update chart options on each series type for combo charts
        chartSeriesTypes.forEach(function (seriesType) {
            chartOptions = object_1.deepMerge(chartOptions, _this.createChartOptions({
                seriesType: seriesType,
                expression: expression,
                value: value
            }));
        });
        this.updateChart(chartOptions);
        if (!isSilent) {
            this.raiseChartOptionsChangedEvent();
        }
    };
    ChartOptionsService.prototype.awaitChartOptionUpdate = function (func) {
        var chart = this.chartController.getChartProxy().getChart();
        chart.waitForUpdate().then(function () { return func(); });
    };
    ChartOptionsService.prototype.getAxisProperty = function (expression) {
        var _a;
        return core_1._.get((_a = this.getChart().axes) === null || _a === void 0 ? void 0 : _a[0], expression, undefined);
    };
    ChartOptionsService.prototype.setAxisProperty = function (expression, value) {
        var _this = this;
        var _a;
        // update axis options
        var chart = this.getChart();
        var chartOptions = {};
        (_a = chart.axes) === null || _a === void 0 ? void 0 : _a.forEach(function (axis) {
            chartOptions = object_1.deepMerge(chartOptions, _this.getUpdateAxisOptions(axis, expression, value));
        });
        this.updateChart(chartOptions);
        this.raiseChartOptionsChangedEvent();
    };
    ChartOptionsService.prototype.getLabelRotation = function (axisType) {
        var axis = this.getAxis(axisType);
        return core_1._.get(axis, 'label.rotation', undefined);
    };
    ChartOptionsService.prototype.setLabelRotation = function (axisType, value) {
        var chartAxis = this.getAxis(axisType);
        if (chartAxis) {
            var chartOptions = this.getUpdateAxisOptions(chartAxis, 'label.rotation', value);
            this.updateChart(chartOptions);
            this.raiseChartOptionsChangedEvent();
        }
    };
    ChartOptionsService.prototype.getSeriesOption = function (expression, seriesType) {
        var series = this.getChart().series.find(function (s) { return ChartOptionsService.isMatchingSeries(seriesType, s); });
        return core_1._.get(series, expression, undefined);
    };
    ChartOptionsService.prototype.setSeriesOption = function (expression, value, seriesType) {
        var chartOptions = this.createChartOptions({
            seriesType: seriesType,
            expression: "series." + expression,
            value: value
        });
        this.updateChart(chartOptions);
        this.raiseChartOptionsChangedEvent();
    };
    ChartOptionsService.prototype.getPairedMode = function () {
        return this.chartController.getChartProxy().isPaired();
    };
    ChartOptionsService.prototype.setPairedMode = function (paired) {
        this.chartController.getChartProxy().setPaired(paired);
    };
    ChartOptionsService.prototype.getAxis = function (axisType) {
        var chart = this.getChart();
        if (!chart.axes || chart.axes.length < 1) {
            return undefined;
        }
        if (axisType === 'xAxis') {
            return (chart.axes && chart.axes[0].direction === 'x') ? chart.axes[0] : chart.axes[1];
        }
        return (chart.axes && chart.axes[1].direction === 'y') ? chart.axes[1] : chart.axes[0];
    };
    ChartOptionsService.prototype.getUpdateAxisOptions = function (chartAxis, expression, value) {
        var seriesType = seriesTypeMapper_1.getSeriesType(this.getChartType());
        var validAxisTypes = ['number', 'category', 'time', 'groupedCategory'];
        if (!validAxisTypes.includes(chartAxis.type)) {
            return {};
        }
        return this.createChartOptions({
            seriesType: seriesType,
            expression: "axes." + chartAxis.type + "." + expression,
            value: value
        });
    };
    ChartOptionsService.prototype.getChartType = function () {
        return this.chartController.getChartType();
    };
    ChartOptionsService.prototype.getChart = function () {
        return this.chartController.getChartProxy().getChart();
    };
    ChartOptionsService.prototype.updateChart = function (chartOptions) {
        var chartRef = this.chartController.getChartProxy().getChartRef();
        ag_charts_community_1.AgChart.updateDelta(chartRef, chartOptions);
    };
    ChartOptionsService.prototype.createChartOptions = function (_a) {
        var seriesType = _a.seriesType, expression = _a.expression, value = _a.value;
        var overrides = {};
        var chartOptions = {
            theme: {
                overrides: overrides
            }
        };
        core_1._.set(overrides, seriesType + "." + expression, value);
        return chartOptions;
    };
    ChartOptionsService.prototype.raiseChartOptionsChangedEvent = function () {
        var chartModel = this.chartController.getChartModel();
        var event = {
            type: core_1.Events.EVENT_CHART_OPTIONS_CHANGED,
            chartId: chartModel.chartId,
            chartType: chartModel.chartType,
            chartThemeName: this.chartController.getChartThemeName(),
            chartOptions: chartModel.chartOptions
        };
        this.eventService.dispatchEvent(event);
    };
    ChartOptionsService.isMatchingSeries = function (seriesType, series) {
        var mapTypeToImplType = function (type) { return type === 'column' ? 'bar' : type; };
        return seriesTypeMapper_1.VALID_SERIES_TYPES.includes(seriesType) &&
            series.type === mapTypeToImplType(seriesType);
    };
    ChartOptionsService.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
    };
    return ChartOptionsService;
}(core_1.BeanStub));
exports.ChartOptionsService = ChartOptionsService;
