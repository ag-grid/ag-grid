import { ChartBuilder } from "../../builder/chartBuilder";
import { BarChartOptions, BarSeriesOptions, ChartType } from "ag-grid-community";
import { BarSeries } from "../../../charts/chart/series/barSeries";
import { ChartProxy, ChartProxyParams, UpdateChartParams } from "./chartProxy";
import { ChartModel } from "../chartModel";
import { CartesianChart } from "../../../charts/chart/cartesianChart";

export class BarChartProxy extends ChartProxy {
    private readonly chartOptions: BarChartOptions;

    static barTypes = [ChartType.GroupedBar, ChartType.StackedBar, ChartType.NormalizedBar];
    static columnTypes = [ChartType.GroupedColumn, ChartType.StackedColumn, ChartType.NormalizedColumn];

    public constructor(params: ChartProxyParams) {
        super(params);

        this.chartOptions = this.getChartOptions(params.chartType, this.defaultOptions()) as BarChartOptions;

        if (BarChartProxy.barTypes.indexOf(params.chartType) >= 0) {
            this.chart = ChartBuilder.createBarChart(this.chartOptions);
        } else if (BarChartProxy.columnTypes.indexOf(params.chartType) >= 0) {
            this.chart = ChartBuilder.createColumnChart(this.chartOptions);
        } else {
            console.error(`Unrecognized chart type: ${params.chartType}.`);
        }

        const barSeries = ChartBuilder.createSeries(this.chartOptions.seriesDefaults as BarSeriesOptions);
        if (barSeries) {
            this.chart.addSeries(barSeries);
        }
    }

    public update(params: UpdateChartParams): void {
        const barSeries = this.chart.series[0] as BarSeries;

        barSeries.data = params.data;
        barSeries.xField = params.categoryId;
        barSeries.yFields = params.fields.map(f => f.colId);
        barSeries.yFieldNames = params.fields.map(f => f.displayName);

        const chart = this.chart as CartesianChart;
        if (params.categoryId === ChartModel.DEFAULT_CATEGORY) {
            chart.xAxis.labelRotation = 0;
        } else {
            chart.xAxis.labelRotation = this.chartOptions.xAxis.labelRotation as number;
        }

        const palette = this.overriddenPalette ? this.overriddenPalette : this.chartProxyParams.getSelectedPalette();

        barSeries.fills = palette.fills;
        barSeries.strokes = palette.strokes;
    }

    private defaultOptions(): BarChartOptions {
        const palette = this.chartProxyParams.getSelectedPalette();
        const chartType = this.chartProxyParams.chartType;

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
                labelFontStyle: undefined,
                labelFontWeight: undefined,
                labelFontSize: 12,
                labelFontFamily: 'Verdana, sans-serif',
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
                type: 'bar',
                fills: palette.fills,
                strokes: palette.strokes,
                grouped: chartType === ChartType.GroupedColumn || chartType === ChartType.GroupedBar,
                normalizedTo: (chartType === ChartType.NormalizedColumn || chartType === ChartType.NormalizedBar) ? 100 : undefined,
                strokeWidth: 1,
                tooltipEnabled: true,
                labelEnabled: false,
                labelFontStyle: undefined,
                labelFontWeight: undefined,
                labelFontSize: 12,
                labelFontFamily: 'Verdana, sans-serif',
                labelColor: this.getLabelColor(),
                tooltipRenderer: undefined,
                showInLegend: true,
                shadow: undefined
            }
        };
    }
}
