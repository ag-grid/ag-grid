import {ChartBuilder} from "../../builder/chartBuilder";
import {BarChartOptions, BarSeriesOptions, ChartType} from "ag-grid-community";
import {BarSeries} from "../../../charts/chart/series/barSeries";
import {ChartOptionsType, ChartProxy, ChartUpdateParams, CreateChartOptions} from "./chartProxy";
import {palettes} from "../../../charts/chart/palettes";

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

        barSeries.colors = palettes[this.options.getPalette()];
    }

    private defaultOptions(): BarChartOptions {
        return {
            parent: this.options.parentElement,
            width: this.options.width,
            height: this.options.height,
            xAxis: {
                type: 'category',
                labelColor: this.getLabelColor(),
                gridStyle: [{
                    strokeStyle: this.getAxisGridColor(),
                    lineDash: [4, 2]
                }],
            },
            yAxis: {
                type: 'number',
                labelColor: this.getLabelColor(),
                gridStyle: [{
                    strokeStyle: this.getAxisGridColor(),
                    lineDash: [4, 2]
                }],
            },
            legend: {
                labelColor: this.getLabelColor()
            },
            seriesDefaults: {
                type: 'bar',
                grouped: this.options.chartType === ChartType.GroupedBar,
                tooltip: true
            }
        };
    }
}