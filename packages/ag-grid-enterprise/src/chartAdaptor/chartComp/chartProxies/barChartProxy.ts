import { ChartBuilder } from "../../builder/chartBuilder";
import { BarChartOptions, BarSeriesOptions, ChartType } from "ag-grid-community";
import { BarSeries } from "../../../charts/chart/series/barSeries";
import { ChartOptionsType, ChartProxy, ChartUpdateParams, CreateChartOptions } from "./chartProxy";
import { palettes } from "../../../charts/chart/palettes";

export class BarChartProxy extends ChartProxy {

    public constructor(options: CreateChartOptions) {
        super(options);
    }

    public create(): ChartProxy {
        const chartOptions = this.getChartOptions(ChartOptionsType.BAR, this.defaultOptions()) as BarChartOptions;
        this.chart = ChartBuilder.createBarChart(chartOptions);

        const barSeries = ChartBuilder.createSeries(chartOptions.seriesDefaults as BarSeriesOptions);
        if (barSeries) {
            this.chart.addSeries(barSeries);
        }

        return this;
    }

    public update(params: ChartUpdateParams): void {
        const barSeries = this.chart.series[0] as BarSeries;

        barSeries.data = params.data;
        barSeries.xField = params.categoryId;
        barSeries.yFields = params.fields.map(f => f.colId);
        barSeries.yFieldNames = params.fields.map(f => f.displayName);

        barSeries.fills = palettes[this.options.getPalette()].fills;
    }

    private defaultOptions(): BarChartOptions {
        return {
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
                fills: [
                    '#f3622d',
                    '#fba71b',
                    '#57b757',
                    '#41a9c9',
                    '#4258c9',
                    '#9a42c8',
                    '#c84164',
                    '#888888'
                ],
                // strokes: [], // derived from `fills`
                grouped: this.options.chartType === ChartType.GroupedBar,
                lineWidth: 1,
                tooltip: true,
                labelFont: '12px Verdana, sans-serif',
                labelColor: this.options.isDarkTheme() ? 'rgb(221, 221, 221)' : 'black',
                labelPadding: {x: 10, y: 10},
                tooltipRenderer: undefined,
                showInLegend: true
            }
        };
    }
}
