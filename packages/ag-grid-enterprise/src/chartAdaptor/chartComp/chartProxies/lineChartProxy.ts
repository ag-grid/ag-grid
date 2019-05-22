import { ChartBuilder } from "../../builder/chartBuilder";
import { LineChartOptions, LineSeriesOptions } from "ag-grid-community";
import { ChartProxy, UpdateChartParams, ChartProxyOptions } from "./chartProxy";
import { CartesianChart } from "../../../charts/chart/cartesianChart";
import { LineSeries } from "../../../charts/chart/series/lineSeries";
import borneo, { palettes } from "../../../charts/chart/palettes";

export class LineChartProxy extends ChartProxy {
    private readonly chartOptions: LineChartOptions;

    public constructor(options: ChartProxyOptions) {
        super(options);
        this.chartOptions = this.getChartOptions(this.defaultOptions()) as LineChartOptions;
        this.chart = ChartBuilder.createLineChart(this.chartOptions);
    }

    public update(params: UpdateChartParams): void {
        if (params.fields.length === 0) {
            this.chart.removeAllSeries();
            return;
        }

        const lineChart = this.chart as CartesianChart;
        const fieldIds = params.fields.map(f => f.colId);

        const existingSeriesMap: { [id: string]: LineSeries } = {};

        const updateSeries = (lineSeries: LineSeries) => {
            const id = lineSeries.yField as string;
            const seriesExists = fieldIds.indexOf(id) > -1;
            seriesExists ? existingSeriesMap[id] = lineSeries : lineChart.removeSeries(lineSeries);
        };

        lineChart.series
            .map(series => series as LineSeries)
            .forEach(updateSeries);

        params.fields.forEach((f: { colId: string, displayName: string }, index: number) => {
            const seriesOptions = this.chartOptions.seriesDefaults as LineSeriesOptions;

            const existingSeries = existingSeriesMap[f.colId];
            let lineSeries = existingSeries ? existingSeries : ChartBuilder.createSeries(seriesOptions) as LineSeries;

            if (lineSeries) {
                lineSeries.title = f.displayName;
                lineSeries.data = params.data;
                lineSeries.xField = params.categoryId;
                lineSeries.yField = f.colId;

                const fills = palettes[this.options.getPalette()].fills;
                lineSeries.fill = fills[index % fills.length];

                if (!existingSeries) {
                    lineChart.addSeries(lineSeries);
                }
            }
        });
    }

    private defaultOptions(): LineChartOptions {
        return {
            type: 'line',
            parent: this.options.parentElement,
            width: this.options.width,
            height: this.options.height,
            padding: {
                top: 20,
                right: 20,
                bottom: 20,
                left: 20
            },
            xAxis: {
                type: 'category',
                labelFont: '12px Verdana, sans-serif',
                labelColor: this.getLabelColor(),
                labelRotation: 0,
                tickSize: 6,
                tickWidth: 1,
                tickPadding: 5,
                lineColor: 'rgba(195, 195, 195, 1)',
                lineWidth: 1,
                gridStyle: [{
                    strokeStyle: this.getAxisGridColor(),
                    lineDash: [4, 2]
                }]
            },
            yAxis: {
                type: 'number',
                labelFont: '12px Verdana, sans-serif',
                labelColor: this.getLabelColor(),
                tickSize: 6,
                tickWidth: 1,
                tickPadding: 5,
                lineColor: 'rgba(195, 195, 195, 1)',
                lineWidth: 1,
                gridStyle: [{
                    strokeStyle: this.getAxisGridColor(),
                    lineDash: [4, 2]
                }]
            },
            legend: {
                labelFont: '12px Verdana, sans-serif',
                labelColor: this.getLabelColor(),
                itemPaddingX: 16,
                itemPaddingY: 8,
                markerPadding: 4,
                markerSize: 14,
                markerLineWidth: 1
            },
            seriesDefaults: {
                type: 'line',
                fill: borneo.fills[0],
                stroke: borneo.strokes[0],
                lineWidth: 3,
                marker: true,
                markerRadius: 3,
                markerLineWidth: 1,
                tooltipEnabled: true,
                tooltipRenderer: undefined,
                showInLegend: true
            }
        };
    }
}
