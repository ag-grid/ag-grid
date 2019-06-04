import { ChartBuilder } from "../../builder/chartBuilder";
import { LineChartOptions, LineSeriesOptions } from "ag-grid-community";
import { ChartProxy, ChartProxyParams, UpdateChartParams } from "./chartProxy";
import { CartesianChart } from "../../../charts/chart/cartesianChart";
import { LineSeries } from "../../../charts/chart/series/lineSeries";
import {ChartModel} from "../chartModel";

export class LineChartProxy extends ChartProxy {
    private readonly chartOptions: LineChartOptions;

    public constructor(params: ChartProxyParams) {
        super(params);

        const defaultOpts: LineChartOptions = this.defaultOptions();

        this.chartOptions = this.getChartOptions('line', this.defaultOptions()) as LineChartOptions;
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

        const chart = this.chart as CartesianChart;
        if (params.categoryId === ChartModel.DEFAULT_CATEGORY) {
            chart.xAxis.labelRotation = 0;
        } else {
            chart.xAxis.labelRotation = this.chartOptions.xAxis.labelRotation as number;
        }

        params.fields.forEach((f: { colId: string, displayName: string }, index: number) => {
            const seriesOptions = this.chartOptions.seriesDefaults as LineSeriesOptions;

            const existingSeries = existingSeriesMap[f.colId];
            const lineSeries = existingSeries ? existingSeries : ChartBuilder.createSeries(seriesOptions) as LineSeries;

            if (lineSeries) {
                lineSeries.title = f.displayName;
                lineSeries.data = params.data;
                lineSeries.xField = params.categoryId;
                lineSeries.yField = f.colId;

                const palette = this.overriddenPalette ? this.overriddenPalette : this.chartProxyParams.getSelectedPalette();

                const fills = palette.fills;
                lineSeries.fill = fills[index % fills.length];

                const strokes = palette.strokes;
                lineSeries.stroke = strokes[index % strokes.length];

                if (!existingSeries) {
                    lineChart.addSeries(lineSeries);
                }
            }
        });
    }

    private defaultOptions(): LineChartOptions {
        const palette = this.chartProxyParams.getSelectedPalette();

        return {
            parent: this.chartProxyParams.parentElement,
            width: this.chartProxyParams.width,
            height: this.chartProxyParams.height,
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
                labelRotation: 45,
                tickSize: 6,
                tickWidth: 1,
                tickPadding: 5,
                lineColor: 'rgba(195, 195, 195, 1)',
                lineWidth: 1,
                gridStyle: [{
                    stroke: this.getAxisGridColor(),
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
                    stroke: this.getAxisGridColor(),
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
                markerStrokeWidth: 1
            },
            seriesDefaults: {
                type: 'line',
                fills: palette.fills,
                strokes: palette.strokes,
                strokeWidth: 3,
                marker: true,
                markerSize: 6,
                markerStrokeWidth: 1,
                tooltipEnabled: true,
                tooltipRenderer: undefined,
                showInLegend: true,
                title: ''
            }
        };
    }
}
