import { _ } from "@ag-grid-community/core";
import { _Theme, AgChart } from "ag-charts-community";
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
    getCommonChartOptions(updatedOverrides) {
        var _a, _b;
        // Only apply active overrides if chart is initialised.
        const existingOptions = this.clearThemeOverrides ? {} : (_b = (_a = this.chart) === null || _a === void 0 ? void 0 : _a.getOptions()) !== null && _b !== void 0 ? _b : {};
        const formattingPanelOverrides = this.chart != null ?
            { overrides: this.getActiveFormattingPanelOverrides() } : {};
        this.clearThemeOverrides = false;
        return Object.assign(Object.assign({}, existingOptions), { theme: Object.assign(Object.assign({}, createAgChartTheme(this.chartProxyParams, this)), (updatedOverrides ? { overrides: updatedOverrides } : formattingPanelOverrides)), container: this.chartProxyParams.parentElement, mode: 'integrated' });
    }
    getActiveFormattingPanelOverrides() {
        var _a, _b;
        if (this.clearThemeOverrides) {
            return {};
        }
        const inUseTheme = (_a = this.chart) === null || _a === void 0 ? void 0 : _a.getOptions().theme;
        return (_b = inUseTheme === null || inUseTheme === void 0 ? void 0 : inUseTheme.overrides) !== null && _b !== void 0 ? _b : {};
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhcnRQcm94eS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jaGFydHMvY2hhcnRDb21wL2NoYXJ0UHJveGllcy9jaGFydFByb3h5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxDQUFDLEVBQWdFLE1BQU0seUJBQXlCLENBQUM7QUFDMUcsT0FBTyxFQUNILE1BQU0sRUFDTixPQUFPLEVBTVYsTUFBTSxxQkFBcUIsQ0FBQztBQUU3QixPQUFPLEVBQW1CLGFBQWEsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQzNFLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUMvQyxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSxjQUFjLENBQUM7QUE0QzFFLE1BQU0sT0FBZ0IsVUFBVTtJQVU1QixZQUF5QyxnQkFBa0M7UUFBbEMscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtRQUZqRSx3QkFBbUIsR0FBRyxLQUFLLENBQUM7UUFHbEMsSUFBSSxDQUFDLEtBQUssR0FBRyxnQkFBZ0IsQ0FBQyxhQUFjLENBQUM7UUFDN0MsSUFBSSxDQUFDLFNBQVMsR0FBRyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUM7UUFDNUMsSUFBSSxDQUFDLGNBQWMsR0FBRyxnQkFBZ0IsQ0FBQyxjQUFjLENBQUM7UUFDdEQsSUFBSSxDQUFDLG1CQUFtQixHQUFHLGdCQUFnQixDQUFDLG1CQUFtQixDQUFDO1FBQ2hFLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxhQUFhLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBRXpELElBQUksSUFBSSxDQUFDLEtBQUssSUFBSSxJQUFJLEVBQUU7WUFDcEIsSUFBSSxDQUFDLEtBQUssR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLENBQUM7U0FDN0Q7YUFBTTtZQUNILG1EQUFtRDtZQUNu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