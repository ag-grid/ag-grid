import { AgChart } from "ag-charts-community";
import { PolarChartProxy } from "./polarChartProxy";
import { changeOpacity } from "../../utils/color";
export class PieChartProxy extends PolarChartProxy {
    constructor(params) {
        super(params);
        this.recreateChart();
    }
    createChart() {
        return AgChart.create({
            type: 'pie',
            container: this.chartProxyParams.parentElement,
            theme: this.chartTheme,
        });
    }
    update(params) {
        const { chart } = this;
        if (params.fields.length === 0) {
            chart.removeAllSeries();
            return;
        }
        const field = params.fields[0];
        const angleField = field;
        if (this.crossFiltering) {
            // add additional filtered out field
            let fields = params.fields;
            fields.forEach(field => {
                const crossFilteringField = Object.assign({}, field);
                crossFilteringField.colId = field.colId + '-filtered-out';
                fields.push(crossFilteringField);
            });
            const filteredOutField = fields[1];
            params.data.forEach(d => {
                d[field.colId + '-total'] = d[field.colId] + d[filteredOutField.colId];
                d[field.colId] = d[field.colId] / d[field.colId + '-total'];
                d[filteredOutField.colId] = 1;
            });
            let opaqueSeries = chart.series[1];
            let radiusField = filteredOutField;
            opaqueSeries = this.updateSeries(chart, opaqueSeries, angleField, radiusField, params, undefined);
            radiusField = angleField;
            const filteredSeries = chart.series[0];
            this.updateSeries(chart, filteredSeries, angleField, radiusField, params, opaqueSeries);
        }
        else {
            const series = chart.series[0];
            this.updateSeries(chart, series, angleField, angleField, params, undefined);
        }
    }
    updateSeries(chart, series, angleField, field, params, opaqueSeries) {
        const existingSeriesId = series && series.angleKey;
        const seriesOverrides = this.chartOptions[this.standaloneChartType].series;
        let pieSeries = series;
        if (existingSeriesId !== field.colId) {
            chart.removeSeries(series);
            const options = Object.assign(Object.assign({}, seriesOverrides), { type: 'pie', angleKey: this.crossFiltering ? angleField.colId + '-total' : angleField.colId, radiusKey: this.crossFiltering ? field.colId : undefined });
            pieSeries = AgChart.createComponent(options, 'pie.series');
            pieSeries.fills = this.chartTheme.palette.fills;
            pieSeries.strokes = this.chartTheme.palette.strokes;
            pieSeries.callout.colors = this.chartTheme.palette.strokes;
            if (this.crossFiltering && pieSeries && !pieSeries.tooltip.renderer) {
                // only add renderer if user hasn't provided one
                this.addCrossFilteringTooltipRenderer(pieSeries);
            }
        }
        pieSeries.angleName = field.displayName;
        pieSeries.labelKey = params.category.id;
        pieSeries.labelName = params.category.name;
        pieSeries.data = params.data;
        if (this.crossFiltering) {
            pieSeries.radiusMin = 0;
            pieSeries.radiusMax = 1;
            const isOpaqueSeries = !opaqueSeries;
            if (isOpaqueSeries) {
                pieSeries.fills = changeOpacity(pieSeries.fills, 0.3);
                pieSeries.strokes = changeOpacity(pieSeries.strokes, 0.3);
                pieSeries.callout.colors = changeOpacity(pieSeries.strokes, 0.3);
                pieSeries.showInLegend = false;
            }
            else {
                chart.legend.addEventListener('click', (event) => {
                    if (opaqueSeries) {
                        opaqueSeries.toggleSeriesItem(event.itemId, event.enabled);
                    }
                });
            }
            chart.tooltip.delay = 500;
            // disable series highlighting by default
            pieSeries.highlightStyle.fill = undefined;
            pieSeries.addEventListener("nodeClick", this.crossFilterCallback);
        }
        chart.addSeries(pieSeries);
        return pieSeries;
    }
}
//# sourceMappingURL=pieChartProxy.js.map