import {ChartBuilder} from "../../builder/chartBuilder";
import {BarChartOptions, BarSeriesOptions, ChartType} from "ag-grid-community";
import {BarSeries} from "../../../charts/chart/series/barSeries";
import {ChartProxy, CreateChartOptions} from "./ChartProxy";

export class BarChartProxy extends ChartProxy {

    public constructor(options: CreateChartOptions) {
        super(options);
    }

    public create(): ChartProxy {
        const grouped = this.options.chartType === ChartType.GroupedBar;

        let barChartOptions: BarChartOptions = this.barChartOptions(grouped);

        if (this.options.processChartOptions) {
            barChartOptions = this.options.processChartOptions({
                type: 'bar',
                options: barChartOptions
            }) as BarChartOptions;
        }

        this.chart = ChartBuilder.createBarChart(barChartOptions);

        const barSeries = ChartBuilder.createSeries(barChartOptions.seriesDefaults as BarSeriesOptions);
        if (barSeries) {
            this.chart.addSeries(barSeries);
        }

        return this;
    }

    public update(categoryId: string, fields: { colId: string, displayName: string }[], data: any[]) {
        const barSeries = this.chart.series[0] as BarSeries;

        barSeries.data = data;
        barSeries.xField = categoryId;
        barSeries.yFields = fields.map(f => f.colId);
        barSeries.yFieldNames = fields.map(f => f.displayName);

        //TODO
        // barSeries.colors = palettes[this.getPalette()];
    }


    private barChartOptions(grouped: boolean): BarChartOptions {
        const labelColor = this.options.isDarkTheme ? ChartProxy.darkLabelColour : ChartProxy.lightLabelColour;
        const axisGridColor = this.options.isDarkTheme ? ChartProxy.darkAxisColour : ChartProxy.lightAxisColour;

        return {
            parent: this.options.parentElement,
            width: this.options.width,
            height: this.options.height,
            xAxis: {
                type: 'category',
                labelColor: labelColor,
                gridStyle: [{
                    strokeStyle: axisGridColor,
                    lineDash: [4, 2]
                }],
            },
            yAxis: {
                type: 'number',
                labelColor: labelColor,
                gridStyle: [{
                    strokeStyle: axisGridColor,
                    lineDash: [4, 2]
                }],
            },
            legend: {
                labelColor: labelColor
            },
            seriesDefaults: {
                type: 'bar',
                grouped: grouped,
                tooltip: this.options.showTooltips
            }
        };
    }
}