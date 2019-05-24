import { ChartBuilder } from "../../builder/chartBuilder";
import { BarChartOptions, BarSeriesOptions, ChartType } from "ag-grid-community";
import { BarSeries } from "../../../charts/chart/series/barSeries";
import { ChartProxy, ChartProxyParams, UpdateChartParams } from "./chartProxy";

export class BarChartProxy extends ChartProxy {

    public constructor(params: ChartProxyParams) {
        super(params);

        const chartOptions = this.getChartOptions('bar', this.defaultOptions()) as BarChartOptions;

        this.chart = ChartBuilder.createBarChart(chartOptions);

        const barSeries = ChartBuilder.createSeries(chartOptions.seriesDefaults as BarSeriesOptions);
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

        const palette = this.overriddenPalette ? this.overriddenPalette : this.chartProxyParams.getSelectedPalette();

        barSeries.fills = palette.fills;
        barSeries.strokes = palette.strokes;
    }

    private defaultOptions(): BarChartOptions {
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
                type: 'bar',
                fills: palette.fills,
                strokes: palette.strokes,
                grouped: this.chartProxyParams.chartType === ChartType.GroupedBar,
                lineWidth: 1,
                tooltipEnabled: true,
                labelEnabled: false,
                labelFont: '12px Verdana, sans-serif',
                labelColor: this.getLabelColor(),
                labelPadding: {x: 10, y: 10},
                tooltipRenderer: undefined,
                showInLegend: true,
                title: '',
                titleEnabled: true,
                titleFont: 'bold 12px Verdana, sans-serif'
            }
        };
    }
}
