"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChartOptionsService = void 0;
const core_1 = require("@ag-grid-community/core");
const ag_charts_community_1 = require("ag-charts-community");
const object_1 = require("../utils/object");
const seriesTypeMapper_1 = require("../utils/seriesTypeMapper");
class ChartOptionsService extends core_1.BeanStub {
    constructor(chartController) {
        super();
        this.chartController = chartController;
    }
    getChartOption(expression) {
        // TODO: We shouldn't be reading the chart implementation directly, but right now
        // it isn't possible to either get option defaults OR retrieve themed options.
        return core_1._.get(this.getChart(), expression, undefined);
    }
    setChartOption(expression, value, isSilent) {
        const chartSeriesTypes = this.chartController.getChartSeriesTypes();
        if (this.chartController.isComboChart()) {
            chartSeriesTypes.push('cartesian');
        }
        let chartOptions = {};
        // we need to update chart options on each series type for combo charts
        chartSeriesTypes.forEach(seriesType => {
            chartOptions = object_1.deepMerge(chartOptions, this.createChartOptions({
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
        chart.waitForUpdate().then(() => func());
    }
    getAxisProperty(expression) {
        var _a;
        return core_1._.get((_a = this.getChart().axes) === null || _a === void 0 ? void 0 : _a[0], expression, undefined);
    }
    setAxisProperty(expression, value) {
        var _a;
        // update axis options
        const chart = this.getChart();
        let chartOptions = {};
        (_a = chart.axes) === null || _a === void 0 ? void 0 : _a.forEach((axis) => {
            chartOptions = object_1.deepMerge(chartOptions, this.getUpdateAxisOptions(axis, expression, value));
        });
        this.updateChart(chartOptions);
        this.raiseChartOptionsChangedEvent();
    }
    getLabelRotation(axisType) {
        const axis = this.getAxis(axisType);
        return core_1._.get(axis, 'label.rotation', undefined);
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
        return core_1._.get(series, expression, undefined);
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
        const seriesType = seriesTypeMapper_1.getSeriesType(this.getChartType());
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
        ag_charts_community_1.AgChart.updateDelta(chartRef, chartOptions);
    }
    createChartOptions({ seriesType, expression, value }) {
        const overrides = {};
        const chartOptions = {
            theme: {
                overrides
            }
        };
        core_1._.set(overrides, `${seriesType}.${expression}`, value);
        return chartOptions;
    }
    raiseChartOptionsChangedEvent() {
        const chartModel = this.chartController.getChartModel();
        const event = Object.freeze({
            type: core_1.Events.EVENT_CHART_OPTIONS_CHANGED,
            chartId: chartModel.chartId,
            chartType: chartModel.chartType,
            chartThemeName: this.chartController.getChartThemeName(),
            chartOptions: chartModel.chartOptions
        });
        this.eventService.dispatchEvent(event);
    }
    static isMatchingSeries(seriesType, series) {
        const mapTypeToImplType = (type) => type === 'column' ? 'bar' : type;
        return seriesTypeMapper_1.VALID_SERIES_TYPES.includes(seriesType) &&
            series.type === mapTypeToImplType(seriesType);
    }
    destroy() {
        super.destroy();
    }
}
exports.ChartOptionsService = ChartOptionsService;
