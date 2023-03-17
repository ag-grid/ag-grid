import { _ } from "@ag-grid-community/core";
import { AgChart, _Theme } from "ag-charts-community";
import { getSeriesType } from "../utils/seriesTypeMapper";
import { deproxy } from "../utils/integration";
import { createAgChartTheme, lookupCustomChartTheme } from './chartTheme';
export class ChartProxy {
    constructor(chartProxyParams) {
        this.chartProxyParams = chartProxyParams;
        this.clearThemeOverrides = false;
        this.chart = chartProxyParams.chartInstance;
        this.chartType = chartProxyParams.chartType;
        this.crossFiltering = chartProxyParams.crossFiltering;
        this.crossFilterCallback = chartProxyParams.crossFilterCallback;
        this.standaloneChartType = getSeriesType(this.chartType);
        if (this.chart == null) {
            this.chart = AgChart.create(this.getCommonChartOptions());
        }
        else {
            // On chart change, reset formatting panel changes.
            this.clearThemeOverrides = true;
        }
    }
    getChart() {
        return deproxy(this.chart);
    }
    getChartRef() {
        return this.chart;
    }
    downloadChart(dimensions, fileName, fileFormat) {
        const { chart } = this;
        const rawChart = deproxy(chart);
        const imageFileName = fileName || (rawChart.title ? rawChart.title.text : 'chart');
        const { width, height } = dimensions || {};
        AgChart.download(chart, { width, height, fileName: imageFileName, fileFormat });
    }
    getChartImageDataURL(type) {
        return this.getChart().scene.getDataURL(type);
    }
    getChartOptions() {
        return this.chart.getOptions();
    }
    getChartThemeOverrides() {
        var _a;
        const chartOptionsTheme = this.getChartOptions().theme;
        return (_a = chartOptionsTheme.overrides) !== null && _a !== void 0 ? _a : {};
    }
    getChartPalette() {
        return _Theme.getChartTheme(this.getChartOptions().theme).palette;
    }
    setPaired(paired) {
        // Special handling to make scatter charts operate in paired mode by default, where 
        // columns alternate between being X and Y (and size for bubble). In standard mode,
        // the first column is used for X and every other column is treated as Y
        // (or alternates between Y and size for bubble)
        const seriesType = getSeriesType(this.chartProxyParams.chartType);
        AgChart.updateDelta(this.chart, { theme: { overrides: { [seriesType]: { paired } } } });
    }
    isPaired() {
        const seriesType = getSeriesType(this.chartProxyParams.chartType);
        return _.get(this.getChartThemeOverrides(), `${seriesType}.paired`, true);
    }
    lookupCustomChartTheme(themeName) {
        return lookupCustomChartTheme(this.chartProxyParams, themeName);
    }
    transformData(data, categoryKey, categoryAxis) {
        if (categoryAxis) {
            // replace the values for the selected category with a complex object to allow for duplicated categories
            return data.map((d, index) => {
                const value = d[categoryKey];
                const valueString = value && value.toString ? value.toString() : '';
                const datum = Object.assign({}, d);
                datum[categoryKey] = { id: index, value, toString: () => valueString };
                return datum;
            });
        }
        return data;
    }
    getCommonChartOptions() {
        var _a, _b;
        // Only apply active overrides if chart is initialised.
        const existingOptions = this.clearThemeOverrides ? {} : (_b = (_a = this.chart) === null || _a === void 0 ? void 0 : _a.getOptions()) !== null && _b !== void 0 ? _b : {};
        const formattingPanelOverrides = this.chart != null ?
            { overrides: this.getActiveFormattingPanelOverrides() } : {};
        this.clearThemeOverrides = false;
        return Object.assign(Object.assign({}, existingOptions), { theme: Object.assign(Object.assign({}, createAgChartTheme(this.chartProxyParams, this)), formattingPanelOverrides), container: this.chartProxyParams.parentElement, mode: 'integrated' });
    }
    getActiveFormattingPanelOverrides() {
        var _a, _b;
        if (this.clearThemeOverrides) {
            return {};
        }
        const inUseTheme = (_a = this.chart) === null || _a === void 0 ? void 0 : _a.getOptions().theme;
        const overrides = (_b = inUseTheme === null || inUseTheme === void 0 ? void 0 : inUseTheme.overrides) !== null && _b !== void 0 ? _b : {};
        return overrides;
    }
    destroy({ keepChartInstance = false } = {}) {
        if (keepChartInstance) {
            return this.chart;
        }
        this.destroyChart();
    }
    destroyChart() {
        if (this.chart) {
            this.chart.destroy();
            this.chart = undefined;
        }
    }
}
