import { BeanStub, Events } from "@ag-grid-community/core";
import { AgCharts } from "ag-charts-community";
import { flatMap } from '../utils/array.mjs';
import { deepMerge, get, set } from "../utils/object.mjs";
import { VALID_SERIES_TYPES } from "../utils/seriesTypeMapper.mjs";
export class ChartOptionsService extends BeanStub {
    constructor(chartController) {
        super();
        this.chartController = chartController;
    }
    getChartOption(expression) {
        return get(this.getChart(), expression, undefined);
    }
    setChartOption(expression, value, isSilent) {
        const chartSeriesTypes = this.chartController.getChartSeriesTypes();
        if (this.chartController.isComboChart()) {
            chartSeriesTypes.push('common');
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
        if (!isSilent) {
            this.updateChart(chartOptions);
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
        return get((_a = this.getChart().axes) === null || _a === void 0 ? void 0 : _a[0], expression, undefined);
    }
    setAxisProperty(expression, value) {
        this.setAxisProperties([{ expression, value }]);
    }
    setAxisProperties(properties) {
        const chart = this.getChart();
        const chartOptions = flatMap(properties, ({ expression, value }) => {
            var _a;
            // Only apply the property to axes that declare the property on their prototype chain
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
            if (!relevantAxes)
                return [];
            return relevantAxes.map((axis) => this.getUpdateAxisOptions(axis, expression, value));
        })
            // Combine all property updates into a single merged object
            .reduce((chartOptions, axisOptions) => deepMerge(chartOptions, axisOptions), {});
        if (Object.keys(chartOptions).length > 0) {
            this.updateChart(chartOptions);
            this.raiseChartOptionsChangedEvent();
        }
    }
    getLabelRotation(axisType) {
        const axis = this.getAxis(axisType);
        return get(axis, 'label.rotation', undefined);
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
        return get(calculated ? series : series === null || series === void 0 ? void 0 : series.properties.toJson(), expression, undefined);
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
            .reduce((combinedOptions, options) => deepMerge(combinedOptions, options));
    }
    getChartType() {
        return this.chartController.getChartType();
    }
    getChart() {
        return this.chartController.getChartProxy().getChart();
    }
    updateChart(chartOptions) {
        const chartRef = this.chartController.getChartProxy().getChartRef();
        chartRef.skipAnimations();
        AgCharts.updateDelta(chartRef, chartOptions);
    }
    createChartOptions({ seriesType, expression, value }) {
        const overrides = {};
        const chartOptions = {
            theme: {
                overrides
            }
        };
        set(overrides, `${seriesType}.${expression}`, value);
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
