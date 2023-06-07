import { _, BeanStub, Events } from "@ag-grid-community/core";
import { AgChart } from "ag-charts-community";
import { deepMerge } from "../utils/object";
import { getSeriesType, VALID_SERIES_TYPES } from "../utils/seriesTypeMapper";
export class ChartOptionsService extends BeanStub {
    constructor(chartController) {
        super();
        this.chartController = chartController;
    }
    getChartOption(expression) {
        // TODO: We shouldn't be reading the chart implementation directly, but right now
        // it isn't possible to either get option defaults OR retrieve themed options.
        return _.get(this.getChart(), expression, undefined);
    }
    setChartOption(expression, value, isSilent) {
        const chartSeriesTypes = this.chartController.getChartSeriesTypes();
        if (this.chartController.isComboChart()) {
            chartSeriesTypes.push('cartesian');
        }
        let chartOptions = {};
        // we need to update chart options on each series type for combo charts
        chartSeriesTypes.forEach(seriesType => {
            chartOptions = deepMerge(chartOptions, this.createChartOptions({
                seriesType,
                expression,
                value
            }));
        });
        this.updateChart(chartOptions);
        if (!isSilent) {
            this.raiseChartOptionsChangedEvent();
        }
    }
    awaitChartOptionUpdate(func) {
        const chart = this.chartController.getChartProxy().getChart();
        chart.waitForUpdate().then(() => func())
            .catch((e) => console.error(`AG Grid - chart update failed`, e));
    }
    getAxisProperty(expression) {
        var _a;
        return _.get((_a = this.getChart().axes) === null || _a === void 0 ? void 0 : _a[0], expression, undefined);
    }
    setAxisProperty(expression, value) {
        var _a;
        // update axis options
        const chart = this.getChart();
        let chartOptions = {};
        (_a = chart.axes) === null || _a === void 0 ? void 0 : _a.forEach((axis) => {
            chartOptions = deepMerge(chartOptions, this.getUpdateAxisOptions(axis, expression, value));
        });
        this.updateChart(chartOptions);
        this.raiseChartOptionsChangedEvent();
    }
    getLabelRotation(axisType) {
        const axis = this.getAxis(axisType);
        return _.get(axis, 'label.rotation', undefined);
    }
    setLabelRotation(axisType, value) {
        const chartAxis = this.getAxis(axisType);
        if (chartAxis) {
            const chartOptions = this.getUpdateAxisOptions(chartAxis, 'label.rotation', value);
            this.updateChart(chartOptions);
            this.raiseChartOptionsChangedEvent();
        }
    }
    getSeriesOption(expression, seriesType) {
        const series = this.getChart().series.find((s) => ChartOptionsService.isMatchingSeries(seriesType, s));
        return _.get(series, expression, undefined);
    }
    setSeriesOption(expression, value, seriesType) {
        const chartOptions = this.createChartOptions({
            seriesType,
            expression: `series.${expression}`,
            value
        });
        this.updateChart(chartOptions);
        this.raiseChartOptionsChangedEvent();
    }
    getPairedMode() {
        return this.chartController.getChartProxy().isPaired();
    }
    setPairedMode(paired) {
        this.chartController.getChartProxy().setPaired(paired);
    }
    getAxis(axisType) {
        const chart = this.getChart();
        if (!chart.axes || chart.axes.length < 1) {
            return undefined;
        }
        if (axisType === 'xAxis') {
            return (chart.axes && chart.axes[0].direction === 'x') ? chart.axes[0] : chart.axes[1];
        }
        return (chart.axes && chart.axes[1].direction === 'y') ? chart.axes[1] : chart.axes[0];
    }
    getUpdateAxisOptions(chartAxis, expression, value) {
        const seriesType = getSeriesType(this.getChartType());
        const validAxisTypes = ['number', 'category', 'time', 'groupedCategory'];
        if (!validAxisTypes.includes(chartAxis.type)) {
            return {};
        }
        return this.createChartOptions({
            seriesType,
            expression: `axes.${chartAxis.type}.${expression}`,
            value
        });
    }
    getChartType() {
        return this.chartController.getChartType();
    }
    getChart() {
        return this.chartController.getChartProxy().getChart();
    }
    updateChart(chartOptions) {
        const chartRef = this.chartController.getChartProxy().getChartRef();
        AgChart.updateDelta(chartRef, chartOptions);
    }
    createChartOptions({ seriesType, expression, value }) {
        const overrides = {};
        const chartOptions = {
            theme: {
                overrides
            }
        };
        _.set(overrides, `${seriesType}.${expression}`, value);
        return chartOptions;
    }
    raiseChartOptionsChangedEvent() {
        const chartModel = this.chartController.getChartModel();
        const event = {
            type: Events.EVENT_CHART_OPTIONS_CHANGED,
            chartId: chartModel.chartId,
            chartType: chartModel.chartType,
            chartThemeName: this.chartController.getChartThemeName(),
            chartOptions: chartModel.chartOptions
        };
        this.eventService.dispatchEvent(event);
    }
    static isMatchingSeries(seriesType, series) {
        return VALID_SERIES_TYPES.includes(seriesType) && series.type === seriesType;
    }
    destroy() {
        super.destroy();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhcnRPcHRpb25zU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jaGFydHMvY2hhcnRDb21wL3NlcnZpY2VzL2NoYXJ0T3B0aW9uc1NlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLENBQUMsRUFBRSxRQUFRLEVBQWtDLE1BQU0sRUFBcUIsTUFBTSx5QkFBeUIsQ0FBQztBQUNqSCxPQUFPLEVBQXVCLE9BQU8sRUFBa0IsTUFBTSxxQkFBcUIsQ0FBQztBQUduRixPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDNUMsT0FBTyxFQUFtQixhQUFhLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUkvRixNQUFNLE9BQU8sbUJBQW9CLFNBQVEsUUFBUTtJQUc3QyxZQUFZLGVBQWdDO1FBQ3hDLEtBQUssRUFBRSxDQUFDO1FBQ1IsSUFBSSxDQUFDLGVBQWUsR0FBRyxlQUFlLENBQUM7SUFDM0MsQ0FBQztJQUVNLGNBQWMsQ0FBYSxVQUFrQjtRQUNoRCxpRkFBaUY7UUFDakYsOEVBQThFO1FBQzlFLE9BQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEVBQUUsVUFBVSxFQUFFLFNBQVMsQ0FBTSxDQUFDO0lBQzlELENBQUM7SUFFTSxjQUFjLENBQWEsVUFBa0IsRUFBRSxLQUFRLEVBQUUsUUFBa0I7UUFDOUUsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLG1CQUFtQixFQUFFLENBQUM7UUFDcEUsSUFBSSxJQUFJLENBQUMsZUFBZSxDQUFDLFlBQVksRUFBRSxFQUFFO1lBQ3JDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztTQUN0QztRQUVELElBQUksWUFBWSxHQUFHLEVBQUUsQ0FBQztRQUN0Qix1RUFBdUU7UUFDdkUsZ0JBQWdCLENBQUMsT0FBTyxDQUFD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