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
        chart.waitForUpdate().then(function () { return func(); })
            .catch(function (e) { return console.error("AG Grid - chart update failed", e); });
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