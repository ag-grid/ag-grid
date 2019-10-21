import { _, LineSeriesOptions, CartesianChartOptions } from "@ag-community/grid-core";
import { ChartBuilder } from "../../../../charts/chartBuilder";
import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { LineSeries } from "../../../../charts/chart/series/lineSeries";
import { CartesianChartProxy } from "./cartesianChartProxy";
import { LineSeriesOptions as InternalLineSeriesOptions } from "../../../../charts/chartOptions";

export class LineChartProxy extends CartesianChartProxy<LineSeriesOptions> {
    public constructor(params: ChartProxyParams) {
        super(params);

        this.initChartOptions();
        this.chart = ChartBuilder[params.grouping ? "createGroupedLineChart" : "createLineChart"](params.parentElement, this.chartOptions);
    }

    public update(params: UpdateChartParams): void {
        if (params.fields.length === 0) {
            this.chart.removeAllSeries();
            return;
        }

        const lineChart = this.chart;
        const fieldIds = params.fields.map(f => f.colId);
        const existingSeriesMap: { [id: string]: LineSeries } = {};
        const { fills, strokes } = this.overriddenPalette || this.chartProxyParams.getSelectedPalette();

        (lineChart.series as LineSeries[])
            .forEach(lineSeries => {
                const id = lineSeries.yKey;

                _.includes(fieldIds, id) ? existingSeriesMap[id] = lineSeries : lineChart.removeSeries(lineSeries);
            });

        params.fields.forEach((f, index) => {
            let lineSeries = existingSeriesMap[f.colId];

            if (lineSeries) {
                const fill = fills[index % fills.length];
                const stroke = strokes[index % strokes.length];

                lineSeries.title = f.displayName;
                lineSeries.data = params.data;
                lineSeries.xKey = params.category.id;
                lineSeries.xName = params.category.name;
                lineSeries.yKey = f.colId;
                lineSeries.yName = f.displayName;
                lineSeries.fill = fill;
                lineSeries.marker.fill = fill;
                lineSeries.stroke = stroke;
                lineSeries.marker.stroke = stroke;
            } else {
                const { seriesDefaults } = this.chartOptions;
                const options: InternalLineSeriesOptions = {
                    ...seriesDefaults,
                    type: 'line',
                    title: f.displayName,
                    data: params.data,
                    field: {
                        xKey: params.category.id,
                        xName: params.category.name,
                        yKey: f.colId,
                        yName: f.displayName,
                    },
                    fill: {
                        ...seriesDefaults.fill,
                        color: fills[index % fills.length],
                    },
                    stroke: {
                        ...seriesDefaults.stroke,
                        color: strokes[index % strokes.length],
                    },
                };

                lineSeries = ChartBuilder.createSeries(options) as LineSeries;
            }

            lineChart.addSeries(lineSeries);
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
                size: 3,
                strokeWidth: 1,
            },
            tooltip: {
                enabled: true,
            },
        };

        return options;
    }
}
