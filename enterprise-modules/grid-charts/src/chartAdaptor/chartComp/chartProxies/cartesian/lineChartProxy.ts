import { _, LineSeriesOptions, CartesianChartOptions } from "ag-grid-community";
import { ChartBuilder } from "../../../../charts/chartBuilder";
import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { LineSeries } from "../../../../charts/chart/series/lineSeries";
import { CartesianChartProxy } from "./cartesianChartProxy";
import { SeriesOptions } from "../../../../charts/chartOptions";

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
        const seriesOptions: SeriesOptions = { type: "line", ...this.chartOptions.seriesDefaults };

        (lineChart.series as LineSeries[])
            .forEach(lineSeries => {
                const id = lineSeries.yField;

                _.includes(fieldIds, id) ? existingSeriesMap[id] = lineSeries : lineChart.removeSeries(lineSeries);
            });

        params.fields.forEach((f, index) => {
            const existingSeries = existingSeriesMap[f.colId];
            const lineSeries = existingSeries || ChartBuilder.createSeries(seriesOptions) as LineSeries;

            if (lineSeries) {
                lineSeries.title = f.displayName;
                lineSeries.data = params.data;
                lineSeries.xField = params.category.id;
                lineSeries.xFieldName = params.category.name;
                lineSeries.yField = f.colId;
                lineSeries.yFieldName = f.displayName;
                lineSeries.fill = fills[index % fills.length];
                lineSeries.stroke = strokes[index % strokes.length];

                if (!existingSeries) {
                    lineChart.addSeries(lineSeries);
                }
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
