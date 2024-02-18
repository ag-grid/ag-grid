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
        return (0, object_1.get)(this.getChart(), expression, undefined);
    }
    setChartOption(expression, value, isSilent) {
        const chartSeriesTypes = this.chartController.getChartSeriesTypes();
        if (this.chartController.isComboChart()) {
            chartSeriesTypes.push('common');
        }
        let chartOptions = {};
        // we need to update chart options on each series type for combo charts
        chartSeriesTypes.forEach(seriesType => {
            chartOptions = (0, object_1.deepMerge)(chartOptions, this.createChartOptions({
                seriesType,
                expression,
                value
            }));
        });
        if (!isSilent) {
            this.updateChart(chartOptions, true);
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
        return (0, object_1.get)((_a = this.getChart().axes) === null || _a === void 0 ? void 0 : _a[0], expression, undefined);
    }
    setAxisProperty(expression, value) {
        var _a;
        const chart = this.getChart();
        let chartOptions = {};
        const relevantAxes = (_a = chart.axes) === null || _a === void 0 ? void 0 : _a.filter((axis) => {
            const parts = expression.split('.');
            let current = axis;
            for (const part of parts) {
                if (!(part in current)) {
                    return false;
                }
                current = current[part];
            }
            return true;
        });
        relevantAxes === null || relevantAxes === void 0 ? void 0 : relevantAxes.forEach((axis) => {
            const updateOptions = this.getUpdateAxisOptions(axis, expression, value);
            if (updateOptions) {
                chartOptions = (0, object_1.deepMerge)(chartOptions, updateOptions);
            }
        });
        if (Object.keys(chartOptions).length > 0) {
            this.updateChart(chartOptions);
            this.raiseChartOptionsChangedEvent();
        }
    }
    getLabelRotation(axisType) {
        const axis = this.getAxis(axisType);
        return (0, object_1.get)(axis, 'label.rotation', undefined);
    }
    setLabelRotation(axisType, value) {
        const chartAxis = this.getAxis(axisType);
        if (chartAxis) {
            const chartOptions = this.getUpdateAxisOptions(chartAxis, 'label.rotation', value);
            this.updateChart(chartOptions);
            this.raiseChartOptionsChangedEvent();
        }
    }
    getSeriesOption(expression, seriesType, calculated) {
        // N.B. 'calculated' here refers to the fact that the property exists on the internal series object itself,
        // rather than the properties object. This is due to us needing to reach inside the chart itself to retrieve
        // the value, and will likely be cleaned up in a future release
        const series = this.getChart().series.find((s) => ChartOptionsService.isMatchingSeries(seriesType, s));
        return (0, object_1.get)(calculated ? series : series === null || series === void 0 ? void 0 : series.properties.toJson(), expression, undefined);
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
        const chartSeriesTypes = this.chartController.getChartSeriesTypes();
        if (this.chartController.isComboChart()) {
            chartSeriesTypes.push('common');
        }
        const validAxisTypes = ['number', 'category', 'time', 'grouped-category', 'angle-category', 'angle-number', 'radius-category', 'radius-number'];
        if (!validAxisTypes.includes(chartAxis.type)) {
            return {};
        }
        return chartSeriesTypes
            .map((seriesType) => this.createChartOptions({
            seriesType,
            expression: `axes.${chartAxis.type}.${expression}`,
            value,
        }))
            .reduce((combinedOptions, options) => (0, object_1.deepMerge)(combinedOptions, options));
    }
    getChartType() {
        return this.chartController.getChartType();
    }
    getChart() {
        return this.chartController.getChartProxy().getChart();
    }
    updateChart(chartOptions, quick = false) {
        const chartRef = this.chartController.getChartProxy().getChartRef();
        if (quick) {
            chartRef.skipAnimations();
        }
        ag_charts_community_1.AgCharts.updateDelta(chartRef, chartOptions);
    }
    createChartOptions({ seriesType, expression, value }) {
        const overrides = {};
        const chartOptions = {
            theme: {
                overrides
            }
        };
        (0, object_1.set)(overrides, `${seriesType}.${expression}`, value);
        return chartOptions;
    }
    raiseChartOptionsChangedEvent() {
        const chartModel = this.chartController.getChartModel();
        const event = {
            type: core_1.Events.EVENT_CHART_OPTIONS_CHANGED,
            chartId: chartModel.chartId,
            chartType: chartModel.chartType,
            chartThemeName: this.chartController.getChartThemeName(),
            chartOptions: chartModel.chartOptions
        };
        this.eventService.dispatchEvent(event);
    }
    static isMatchingSeries(seriesType, series) {
        return seriesTypeMapper_1.VALID_SERIES_TYPES.includes(seriesType) && series.type === seriesType;
    }
    destroy() {
        super.destroy();
    }
}
exports.ChartOptionsService = ChartOptionsService;
