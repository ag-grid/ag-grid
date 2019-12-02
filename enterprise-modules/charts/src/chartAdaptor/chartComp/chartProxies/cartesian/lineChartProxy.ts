import { _, LineSeriesOptions, CartesianChartOptions } from "@ag-grid-community/core";
import { ChartBuilder } from "../../../../charts/chartBuilder";
import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { LineSeries } from "../../../../charts/chart/series/cartesian/lineSeries";
import { CartesianChartProxy } from "./cartesianChartProxy";
import { LineSeriesOptions as InternalLineSeriesOptions } from "../../../../charts/chartOptions";
import { CartesianChart } from "../../../../charts/chart/cartesianChart";
import { TimeAxis } from "../../../../charts/chart/axis/timeAxis";
import { CategoryAxis } from "../../../../charts/chart/axis/categoryAxis";
import { isDate } from '../../typeChecker';

export class LineChartProxy extends CartesianChartProxy<LineSeriesOptions> {
    public constructor(params: ChartProxyParams) {
        super(params);

        this.initChartOptions();
        this.recreateChart();
    }

    protected createChart(options: CartesianChartOptions<LineSeriesOptions>): CartesianChart {
        const { grouping, parentElement } = this.chartProxyParams;

        return ChartBuilder[grouping ? "createGroupedLineChart" : "createLineChart"](parentElement, options);
    }

    public update(params: UpdateChartParams): void {
        const { chart } = this;

        if (params.fields.length === 0) {
            chart.removeAllSeries();
            return;
        }

        this.updateAxes(params.data[0], params.category.id);

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
                lineSeries.marker.fill = fill;
                lineSeries.marker.stroke = stroke;
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
                        fill,
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

    private updateAxes(testDatum: any, categoryKey: string): void {
        const { chartOptions } = this;

        if (chartOptions.xAxis.type || !testDatum) { return; }

        const value = testDatum[categoryKey];

        if (!value) { return; }

        const xAxis = this.chart.axes.filter(a => a.position === 'bottom')[0];

        if (!xAxis) { return; }

        const categoryIsDate = isDate(value);

        if (categoryIsDate && !(xAxis instanceof TimeAxis)) {
            const options: CartesianChartOptions<LineSeriesOptions> = {
                ...this.chartOptions,
                xAxis: {
                    ...this.chartOptions.xAxis,
                    type: 'time',
                }
            };

            this.recreateChart(options);
        } else if (!categoryIsDate && !(xAxis instanceof CategoryAxis)) {
            this.recreateChart();
        }
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
