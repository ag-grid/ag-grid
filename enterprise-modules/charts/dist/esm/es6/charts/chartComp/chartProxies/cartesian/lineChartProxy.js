import { AgChart, ChartAxisPosition } from "ag-charts-community";
import { CartesianChartProxy } from "./cartesianChartProxy";
import { deepMerge } from "../../utils/object";
export class LineChartProxy extends CartesianChartProxy {
    constructor(params) {
        super(params);
        this.xAxisType = params.grouping ? 'groupedCategory' : 'category';
        this.yAxisType = 'number';
        this.recreateChart();
    }
    createChart() {
        return AgChart.create({
            type: 'line',
            container: this.chartProxyParams.parentElement,
            theme: this.chartTheme,
            axes: this.getAxes()
        });
    }
    update(params) {
        if (params.fields.length === 0) {
            this.chart.removeAllSeries();
            return;
        }
        this.updateAxes(params);
        const chart = this.chart;
        const { fields } = params;
        const fieldIds = fields.map(f => f.colId);
        const data = this.transformData(params.data, params.category.id);
        const existingSeriesById = chart.series.reduceRight((map, series, i) => {
            const id = series.yKey;
            (fieldIds.indexOf(id) === i) ? map.set(id, series) : chart.removeSeries(series);
            return map;
        }, new Map());
        let previousSeries;
        let { fills, strokes } = this.chartTheme.palette;
        fields.forEach((f, index) => {
            let { yKey, atLeastOneSelectedPoint } = this.processDataForCrossFiltering(data, f.colId, params);
            let lineSeries = existingSeriesById.get(f.colId);
            const fill = fills[index % fills.length];
            const stroke = strokes[index % strokes.length];
            if (lineSeries) {
                lineSeries.title = f.displayName;
                lineSeries.data = data;
                lineSeries.xKey = params.category.id;
                lineSeries.xName = params.category.name;
                lineSeries.yKey = yKey;
                lineSeries.yName = f.displayName;
                lineSeries.marker.fill = fill;
                lineSeries.marker.stroke = stroke;
                lineSeries.stroke = fill; // this is deliberate, so that the line colours match the fills of other series
            }
            else {
                const seriesOverrides = this.chartOptions[this.standaloneChartType].series;
                const seriesOptions = Object.assign(Object.assign({}, seriesOverrides), { type: 'line', title: f.displayName, data, xKey: params.category.id, xName: params.category.name, yKey: yKey, yName: f.displayName, stroke: fill, marker: Object.assign(Object.assign({}, seriesOverrides.marker), { fill,
                        stroke }) });
                lineSeries = AgChart.createComponent(seriesOptions, 'line.series');
                chart.addSeriesAfter(lineSeries, previousSeries);
            }
            this.updateSeriesForCrossFiltering(lineSeries, f.colId, chart, params, atLeastOneSelectedPoint);
            previousSeries = lineSeries;
        });
        this.updateLabelRotation(params.category.id);
    }
    getAxes() {
        const axisOptions = this.getAxesOptions();
        return [
            Object.assign(Object.assign({}, deepMerge(axisOptions[this.xAxisType], axisOptions[this.xAxisType].bottom)), { type: this.xAxisType, position: ChartAxisPosition.Bottom }),
            Object.assign(Object.assign({}, deepMerge(axisOptions[this.yAxisType], axisOptions[this.yAxisType].left)), { type: this.yAxisType, position: ChartAxisPosition.Left }),
        ];
    }
}
//# sourceMappingURL=lineChartProxy.js.map