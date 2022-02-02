"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ag_charts_community_1 = require("ag-charts-community");
const cartesianChartProxy_1 = require("./cartesianChartProxy");
const object_1 = require("../../utils/object");
class AreaChartProxy extends cartesianChartProxy_1.CartesianChartProxy {
    constructor(params) {
        super(params);
        this.xAxisType = params.grouping ? 'groupedCategory' : 'category';
        this.yAxisType = 'number';
        this.recreateChart();
    }
    createChart() {
        return ag_charts_community_1.AgChart.create({
            type: 'area',
            container: this.chartProxyParams.parentElement,
            theme: this.chartTheme,
            axes: this.getAxes()
        });
    }
    update(params) {
        this.updateAxes(params);
        if (this.chartType === 'area') {
            // area charts have multiple series
            this.updateAreaChart(params);
        }
        else {
            // stacked and normalized has a single series
            let areaSeries = this.chart.series[0];
            if (!areaSeries) {
                const seriesDefaults = Object.assign(Object.assign({}, this.chartOptions[this.standaloneChartType].series), { type: 'area', normalizedTo: this.chartType === 'normalizedArea' ? 100 : undefined });
                areaSeries = ag_charts_community_1.AgChart.createComponent(Object.assign({}, seriesDefaults), 'area.series');
                if (!areaSeries) {
                    return;
                }
                this.chart.addSeries(areaSeries);
            }
            areaSeries.data = this.transformData(params.data, params.category.id);
            areaSeries.xKey = params.category.id;
            areaSeries.xName = params.category.name;
            areaSeries.yKeys = params.fields.map(f => f.colId);
            areaSeries.yNames = params.fields.map(f => f.displayName);
            areaSeries.fills = this.chartTheme.palette.fills;
            areaSeries.strokes = this.chartTheme.palette.strokes;
        }
        this.updateLabelRotation(params.category.id);
    }
    updateAreaChart(params) {
        const chart = this.chart;
        if (params.fields.length === 0) {
            chart.removeAllSeries();
            return;
        }
        const fieldIds = params.fields.map(f => f.colId);
        const existingSeriesById = chart.series
            .reduceRight((map, series, i) => {
            const id = series.yKeys[0];
            if (fieldIds.indexOf(id) === i) {
                map.set(id, series);
            }
            else {
                chart.removeSeries(series);
            }
            return map;
        }, new Map());
        const data = this.transformData(params.data, params.category.id);
        let previousSeries;
        let { fills, strokes } = this.chartTheme.palette;
        params.fields.forEach((f, index) => {
            let { yKey, atLeastOneSelectedPoint } = this.processDataForCrossFiltering(data, f.colId, params);
            let areaSeries = existingSeriesById.get(f.colId);
            const fill = fills[index % fills.length];
            const stroke = strokes[index % strokes.length];
            if (areaSeries) {
                areaSeries.data = data;
                areaSeries.xKey = params.category.id;
                areaSeries.xName = params.category.name;
                areaSeries.yKeys = [yKey];
                areaSeries.yNames = [f.displayName];
                areaSeries.fills = [fill];
                areaSeries.strokes = [stroke];
            }
            else {
                const seriesOverrides = this.chartOptions[this.standaloneChartType].series;
                const seriesDefaults = Object.assign(Object.assign({}, seriesOverrides), { type: 'area', normalizedTo: this.chartType === 'normalizedArea' ? 100 : undefined });
                const options = Object.assign(Object.assign({}, seriesDefaults), { data, xKey: params.category.id, xName: params.category.name, yKeys: [yKey], yNames: [f.displayName], fills: [fill], strokes: [stroke], marker: Object.assign(Object.assign({}, seriesDefaults.marker), { fill,
                        stroke }) });
                areaSeries = ag_charts_community_1.AgChart.createComponent(options, 'area.series');
                chart.addSeriesAfter(areaSeries, previousSeries);
            }
            this.updateSeriesForCrossFiltering(areaSeries, f.colId, chart, params, atLeastOneSelectedPoint);
            previousSeries = areaSeries;
        });
    }
    getAxes() {
        const axisOptions = this.getAxesOptions();
        return [
            Object.assign(Object.assign({}, object_1.deepMerge(axisOptions[this.xAxisType], axisOptions[this.xAxisType].bottom)), { type: this.xAxisType, position: ag_charts_community_1.ChartAxisPosition.Bottom, paddingInner: 1, paddingOuter: 0 }),
            Object.assign(Object.assign({}, object_1.deepMerge(axisOptions[this.yAxisType], axisOptions[this.yAxisType].left)), { type: this.yAxisType, position: ag_charts_community_1.ChartAxisPosition.Left }),
        ];
    }
}
exports.AreaChartProxy = AreaChartProxy;
//# sourceMappingURL=areaChartProxy.js.map