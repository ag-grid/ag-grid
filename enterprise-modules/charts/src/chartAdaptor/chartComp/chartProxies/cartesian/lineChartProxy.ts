import {CartesianChartOptions, LineSeriesOptions} from "@ag-grid-community/core";
import {
    CartesianChart,
    ChartBuilder,
    LineSeries,
    LineSeriesOptions as InternalLineSeriesOptions
} from "ag-charts-community";
import {ChartProxyParams, UpdateChartParams} from "../chartProxy";
import {CartesianChartProxy} from "./cartesianChartProxy";
import {isDate} from '../../typeChecker';

export class LineChartProxy extends CartesianChartProxy<LineSeriesOptions> {
    public constructor(params: ChartProxyParams) {
        super(params);

        this.initChartOptions();
        this.recreateChart();
    }

    protected createChart(options?: CartesianChartOptions<LineSeriesOptions>): CartesianChart {
        const { grouping, parentElement } = this.chartProxyParams;

        return ChartBuilder[grouping ? "createGroupedLineChart" : "createLineChart"](parentElement, options || this.chartOptions);
    }

    public update(params: UpdateChartParams): void {
        this.chartProxyParams.grouping = params.grouping;

        if (params.fields.length === 0) {
            this.chart.removeAllSeries();
            return;
        }

        const testDatum = params.data[0];
        const testValue = testDatum && testDatum[params.category.id];

        this.updateAxes(isDate(testValue) ? 'time' : 'category');

        const { chart } = this;
        const fieldIds = params.fields.map(f => f.colId);
        const { fills, strokes } = this.getPalette();
        const data = this.transformData(params.data, params.category.id);

        const existingSeriesById = (chart.series as LineSeries[]).reduceRight((map, series, i) => {
            const id = series.yKey;

            if (fieldIds.indexOf(id) === i) {
                map.set(id, series);
            } else {
                chart.removeSeries(series);
            }

            return map;
        }, new Map<string, LineSeries>());

        let previousSeries: LineSeries | undefined = undefined;

        params.fields.forEach((f, index) => {
            let lineSeries = existingSeriesById.get(f.colId);
            const fill = fills[index % fills.length];
            const stroke = strokes[index % strokes.length];

            if (lineSeries) {
                lineSeries.title = f.displayName;
                lineSeries.data = data;
                lineSeries.xKey = params.category.id;
                lineSeries.xName = params.category.name;
                lineSeries.yKey = f.colId;
                lineSeries.yName = f.displayName;
                lineSeries.fill = fill;
                lineSeries.stroke = fill; // this is deliberate, so that the line colours match the fills of other series
            } else {
                const { seriesDefaults } = this.chartOptions;
                const options: InternalLineSeriesOptions = {
                    ...seriesDefaults,
                    type: 'line',
                    title: f.displayName,
                    data,
                    field: {
                        xKey: params.category.id,
                        xName: params.category.name,
                        yKey: f.colId,
                        yName: f.displayName,
                    },
                    fill: {
                        ...seriesDefaults.fill,
                        color: fill,
                    },
                    stroke: {
                        ...seriesDefaults.stroke,
                        color: fill, // this is deliberate, so that the line colours match the fills of other series
                    },
                    marker: {
                        ...seriesDefaults.marker,
                        stroke
                    }
                };

                lineSeries = ChartBuilder.createSeries(options) as LineSeries;

                chart.addSeriesAfter(lineSeries, previousSeries);
            }

            previousSeries = lineSeries;
        });

        this.updateLabelRotation(params.category.id);
    }

    protected getDefaultOptions(): CartesianChartOptions<LineSeriesOptions> {
        const options = this.getDefaultCartesianChartOptions() as CartesianChartOptions<LineSeriesOptions>;

        options.xAxis.label.rotation = 335;

        options.seriesDefaults = {
            ...options.seriesDefaults,
            stroke: {
                ...options.seriesDefaults.stroke,
                width: 3,
            },
            marker: {
                enabled: true,
                type: 'circle',
                size: 6,
                strokeWidth: 1,
            },
            tooltip: {
                enabled: true,
            }
        };

        return options;
    }
}
