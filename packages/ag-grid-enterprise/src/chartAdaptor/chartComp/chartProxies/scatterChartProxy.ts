import { ChartBuilder } from "../../builder/chartBuilder";
import { ChartType, ScatterChartOptions, ScatterSeriesOptions } from "ag-grid-community";
import { ChartProxy, ChartProxyParams, UpdateChartParams } from "./chartProxy";
import { CartesianChart } from "../../../charts/chart/cartesianChart";
import { ScatterSeries } from "../../../charts/chart/series/scatterSeries";
import { ChartModel } from "../chartModel";

export class ScatterChartProxy extends ChartProxy {
    private readonly chartOptions: ScatterChartOptions;

    public constructor(params: ChartProxyParams) {
        super(params);

        this.chartOptions = this.getChartOptions(ChartType.Scatter, this.defaultOptions()) as ScatterChartOptions;
        this.chart = ChartBuilder.createScatterChart(this.chartOptions);
    }

    public update(params: UpdateChartParams): void {
        if (params.fields.length === 0) {
            this.chart.removeAllSeries();
            return;
        }

        const scatterChart = this.chart as CartesianChart;
        const fieldIds = params.fields.map(f => f.colId);

        const existingSeriesMap: { [id: string]: ScatterSeries } = {};

        const updateSeries = (scatterSeries: ScatterSeries) => {
            const id = scatterSeries.yField as string;
            const seriesExists = fieldIds.indexOf(id) > -1;
            seriesExists ? existingSeriesMap[id] = scatterSeries : scatterChart.removeSeries(scatterSeries);
        };

        scatterChart.series
            .map(series => series as ScatterSeries)
            .forEach(updateSeries);

        const chart = this.chart as CartesianChart;
        if (params.categoryId === ChartModel.DEFAULT_CATEGORY) {
            chart.xAxis.labelRotation = 0;
        } else {
            chart.xAxis.labelRotation = this.chartOptions.xAxis.labelRotation as number;
        }

        params.fields.forEach((f: { colId: string, displayName: string }, index: number) => {
            const seriesOptions = this.chartOptions.seriesDefaults as ScatterSeriesOptions;

            const existingSeries = existingSeriesMap[f.colId];
            const scatterSeries = existingSeries ? existingSeries : ChartBuilder.createSeries(seriesOptions) as ScatterSeries;

            if (scatterSeries) {
                scatterSeries.title = f.displayName;
                scatterSeries.data = params.data;
                scatterSeries.xField = params.categoryId;
                scatterSeries.yField = f.colId;

                const palette = this.overriddenPalette ? this.overriddenPalette : this.chartProxyParams.getSelectedPalette();

                const fills = palette.fills;
                scatterSeries.fill = fills[index % fills.length];

                const strokes = palette.strokes;
                scatterSeries.stroke = strokes[index % strokes.length];

                if (!existingSeries) {
                    scatterChart.addSeries(scatterSeries);
                }
            }
        });
    }

    private defaultOptions(): ScatterChartOptions {
        const palette = this.chartProxyParams.getSelectedPalette();

        return {
            parent: this.chartProxyParams.parentElement,
            width: this.chartProxyParams.width,
            height: this.chartProxyParams.height,
            background: {
                fill: this.getBackgroundColor()
            },
            padding: {
                top: 20,
                right: 20,
                bottom: 20,
                left: 20
            },
            xAxis: {
                type: 'category',
                labelFontStyle: undefined,
                labelFontWeight: undefined,
                labelFontSize: 12,
                labelFontFamily: 'Verdana, sans-serif',
                labelColor: this.getLabelColor(),
                labelRotation: 0,
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
                labelFontStyle: undefined,
                labelFontWeight: undefined,
                labelFontSize: 12,
                labelFontFamily: 'Verdana, sans-serif',
                labelColor: this.getLabelColor(),
                labelRotation: 0,
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
                enabled: true,
                labelFontStyle: undefined,
                labelFontWeight: undefined,
                labelFontSize: 12,
                labelFontFamily: 'Verdana, sans-serif',
                labelColor: this.getLabelColor(),
                itemPaddingX: 16,
                itemPaddingY: 8,
                markerPadding: 4,
                markerSize: 14,
                markerStrokeWidth: 1
            },
            seriesDefaults: {
                type: 'scatter',
                fills: palette.fills,
                strokes: palette.strokes,
                strokeWidth: 3,
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
