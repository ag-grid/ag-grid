"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ag_charts_community_1 = require("ag-charts-community");
const core_1 = require("@ag-grid-community/core");
const polarChartProxy_1 = require("./polarChartProxy");
const color_1 = require("../../utils/color");
class DoughnutChartProxy extends polarChartProxy_1.PolarChartProxy {
    constructor(params) {
        super(params);
        this.recreateChart();
    }
    createChart() {
        return ag_charts_community_1.AgChart.create({
            type: 'pie',
            container: this.chartProxyParams.parentElement,
            theme: this.chartTheme,
        });
    }
    update(params) {
        if (params.fields.length === 0) {
            this.chart.removeAllSeries();
            return;
        }
        const doughnutChart = this.chart;
        const fieldIds = params.fields.map(f => f.colId);
        const seriesMap = {};
        doughnutChart.series.forEach((series) => {
            const pieSeries = series;
            const id = pieSeries.angleKey;
            if (core_1._.includes(fieldIds, id)) {
                seriesMap[id] = pieSeries;
            }
        });
        const fills = this.chartTheme.palette.fills;
        const strokes = this.chartTheme.palette.strokes;
        const seriesOverrides = this.chartOptions[this.standaloneChartType].series;
        const numFields = params.fields.length;
        let offset = 0;
        if (this.crossFiltering) {
            params.fields.forEach((field, index) => {
                const filteredOutField = Object.assign({}, field);
                filteredOutField.colId = field.colId + '-filtered-out';
                params.data.forEach(d => {
                    d[field.colId + '-total'] = d[field.colId] + d[filteredOutField.colId];
                    d[field.colId] = d[field.colId] / d[field.colId + '-total'];
                    d[filteredOutField.colId] = 1;
                });
                const { updatedOffset, pieSeries } = this.updateSeries({
                    seriesMap,
                    angleField: field,
                    field: filteredOutField,
                    seriesDefaults: seriesOverrides,
                    index,
                    params,
                    fills,
                    strokes,
                    doughnutChart,
                    offset,
                    numFields,
                    opaqueSeries: undefined
                });
                this.updateSeries({
                    seriesMap,
                    angleField: field,
                    field: field,
                    seriesDefaults: seriesOverrides,
                    index,
                    params,
                    fills,
                    strokes,
                    doughnutChart,
                    offset,
                    numFields,
                    opaqueSeries: pieSeries
                });
                offset = updatedOffset;
            });
        }
        else {
            params.fields.forEach((f, index) => {
                const { updatedOffset } = this.updateSeries({
                    seriesMap,
                    angleField: f,
                    field: f,
                    seriesDefaults: seriesOverrides,
                    index,
                    params,
                    fills,
                    strokes,
                    doughnutChart,
                    offset,
                    numFields,
                    opaqueSeries: undefined
                });
                offset = updatedOffset;
            });
        }
        // Because repaints are automatic, it's important to remove/add/update series at once,
        // so that we don't get painted twice.
        doughnutChart.series = core_1._.values(seriesMap);
    }
    updateSeries(updateParams) {
        const existingSeries = updateParams.seriesMap[updateParams.field.colId];
        const seriesOptions = Object.assign(Object.assign({}, updateParams.seriesDefaults), { type: 'pie', angleKey: this.crossFiltering ? updateParams.angleField.colId + '-total' : updateParams.angleField.colId, radiusKey: this.crossFiltering ? updateParams.field.colId : undefined, title: Object.assign(Object.assign({}, updateParams.seriesDefaults.title), { text: updateParams.seriesDefaults.title.text || updateParams.field.displayName }) });
        const pieSeries = existingSeries || ag_charts_community_1.AgChart.createComponent(seriesOptions, 'pie.series');
        if (pieSeries.title) {
            pieSeries.title.showInLegend = updateParams.numFields > 1;
        }
        if (!existingSeries) {
            if (this.crossFiltering && !pieSeries.tooltip.renderer) {
                // only add renderer if user hasn't provided one
                this.addCrossFilteringTooltipRenderer(pieSeries);
            }
        }
        pieSeries.angleName = updateParams.field.displayName;
        pieSeries.labelKey = updateParams.params.category.id;
        pieSeries.labelName = updateParams.params.category.name;
        pieSeries.data = updateParams.params.data;
        if (this.crossFiltering) {
            pieSeries.radiusMin = 0;
            pieSeries.radiusMax = 1;
            const isOpaqueSeries = !updateParams.opaqueSeries;
            if (isOpaqueSeries) {
                pieSeries.fills = updateParams.fills.map(fill => color_1.hexToRGBA(fill, '0.3'));
                pieSeries.strokes = updateParams.strokes.map(stroke => color_1.hexToRGBA(stroke, '0.3'));
                pieSeries.showInLegend = false;
            }
            else {
                updateParams.doughnutChart.legend.addEventListener('click', (event) => {
                    if (updateParams.opaqueSeries) {
                        updateParams.opaqueSeries.toggleSeriesItem(event.itemId, event.enabled);
                    }
                });
                pieSeries.fills = updateParams.fills;
                pieSeries.strokes = updateParams.strokes;
                pieSeries.callout.colors = updateParams.strokes;
            }
            // disable series highlighting by default
            pieSeries.highlightStyle.fill = undefined;
            pieSeries.addEventListener('nodeClick', this.crossFilterCallback);
            updateParams.doughnutChart.tooltip.delay = 500;
        }
        else {
            pieSeries.fills = updateParams.fills;
            pieSeries.strokes = updateParams.strokes;
            pieSeries.callout.colors = updateParams.strokes;
        }
        const offsetAmount = updateParams.numFields > 1 ? 20 : 40;
        pieSeries.outerRadiusOffset = updateParams.offset;
        updateParams.offset -= offsetAmount;
        pieSeries.innerRadiusOffset = updateParams.offset;
        updateParams.offset -= offsetAmount;
        if (!existingSeries) {
            updateParams.seriesMap[updateParams.field.colId] = pieSeries;
        }
        return { updatedOffset: updateParams.offset, pieSeries };
    }
}
exports.DoughnutChartProxy = DoughnutChartProxy;
//# sourceMappingURL=doughnutChartProxy.js.map