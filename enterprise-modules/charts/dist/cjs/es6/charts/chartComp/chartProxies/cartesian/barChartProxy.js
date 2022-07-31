"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@ag-grid-community/core");
const ag_charts_community_1 = require("ag-charts-community");
const cartesianChartProxy_1 = require("./cartesianChartProxy");
const object_1 = require("../../utils/object");
const color_1 = require("../../utils/color");
class BarChartProxy extends cartesianChartProxy_1.CartesianChartProxy {
    constructor(params) {
        super(params);
        // when the standalone chart type is 'bar' - xAxis is positioned to the 'left'
        this.xAxisType = params.grouping ? 'groupedCategory' : 'category';
        this.yAxisType = 'number';
        this.recreateChart();
    }
    getData(params) {
        return this.getDataTransformedData(params);
    }
    getAxes() {
        const isBar = this.standaloneChartType === 'bar';
        const axisOptions = this.getAxesOptions();
        let axes = [
            Object.assign(Object.assign({}, object_1.deepMerge(axisOptions[this.xAxisType], axisOptions[this.xAxisType].bottom)), { type: this.xAxisType, position: isBar ? ag_charts_community_1.ChartAxisPosition.Left : ag_charts_community_1.ChartAxisPosition.Bottom }),
            Object.assign(Object.assign({}, object_1.deepMerge(axisOptions[this.yAxisType], axisOptions[this.yAxisType].left)), { type: this.yAxisType, position: isBar ? ag_charts_community_1.ChartAxisPosition.Bottom : ag_charts_community_1.ChartAxisPosition.Left }),
        ];
        // special handling to add a default label formatter to show '%' for normalized charts if none is provided
        if (this.isNormalised()) {
            const numberAxis = axes[1];
            numberAxis.label = Object.assign(Object.assign({}, numberAxis.label), { formatter: (params) => Math.round(params.value) + '%' });
        }
        return axes;
    }
    getSeries(params) {
        const groupedCharts = ['groupedColumn', 'groupedBar'];
        const isGrouped = !this.crossFiltering && core_1._.includes(groupedCharts, this.chartType);
        const series = params.fields.map(f => (Object.assign(Object.assign({}, this.extractSeriesOverrides()), { type: this.standaloneChartType, grouped: isGrouped, normalizedTo: this.isNormalised() ? 100 : undefined, xKey: params.category.id, xName: params.category.name, yKey: f.colId, yName: f.displayName })));
        return this.crossFiltering ? this.extractCrossFilterSeries(series) : series;
    }
    extractCrossFilterSeries(series) {
        const palette = this.chartTheme.palette;
        const updatePrimarySeries = (seriesOptions, index) => {
            return Object.assign(Object.assign({}, seriesOptions), { highlightStyle: { item: { fill: undefined } }, fill: palette.fills[index], stroke: palette.strokes[index], listeners: Object.assign(Object.assign({}, this.extractSeriesOverrides().listeners), { nodeClick: this.crossFilterCallback }) });
        };
        const updateFilteredOutSeries = (seriesOptions) => {
            const yKey = seriesOptions.yKey + '-filtered-out';
            return Object.assign(Object.assign({}, object_1.deepMerge({}, seriesOptions)), { yKey, fill: color_1.hexToRGBA(seriesOptions.fill, '0.3'), stroke: color_1.hexToRGBA(seriesOptions.stroke, '0.3'), hideInLegend: [yKey] });
        };
        const allSeries = [];
        for (let i = 0; i < series.length; i++) {
            // update primary series
            const primarySeries = updatePrimarySeries(series[i], i);
            allSeries.push(primarySeries);
            // add 'filtered-out' series
            allSeries.push(updateFilteredOutSeries(primarySeries));
        }
        return allSeries;
    }
    isNormalised() {
        const normalisedCharts = ['normalizedColumn', 'normalizedBar'];
        return !this.crossFiltering && core_1._.includes(normalisedCharts, this.chartType);
    }
}
exports.BarChartProxy = BarChartProxy;
