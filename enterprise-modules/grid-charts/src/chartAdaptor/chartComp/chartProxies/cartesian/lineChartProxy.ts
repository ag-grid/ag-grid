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
        const { chart } = this;

        if (params.fields.length === 0) {
            chart.removeAllSeries();
            return;
        }

        const fieldIds = params.fields.map(f => f.colId);
        const { fills, strokes } = this.overriddenPalette || this.chartProxyParams.getSelectedPalette();

        const existingSeriesById = (chart.series as LineSeries[]).reduceRight((map, series) => {
            const id = series.yKey;

            if (_.includes(fieldIds, id)) {
                map.set(id, series);
            } else {
                chart.removeSeries(series);
            }

            return map;
        }, new Map<string, LineSeries>());

        params.fields.forEach((f, index) => {
            let lineSeries = existingSeriesById.get(f.colId);
            const fill = fills[index % fills.length];
            const stroke = strokes[index % strokes.length];

            if (lineSeries) {
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
                        color: fill,
                    },
                    stroke: {
                        ...seriesDefaults.stroke,
                        color: stroke,
                    },
                };

                chart.addSeries(ChartBuilder.createSeries(options));
            }
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
