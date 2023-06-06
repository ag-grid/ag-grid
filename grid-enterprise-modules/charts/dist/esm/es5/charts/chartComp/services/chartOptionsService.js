var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { _, BeanStub, Events } from "@ag-grid-community/core";
import { AgChart } from "ag-charts-community";
import { deepMerge } from "../utils/object";
import { getSeriesType, VALID_SERIES_TYPES } from "../utils/seriesTypeMapper";
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
        return _.get(this.getChart(), expression, undefined);
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
            chartOptions = deepMerge(chartOptions, _this.createChartOptions({
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
        return _.get((_a = this.getChart().axes) === null || _a === void 0 ? void 0 : _a[0], expression, undefined);
    };
    ChartOptionsService.prototype.setAxisProperty = function (expression, value) {
        var _this = this;
        var _a;
        // update axis options
        var chart = this.getChart();
        var chartOptions = {};
        (_a = chart.axes) === null || _a === void 0 ? void 0 : _a.forEach(function (axis) {
            chartOptions = deepMerge(chartOptions, _this.getUpdateAxisOptions(axis, expression, value));
        });
        this.updateChart(chartOptions);
        this.raiseChartOptionsChangedEvent();
    };
    ChartOptionsService.prototype.getLabelRotation = function (axisType) {
        var axis = this.getAxis(axisType);
        return _.get(axis, 'label.rotation', undefined);
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
        return _.get(series, expression, undefined);
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
        var seriesType = getSeriesType(this.getChartType());
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
        AgChart.updateDelta(chartRef, chartOptions);
    };
    ChartOptionsService.prototype.createChartOptions = function (_a) {
        var seriesType = _a.seriesType, expression = _a.expression, value = _a.value;
        var overrides = {};
        var chartOptions = {
            theme: {
                overrides: overrides
            }
        };
        _.set(overrides, seriesType + "." + expression, value);
        return chartOptions;
    };
    ChartOptionsService.prototype.raiseChartOptionsChangedEvent = function () {
        var chartModel = this.chartController.getChartModel();
        var event = {
            type: Events.EVENT_CHART_OPTIONS_CHANGED,
            chartId: chartModel.chartId,
            chartType: chartModel.chartType,
            chartThemeName: this.chartController.getChartThemeName(),
            chartOptions: chartModel.chartOptions
        };
        this.eventService.dispatchEvent(event);
    };
    ChartOptionsService.isMatchingSeries = function (seriesType, series) {
        return VALID_SERIES_TYPES.includes(seriesType) && series.type === seriesType;
    };
    ChartOptionsService.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
    };
    return ChartOptionsService;
}(BeanStub));
export { ChartOptionsService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhcnRPcHRpb25zU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jaGFydHMvY2hhcnRDb21wL3NlcnZpY2VzL2NoYXJ0T3B0aW9uc1NlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUFFLENBQUMsRUFBRSxRQUFRLEVBQWtDLE1BQU0sRUFBcUIsTUFBTSx5QkFBeUIsQ0FBQztBQUNqSCxPQUFPLEVBQXVCLE9BQU8sRUFBa0IsTUFBTSxxQkFBcUIsQ0FBQztBQUduRixPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDNUMsT0FBTyxFQUFtQixhQUFhLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUkvRjtJQUF5Qyx1Q0FBUTtJQUc3Qyw2QkFBWSxlQUFnQztRQUE1QyxZQUNJLGlCQUFPLFNBRVY7UUFERyxLQUFJLENBQUMsZUFBZSxHQUFHLGVBQWUsQ0FBQzs7SUFDM0MsQ0FBQztJQUVNLDRDQUFjLEdBQXJCLFVBQWtDLFVBQWtCO1FBQ2hELGlGQUFpRjtRQUNqRiw4RUFBOEU7UUFDOUUsT0FBTyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBRSxVQUFVLEVBQUUsU0FBUyxDQUFNLENBQUM7SUFDOUQsQ0FBQztJQUVNLDRDQUFjLEdBQXJCLFVBQWtDLFVBQWtCLEVBQUUsS0FBUSxFQUFFLFFBQWtCO1FBQWxGLGlCQW9CQztRQW5CRyxJQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztRQUNwRSxJQUFJLElBQUksQ0FBQyxlQUFlLENBQUMsWUFBWSxFQUFFLEVBQUU7WUFDckMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1NBQ3RDO1FBRUQsSUFBSSxZQUFZLEdBQUcsRUFBRSxDQUFDO1FBQ3RCLHVF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